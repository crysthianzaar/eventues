from fastapi import FastAPI
from api.v1 import users

app = FastAPI()


app.include_router(users.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Eventues API"}
