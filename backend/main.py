"""Main FastAPI application for Snake Arena Live API."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, API_V1_PREFIX
from app.routers import auth, leaderboard, players

# Create FastAPI app
app = FastAPI(
    title="Snake Arena Live API",
    description="Backend API for the Snake Arena Live game application",
    version="1.0.0",
    contact={
        "name": "Snake Arena Live Team"
    }
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API v1 router
from fastapi import APIRouter
api_v1_router = APIRouter(prefix=API_V1_PREFIX)

# Include routers
api_v1_router.include_router(auth.router)
api_v1_router.include_router(leaderboard.router)
api_v1_router.include_router(players.router)

# Add API v1 router to app
app.include_router(api_v1_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Snake Arena Live API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
