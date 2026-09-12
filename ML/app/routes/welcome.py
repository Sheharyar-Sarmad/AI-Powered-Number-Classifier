



from fastapi import APIRouter

router = APIRouter(tags=["Welcome"])

@router.get("/")
def welcome():
    return {"message": "Welcome to the Digit Recognizer API!"}