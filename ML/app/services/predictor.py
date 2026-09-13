import io
import os
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError
from fastapi import HTTPException, UploadFile, status
from app.config import settings
from app.services.model_loader import ModelLoader


class PredictorService:
    
    # MNIST-style preprocessing + inference.

    # Reproduces the classic LeCun MNIST preprocessing pipeline:
    #   1. Convert to grayscale
    #   2. Auto-invert if background is light
    #   3. Soft threshold to remove noise / anti-aliasing haze
    #   4. Crop to bounding box of the digit
    #   5. Scale so longest side = 20 px (preserving aspect ratio)
    #   6. Paste into a 28x28 canvas (centered)
    #   7. Shift so center of mass is at (14, 14)
    #   8. Normalize to [0, 1]

    # This matches the training distribution and gives the best accuracy.
    

    TARGET_SIZE = 28
    DIGIT_SIZE = 20
    THRESHOLD = 20
    GRAYSCALE_CUTOFF = 127

    @staticmethod
    def validate_upload(file: UploadFile) -> None:
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported extension '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
            )
        if file.content_type not in settings.ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported content type '{file.content_type}'.",
            )

    @staticmethod
    def _center_by_mass(arr: np.ndarray) -> np.ndarray:
        
        # Shift the image so its center-of-mass sits at the geometric center.
        # This is the crucial MNIST step that makes the model robust to
        # where the user drew the digit on the canvas.
        
        total = float(arr.sum())
        if total == 0:
            return arr

        ys, xs = np.indices(arr.shape)
        cy = float((ys * arr).sum() / total)
        cx = float((xs * arr).sum() / total)

        target = arr.shape[0] // 2
        shift_y = int(round(target - cy))
        shift_x = int(round(target - cx))

        shifted = np.roll(np.roll(arr, shift_y, axis=0), shift_x, axis=1)

        # Clear pixels that wrapped to the opposite edge
        if shift_y > 0:
            shifted[:shift_y, :] = 0
        elif shift_y < 0:
            shifted[shift_y:, :] = 0

        if shift_x > 0:
            shifted[:, :shift_x] = 0
        elif shift_x < 0:
            shifted[:, shift_x:] = 0

        return shifted

    @staticmethod
    def _mnist_preprocess(image: Image.Image) -> np.ndarray:
        # 1. Grayscale
        image = image.convert("L")

        # 2. Auto-invert if background is light
        arr = np.array(image, dtype=np.uint8)
        if arr.mean() > PredictorService.GRAYSCALE_CUTOFF:
            image = ImageOps.invert(image)
            arr = np.array(image, dtype=np.uint8)

        # 3. Soft threshold: clip near-black to 0
        arr = np.where(
            arr < PredictorService.THRESHOLD, 0, arr
        ).astype(np.uint8)

        # 4. Bounding box of the digit
        coords = np.argwhere(arr > 0)
        if coords.size == 0:
            return np.zeros((1, 28, 28, 1), dtype="float32")

        y0, x0 = coords.min(axis=0)
        y1, x1 = coords.max(axis=0) + 1
        digit = arr[y0:y1, x0:x1]

        # 5. Resize so longest side = 20 px, preserving aspect ratio
        h, w = digit.shape
        if h > w:
            new_h = PredictorService.DIGIT_SIZE
            new_w = max(1, int(round(w * PredictorService.DIGIT_SIZE / h)))
        else:
            new_w = PredictorService.DIGIT_SIZE
            new_h = max(1, int(round(h * PredictorService.DIGIT_SIZE / w)))

        # BILINEAR is gentler than LANCZOS on thin strokes
        digit_img = Image.fromarray(digit).resize(
            (new_w, new_h), Image.Resampling.BILINEAR
        )
        digit_arr = np.array(digit_img, dtype=np.float32)

        # 6. Paste centered on 28x28 canvas
        canvas = np.zeros(
            (PredictorService.TARGET_SIZE, PredictorService.TARGET_SIZE),
            dtype=np.float32,
        )
        top = (PredictorService.TARGET_SIZE - new_h) // 2
        left = (PredictorService.TARGET_SIZE - new_w) // 2
        canvas[top:top + new_h, left:left + new_w] = digit_arr

        # 7. Recenter by TRUE center of mass
        canvas = PredictorService._center_by_mass(canvas)

        # 8. Normalize to [0, 1]
        canvas = canvas / 255.0

        # 9. Shape for TFLite: (batch, h, w, channels)
        return canvas.reshape(1, 28, 28, 1)

    @staticmethod
    async def run(file: UploadFile) -> dict:
        PredictorService.validate_upload(file)

        # Read + size checks
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )
        if len(contents) > settings.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit.",
            )

        # Decode image (force full load to catch truncated files)
        try:
            image = Image.open(io.BytesIO(contents))
            image.load()
        except UnidentifiedImageError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is not a valid image.",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not process image: {e}",
            )

        # Preprocess
        img_array = PredictorService._mnist_preprocess(image)

        # 🔑 Predict via TFLite interpreter
        try:
            preds = ModelLoader.predict(img_array)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Prediction failed: {e}",
            )

        predicted_digit = int(np.argmax(preds))
        confidence = float(np.max(preds)) * 100.0

        return {
            "predicted_digit": predicted_digit,
            "confidence": round(confidence, 2),
            "all_probabilities": [round(float(p) * 100, 2) for p in preds],
            "filename": file.filename or "unknown",
        }