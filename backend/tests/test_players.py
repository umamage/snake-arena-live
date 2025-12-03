"""Tests for players and spectator mode endpoints."""
import pytest
from fastapi import status


def test_get_active_players(client):
    """Test getting list of active players."""
    response = client.get("/api/v1/players/active")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    
    # Check that we have at least the sample active players
    assert len(data) >= 2
    
    # Validate structure of active player entries
    for player in data:
        assert "id" in player
        assert "username" in player
        assert "score" in player
        assert "mode" in player
        assert "startedAt" in player
        assert player["mode"] in ["walls", "pass-through"]


def test_get_player_game_state_valid(client):
    """Test getting game state for a valid active player."""
    response = client.get("/api/v1/players/ap1/game-state")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Validate game state structure
    assert "snake" in data
    assert "food" in data
    assert "direction" in data
    assert "score" in data
    
    # Validate snake structure
    assert isinstance(data["snake"], list)
    assert len(data["snake"]) > 0
    for segment in data["snake"]:
        assert "x" in segment
        assert "y" in segment
        assert isinstance(segment["x"], int)
        assert isinstance(segment["y"], int)
    
    # Validate food structure
    assert "x" in data["food"]
    assert "y" in data["food"]
    assert isinstance(data["food"]["x"], int)
    assert isinstance(data["food"]["y"], int)
    
    # Validate direction
    assert data["direction"] in ["UP", "DOWN", "LEFT", "RIGHT"]
    
    # Validate score
    assert isinstance(data["score"], int)
    assert data["score"] >= 0


def test_get_player_game_state_another_player(client):
    """Test getting game state for another valid active player."""
    response = client.get("/api/v1/players/ap2/game-state")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Validate that we got a valid game state
    assert "snake" in data
    assert "food" in data
    assert "direction" in data
    assert "score" in data


def test_get_player_game_state_invalid(client):
    """Test getting game state for a non-existent player."""
    response = client.get("/api/v1/players/nonexistent/game-state")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Should return null for non-existent player
    assert data is None


def test_active_players_have_valid_modes(client):
    """Test that all active players have valid game modes."""
    response = client.get("/api/v1/players/active")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    valid_modes = ["walls", "pass-through"]
    for player in data:
        assert player["mode"] in valid_modes


def test_active_players_scores_non_negative(client):
    """Test that all active players have non-negative scores."""
    response = client.get("/api/v1/players/active")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    for player in data:
        assert player["score"] >= 0


def test_game_state_snake_positions_non_negative(client):
    """Test that snake positions are non-negative."""
    response = client.get("/api/v1/players/ap1/game-state")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    for segment in data["snake"]:
        assert segment["x"] >= 0
        assert segment["y"] >= 0


def test_game_state_food_position_non_negative(client):
    """Test that food position is non-negative."""
    response = client.get("/api/v1/players/ap1/game-state")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert data["food"]["x"] >= 0
    assert data["food"]["y"] >= 0
