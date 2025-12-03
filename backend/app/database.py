"""Mock in-memory database for the Snake Arena Live API."""
from datetime import datetime
from typing import Optional
import uuid
from app.models import User, LeaderboardEntry, ActivePlayer, GameState, Position, Direction, GameMode


# In-memory storage
users_db: dict[str, dict] = {}
email_to_user_id: dict[str, str] = {}
username_to_user_id: dict[str, str] = {}
leaderboard_db: list[dict] = []
active_players_db: dict[str, dict] = {}
sessions_db: dict[str, str] = {}  # token -> user_id


def initialize_sample_data():
    """Initialize the database with sample data."""
    # Sample users
    # Note: All sample users have password "password123"
    # Hash generated with: passlib.hash.bcrypt.hash("password123")
    sample_users = [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "username": "SnakeMaster",
            "email": "player1@test.com",
            "password_hash": "$2b$12$.1JnDJOdOylnBX4sdJM88ezzIwGqkshQ94XdYZJBK.exL6eBJz7D2",  # password123
            "highScore": 2450,
            "createdAt": "2024-01-15T10:30:00Z"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "username": "SpeedySnake",
            "email": "player2@test.com",
            "password_hash": "$2b$12$.1JnDJOdOylnBX4sdJM88ezzIwGqkshQ94XdYZJBK.exL6eBJz7D2",  # password123
            "highScore": 1800,
            "createdAt": "2024-02-20T14:20:00Z"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "username": "ProGamer",
            "email": "player3@test.com",
            "password_hash": "$2b$12$.1JnDJOdOylnBX4sdJM88ezzIwGqkshQ94XdYZJBK.exL6eBJz7D2",  # password123
            "highScore": 3200,
            "createdAt": "2024-03-10T09:15:00Z"
        }
    ]
    
    for user in sample_users:
        users_db[user["id"]] = user
        email_to_user_id[user["email"]] = user["id"]
        username_to_user_id[user["username"]] = user["id"]
    
    # Sample leaderboard entries
    global leaderboard_db
    leaderboard_db = [
        {
            "id": str(uuid.uuid4()),
            "username": "ProGamer",
            "score": 3200,
            "mode": "walls",
            "date": "2024-11-28"
        },
        {
            "id": str(uuid.uuid4()),
            "username": "SnakeMaster",
            "score": 2450,
            "mode": "walls",
            "date": "2024-11-27"
        },
        {
            "id": str(uuid.uuid4()),
            "username": "SpeedySnake",
            "score": 1800,
            "mode": "walls",
            "date": "2024-11-26"
        },
        {
            "id": str(uuid.uuid4()),
            "username": "ProGamer",
            "score": 2800,
            "mode": "pass-through",
            "date": "2024-11-28"
        },
        {
            "id": str(uuid.uuid4()),
            "username": "SnakeMaster",
            "score": 2100,
            "mode": "pass-through",
            "date": "2024-11-27"
        }
    ]
    
    # Sample active players
    active_players_db["ap1"] = {
        "id": "ap1",
        "username": "LivePlayer1",
        "score": 340,
        "mode": "walls",
        "startedAt": "2024-11-28T15:30:00Z",
        "gameState": {
            "snake": [{"x": 10, "y": 10}, {"x": 9, "y": 10}, {"x": 8, "y": 10}],
            "food": {"x": 15, "y": 12},
            "direction": "RIGHT",
            "score": 340
        }
    }
    
    active_players_db["ap2"] = {
        "id": "ap2",
        "username": "LivePlayer2",
        "score": 520,
        "mode": "pass-through",
        "startedAt": "2024-11-28T15:25:00Z",
        "gameState": {
            "snake": [{"x": 5, "y": 5}, {"x": 5, "y": 4}, {"x": 5, "y": 3}, {"x": 5, "y": 2}],
            "food": {"x": 8, "y": 8},
            "direction": "DOWN",
            "score": 520
        }
    }


# User operations
def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email."""
    user_id = email_to_user_id.get(email)
    if user_id:
        return users_db.get(user_id)
    return None


def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID."""
    return users_db.get(user_id)


def get_user_by_username(username: str) -> Optional[dict]:
    """Get user by username."""
    user_id = username_to_user_id.get(username)
    if user_id:
        return users_db.get(user_id)
    return None


def create_user(email: str, username: str, password_hash: str) -> dict:
    """Create a new user."""
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "highScore": 0,
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
    users_db[user_id] = user
    email_to_user_id[email] = user_id
    username_to_user_id[username] = user_id
    return user


def update_user_high_score(user_id: str, score: int) -> None:
    """Update user's high score if the new score is higher."""
    user = users_db.get(user_id)
    if user and score > user["highScore"]:
        user["highScore"] = score


# Leaderboard operations
def get_leaderboard(mode: Optional[str] = None) -> list[LeaderboardEntry]:
    """Get leaderboard entries, optionally filtered by mode."""
    entries = leaderboard_db
    if mode:
        entries = [e for e in entries if e["mode"] == mode]
    
    # Sort by score descending
    entries = sorted(entries, key=lambda x: x["score"], reverse=True)
    
    return [LeaderboardEntry(**entry) for entry in entries]


def add_leaderboard_entry(user_id: str, score: int, mode: str) -> int:
    """Add a leaderboard entry and return the rank."""
    user = get_user_by_id(user_id)
    if not user:
        return -1
    
    entry = {
        "id": str(uuid.uuid4()),
        "username": user["username"],
        "score": score,
        "mode": mode,
        "date": datetime.utcnow().strftime("%Y-%m-%d")
    }
    leaderboard_db.append(entry)
    
    # Update user's high score
    update_user_high_score(user_id, score)
    
    # Calculate rank
    mode_entries = [e for e in leaderboard_db if e["mode"] == mode]
    mode_entries = sorted(mode_entries, key=lambda x: x["score"], reverse=True)
    
    for idx, e in enumerate(mode_entries, 1):
        if e["id"] == entry["id"]:
            return idx
    
    return len(mode_entries)


# Active players operations
def get_active_players() -> list[ActivePlayer]:
    """Get all active players."""
    players = []
    for player_data in active_players_db.values():
        player = {
            "id": player_data["id"],
            "username": player_data["username"],
            "score": player_data["score"],
            "mode": player_data["mode"],
            "startedAt": player_data["startedAt"]
        }
        players.append(ActivePlayer(**player))
    return players


def get_player_game_state(player_id: str) -> Optional[GameState]:
    """Get a specific player's game state."""
    player = active_players_db.get(player_id)
    if player and "gameState" in player:
        return GameState(**player["gameState"])
    return None


def add_active_player(player_id: str, username: str, mode: str) -> None:
    """Add an active player."""
    active_players_db[player_id] = {
        "id": player_id,
        "username": username,
        "score": 0,
        "mode": mode,
        "startedAt": datetime.utcnow().isoformat() + "Z",
        "gameState": {
            "snake": [{"x": 10, "y": 10}],
            "food": {"x": 15, "y": 12},
            "direction": "RIGHT",
            "score": 0
        }
    }


def remove_active_player(player_id: str) -> None:
    """Remove an active player."""
    if player_id in active_players_db:
        del active_players_db[player_id]


# Session operations
def create_session(token: str, user_id: str) -> None:
    """Create a session."""
    sessions_db[token] = user_id


def get_user_id_from_token(token: str) -> Optional[str]:
    """Get user ID from token."""
    return sessions_db.get(token)


def delete_session(token: str) -> None:
    """Delete a session."""
    if token in sessions_db:
        del sessions_db[token]


# Initialize sample data on module import
initialize_sample_data()
