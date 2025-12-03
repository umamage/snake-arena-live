"""Configuration settings for the Snake Arena Live API."""
import os
from datetime import timedelta

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-please-make-it-secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

# CORS Settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
]

# API Settings
API_V1_PREFIX = "/api/v1"
