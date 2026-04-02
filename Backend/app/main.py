import logging
logging.basicConfig(level=logging.INFO)
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

import os
import re

# Configure CORS
# Read allowed origins from environment variable, fallback to local development URLs
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

# Process origins: strip whitespace and ensure both with/without trailing slash are handled
allowed_origins = []
for o in raw_origins:
    o = o.strip()
    if not o: continue
    allowed_origins.append(o)
    if o.endswith("/"):
        allowed_origins.append(o.rstrip("/"))
    else:
        allowed_origins.append(o + "/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Safely allow anything on vercel subdomain if the above matches fail
    allow_origin_regex=r"https://.*\.vercel\.app",
)

from app.routes import onboarding, reflection

@app.get("/")
async def root():
    return {"message": "Welcome to the Sugar Labs AI Reflection API"}

app.include_router(onboarding.router, prefix="/api")
app.include_router(reflection.router, prefix="/api")
