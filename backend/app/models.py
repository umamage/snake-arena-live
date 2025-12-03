"""Pydantic models for the Snake Arena Live API."""
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


# Enums
class GameMode(str, Enum):
    """Game mode enumeration."""
    WALLS = "walls"
    PASS_THROUGH = "pass-through"


class Direction(str, Enum):
    """Snake direction enumeration."""
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"


# Base Models
class Position(BaseModel):
    """Position coordinates."""
    x: int = Field(..., ge=0)
    y: int = Field(..., ge=0)


class User(BaseModel):
    """User profile model."""
    id: str
    username: str
    email: EmailStr
    highScore: int = Field(..., ge=0)
    createdAt: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "username": "SnakeMaster",
                "email": "player1@test.com",
                "highScore": 2450,
                "createdAt": "2024-01-15T10:30:00Z"
            }
        }


class LeaderboardEntry(BaseModel):
    """Leaderboard entry model."""
    id: str
    username: str
    score: int = Field(..., ge=0)
    mode: GameMode
    date: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "username": "SnakeMaster",
                "score": 2450,
                "mode": "walls",
                "date": "2024-11-28"
            }
        }


class ActivePlayer(BaseModel):
    """Active player model for spectator mode."""
    id: str
    username: str
    score: int = Field(..., ge=0)
    mode: GameMode
    startedAt: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "ap1",
                "username": "LivePlayer1",
                "score": 340,
                "mode": "walls",
                "startedAt": "2024-11-28T15:30:00Z"
            }
        }


class GameState(BaseModel):
    """Game state model for spectator mode."""
    snake: list[Position]
    food: Position
    direction: Direction
    score: int = Field(..., ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "snake": [{"x": 10, "y": 10}, {"x": 9, "y": 10}],
                "food": {"x": 15, "y": 12},
                "direction": "RIGHT",
                "score": 340
            }
        }


# Request Models
class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str = Field(..., min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "player1@test.com",
                "password": "password123"
            }
        }


class SignupRequest(BaseModel):
    """Signup request model."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=6)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "newuser@test.com",
                "username": "NewPlayer",
                "password": "password123"
            }
        }


class SubmitScoreRequest(BaseModel):
    """Submit score request model."""
    score: int = Field(..., ge=0)
    mode: GameMode

    class Config:
        json_schema_extra = {
            "example": {
                "score": 1500,
                "mode": "walls"
            }
        }


# Response Models
class LoginResponse(BaseModel):
    """Login response model."""
    user: User


class SignupResponse(BaseModel):
    """Signup response model."""
    user: User


class SubmitScoreResponse(BaseModel):
    """Submit score response model."""
    success: bool
    rank: int = Field(..., description="The player's rank on the leaderboard")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "rank": 5
            }
        }


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str

    class Config:
        json_schema_extra = {
            "example": {
                "error": "Invalid credentials"
            }
        }
