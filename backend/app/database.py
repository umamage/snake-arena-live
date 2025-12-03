"""Database operations for the Snake Arena Live API using SQLAlchemy."""
from datetime import datetime, UTC
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.db_models import User as DBUser, LeaderboardEntry as DBLeaderboardEntry, ActivePlayer as DBActivePlayer
from app.models import User, LeaderboardEntry, ActivePlayer, GameState


# User operations
async def get_user_by_email(db: AsyncSession, email: str) -> Optional[dict]:
    """Get user by email."""
    result = await db.execute(select(DBUser).where(DBUser.email == email))
    user = result.scalar_one_or_none()
    if user:
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "password_hash": user.password_hash,
            "highScore": user.high_score,
            "createdAt": user.created_at.isoformat()
        }
    return None


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[dict]:
    """Get user by ID."""
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "password_hash": user.password_hash,
            "highScore": user.high_score,
            "createdAt": user.created_at.isoformat()
        }
    return None


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[dict]:
    """Get user by username."""
    result = await db.execute(select(DBUser).where(DBUser.username == username))
    user = result.scalar_one_or_none()
    if user:
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "password_hash": user.password_hash,
            "highScore": user.high_score,
            "createdAt": user.created_at.isoformat()
        }
    return None


async def create_user(db: AsyncSession, email: str, username: str, password_hash: str) -> dict:
    """Create a new user."""
    user_id = str(uuid.uuid4())
    db_user = DBUser(
        id=user_id,
        username=username,
        email=email,
        password_hash=password_hash,
        high_score=0,
        created_at=datetime.now(UTC)
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return {
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "password_hash": db_user.password_hash,
        "highScore": db_user.high_score,
        "createdAt": db_user.created_at.isoformat()
    }


async def update_user_high_score(db: AsyncSession, user_id: str, score: int) -> None:
    """Update user's high score if the new score is higher."""
    user = await db.get(DBUser, user_id)
    if user and score > user.high_score:
        user.high_score = score
        await db.commit()


# Leaderboard operations
async def get_leaderboard(db: AsyncSession, mode: Optional[str] = None) -> list[LeaderboardEntry]:
    """Get leaderboard entries, optionally filtered by mode."""
    query = select(DBLeaderboardEntry)
    if mode:
        query = query.where(DBLeaderboardEntry.mode == mode)
    
    # Sort by score descending
    query = query.order_by(DBLeaderboardEntry.score.desc())
    
    result = await db.execute(query)
    entries = result.scalars().all()
    
    return [
        LeaderboardEntry(
            id=entry.id,
            username=entry.username,
            score=entry.score,
            mode=entry.mode,
            date=entry.date
        )
        for entry in entries
    ]


async def add_leaderboard_entry(db: AsyncSession, user_id: str, score: int, mode: str) -> int:
    """Add a leaderboard entry and return the rank."""
    user = await get_user_by_id(db, user_id)
    if not user:
        return -1
    
    entry_id = str(uuid.uuid4())
    db_entry = DBLeaderboardEntry(
        id=entry_id,
        username=user["username"],
        score=score,
        mode=mode,
        date=datetime.now(UTC).strftime("%Y-%m-%d")
    )
    db.add(db_entry)
    
    # Update user's high score
    await update_user_high_score(db, user_id, score)
    
    await db.commit()
    
    # Calculate rank
    query = select(DBLeaderboardEntry).where(DBLeaderboardEntry.mode == mode).order_by(DBLeaderboardEntry.score.desc())
    result = await db.execute(query)
    mode_entries = result.scalars().all()
    
    for idx, e in enumerate(mode_entries, 1):
        if e.id == entry_id:
            return idx
    
    return len(mode_entries)


# Active players operations
async def get_active_players(db: AsyncSession) -> list[ActivePlayer]:
    """Get all active players."""
    result = await db.execute(select(DBActivePlayer))
    players = result.scalars().all()
    
    return [
        ActivePlayer(
            id=player.id,
            username=player.username,
            score=player.score,
            mode=player.mode,
            startedAt=player.started_at
        )
        for player in players
    ]


async def get_player_game_state(db: AsyncSession, player_id: str) -> Optional[GameState]:
    """Get a specific player's game state."""
    player = await db.get(DBActivePlayer, player_id)
    if player and player.game_state:
        return GameState(**player.game_state)
    return None


async def add_active_player(db: AsyncSession, player_id: str, username: str, mode: str) -> None:
    """Add an active player."""
    db_player = DBActivePlayer(
        id=player_id,
        username=username,
        score=0,
        mode=mode,
        started_at=datetime.now(UTC),
        game_state={
            "snake": [{"x": 10, "y": 10}],
            "food": {"x": 15, "y": 12},
            "direction": "RIGHT",
            "score": 0
        }
    )
    db.add(db_player)
    await db.commit()


async def remove_active_player(db: AsyncSession, player_id: str) -> None:
    """Remove an active player."""
    player = await db.get(DBActivePlayer, player_id)
    if player:
        await db.delete(player)
        await db.commit()


# Session operations (In-memory for simplicity, or could be Redis/DB)
# For now, keeping sessions in memory as they are just token->user_id mappings
# In a production app, use Redis or a DB table for sessions
sessions_db: dict[str, str] = {}

async def create_session(token: str, user_id: str) -> None:
    """Create a session."""
    sessions_db[token] = user_id


async def get_user_id_from_token(token: str) -> Optional[str]:
    """Get user ID from token."""
    return sessions_db.get(token)


async def delete_session(token: str) -> None:
    """Delete a session."""
    if token in sessions_db:
        del sessions_db[token]


# Initialize sample data
async def initialize_sample_data(db: AsyncSession):
    """Initialize the database with sample data if empty."""
    # Check if users exist
    result = await db.execute(select(DBUser))
    if result.first():
        return

    # Sample users
    # Note: All sample users have password "password123"
    # Hash generated with: passlib.hash.bcrypt.hash("password123")
    sample_users = [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "username": "SnakeMaster",
            "email": "player1@test.com",
            "password_hash": "$2b$12$.1JnDJOdOylnBX4sdJM88ezzIwGqkshQ94XdYZJBK.exL6eBJz7D2",  # password123
            "high_score": 2450
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "username": "SpeedySnake",
            "email": "player2@test.com",
            "password_hash": "$2b$12$.1JnDJOdOylnBX4sdJM88ezzIwGqkshQ94XdYZJBK.exL6eBJz7D2",  # password123
            "high_score": 1800
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "username": "ProGamer",
            "email": "player3@test.com",
            "password_hash": "$2b$12$.1JnDJOdOylnBX4sdJM88ezzIwGqkshQ94XdYZJBK.exL6eBJz7D2",  # password123
            "high_score": 3200
        }
    ]
    
    for user_data in sample_users:
        db_user = DBUser(**user_data)
        db.add(db_user)
    
    # Sample leaderboard entries
    sample_entries = [
        {
            "username": "ProGamer",
            "score": 3200,
            "mode": "walls",
            "date": "2024-11-28"
        },
        {
            "username": "SnakeMaster",
            "score": 2450,
            "mode": "walls",
            "date": "2024-11-27"
        },
        {
            "username": "SpeedySnake",
            "score": 1800,
            "mode": "walls",
            "date": "2024-11-26"
        },
        {
            "username": "ProGamer",
            "score": 2800,
            "mode": "pass-through",
            "date": "2024-11-28"
        },
        {
            "username": "SnakeMaster",
            "score": 2100,
            "mode": "pass-through",
            "date": "2024-11-27"
        }
    ]
    
    for entry_data in sample_entries:
        db_entry = DBLeaderboardEntry(**entry_data)
        db.add(db_entry)
        
    await db.commit()
