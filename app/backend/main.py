from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers import headlines
import os

import uvicorn

origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(headlines.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)