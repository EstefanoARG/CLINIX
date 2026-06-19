from fastapi import FastAPI

app = FastAPI(title="CLINIX API", version="0.1.0")


@app.get("/")
def root():
    return {"message": "CLINIX API"}
