from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.mongo import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="Sugar Labs AI Reflection API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import onboarding, reflection

@app.get("/")
async def root():
    return {"message": "Welcome to the Sugar Labs AI Reflection API"}

app.include_router(onboarding.router, prefix="/api")
app.include_router(reflection.router, prefix="/api")
