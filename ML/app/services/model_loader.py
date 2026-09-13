import os
import numpy as np
from app.config import settings

# Try TFLite first (works on Render/Linux), fall back to TensorFlow (Windows dev)
try:
    import tflite_runtime.interpreter as tflite
    _BACKEND = "tflite"
except ImportError:
    try:
        import tensorflow as tf
        tflite = None
        _BACKEND = "tensorflow"
    except ImportError:
        raise RuntimeError(
            "Neither tflite_runtime nor tensorflow is installed. "
            "Install one of them to run the API."
        )


class ModelLoader:
    _interpreter = None
    _model = None

    @classmethod
    def load(cls):
        if _BACKEND == "tflite":
            if cls._interpreter is None:
                if not os.path.exists(settings.MODEL_PATH):
                    raise RuntimeError(
                        f"Model not found at {settings.MODEL_PATH}"
                    )
                print(f"Loading TFLite model from {settings.MODEL_PATH}...")
                cls._interpreter = tflite.Interpreter(
                    model_path=settings.MODEL_PATH,
                    num_threads=1,
                )
                cls._interpreter.allocate_tensors()
                print("TFLite model ready.")
            return cls._interpreter

        else:  # tensorflow fallback
            if cls._model is None:
                # When using TF fallback, use the .keras file if it exists
                keras_path = settings.MODEL_PATH.replace(".tflite", ".keras")
                if not os.path.exists(keras_path):
                    raise RuntimeError(
                        f"Keras model not found at {keras_path}. "
                        f"Either install tflite_runtime or provide a .keras file."
                    )
                print(f"Loading Keras model from {keras_path}...")
                cls._model = tf.keras.models.load_model(
                    keras_path, compile=False
                )
                cls._model.trainable = False
                print("Keras model ready.")
            return cls._model

    @classmethod
    def get(cls):
        return cls.load()

    @classmethod
    def predict(cls, img_array: np.ndarray) -> np.ndarray:
        """Run inference regardless of backend."""
        if _BACKEND == "tflite":
            interpreter = cls.get()
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()

            expected_dtype = input_details[0]["dtype"]
            if img_array.dtype != expected_dtype:
                img_array = img_array.astype(expected_dtype)

            interpreter.set_tensor(input_details[0]["index"], img_array)
            interpreter.invoke()
            preds = interpreter.get_tensor(output_details[0]["index"])[0]
            return preds

        else:  # tensorflow
            model = cls.get()
            preds = model.predict(img_array, verbose=0)[0]
            return preds