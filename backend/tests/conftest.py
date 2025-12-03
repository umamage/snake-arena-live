"""Pytest configuration and fixtures."""
import pytest
from fastapi.testclient import TestClient
from main import app
from app.database import (
    users_db, email_to_user_id, username_to_user_id,
    leaderboard_db, active_players_db, sessions_db,
    initialize_sample_data
)
from app.auth import create_access_token, get_password_hash


@pytest.fixture(scope="function", autouse=True)
def reset_database():
    """Reset the database before each test."""
    # Clear all databases
    users_db.clear()
    email_to_user_id.clear()
    username_to_user_id.clear()
    leaderboard_db.clear()
    active_players_db.clear()
    sessions_db.clear()
    
    # Reinitialize sample data
    initialize_sample_data()
    
    yield
    
    # Cleanup after test
    users_db.clear()
    email_to_user_id.clear()
    username_to_user_id.clear()
    leaderboard_db.clear()
    active_players_db.clear()
    sessions_db.clear()


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def test_user():
    """Get a test user from the sample data."""
    return {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "SnakeMaster",
        "email": "player1@test.com",
        "password": "password123",
        "highScore": 2450
    }


@pytest.fixture
def auth_token(test_user):
    """Create an authentication token for the test user."""
    token = create_access_token(data={"sub": test_user["id"]})
    return token


@pytest.fixture
def auth_headers(auth_token):
    """Create authentication headers with Bearer token."""
    return {"Authorization": f"Bearer {auth_token}"}
