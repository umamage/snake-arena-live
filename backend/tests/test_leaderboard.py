"""Tests for leaderboard endpoints."""
import pytest
from fastapi import status


def test_get_leaderboard_all(client):
    """Test getting all leaderboard entries."""
    response = client.get("/api/v1/leaderboard")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check that entries are sorted by score (descending)
    scores = [entry["score"] for entry in data]
    assert scores == sorted(scores, reverse=True)


def test_get_leaderboard_filtered_walls(client):
    """Test getting leaderboard filtered by walls mode."""
    response = client.get("/api/v1/leaderboard?mode=walls")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    
    # Check that all entries are for walls mode
    for entry in data:
        assert entry["mode"] == "walls"
    
    # Check that entries are sorted by score (descending)
    scores = [entry["score"] for entry in data]
    assert scores == sorted(scores, reverse=True)


def test_get_leaderboard_filtered_pass_through(client):
    """Test getting leaderboard filtered by pass-through mode."""
    response = client.get("/api/v1/leaderboard?mode=pass-through")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    
    # Check that all entries are for pass-through mode
    for entry in data:
        assert entry["mode"] == "pass-through"


def test_submit_score_authenticated(client, auth_headers, test_user):
    """Test submitting a score when authenticated."""
    response = client.post(
        "/api/v1/leaderboard/submit",
        headers=auth_headers,
        json={
            "score": 1500,
            "mode": "walls"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert "rank" in data
    assert isinstance(data["rank"], int)
    assert data["rank"] > 0


def test_submit_score_unauthenticated(client):
    """Test submitting a score when not authenticated."""
    response = client.post(
        "/api/v1/leaderboard/submit",
        json={
            "score": 1500,
            "mode": "walls"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_submit_score_updates_leaderboard(client, auth_headers):
    """Test that submitting a score updates the leaderboard."""
    # Get initial leaderboard count
    initial_response = client.get("/api/v1/leaderboard?mode=walls")
    initial_count = len(initial_response.json())
    
    # Submit a score
    submit_response = client.post(
        "/api/v1/leaderboard/submit",
        headers=auth_headers,
        json={
            "score": 5000,
            "mode": "walls"
        }
    )
    assert submit_response.status_code == status.HTTP_200_OK
    
    # Get updated leaderboard
    updated_response = client.get("/api/v1/leaderboard?mode=walls")
    updated_data = updated_response.json()
    
    # Check that leaderboard has one more entry
    assert len(updated_data) == initial_count + 1
    
    # Check that the new score is at the top (highest score)
    assert updated_data[0]["score"] == 5000


def test_submit_score_ranking(client, auth_headers):
    """Test that the ranking is calculated correctly."""
    # Submit a low score
    response = client.post(
        "/api/v1/leaderboard/submit",
        headers=auth_headers,
        json={
            "score": 100,
            "mode": "walls"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # The rank should be last (or near last) since 100 is a low score
    # Get total entries for walls mode
    leaderboard_response = client.get("/api/v1/leaderboard?mode=walls")
    total_entries = len(leaderboard_response.json())
    
    # The rank should be equal to total entries (last place)
    assert data["rank"] == total_entries


def test_submit_score_invalid_mode(client, auth_headers):
    """Test submitting a score with invalid mode."""
    response = client.post(
        "/api/v1/leaderboard/submit",
        headers=auth_headers,
        json={
            "score": 1500,
            "mode": "invalid-mode"
        }
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_submit_score_negative_score(client, auth_headers):
    """Test submitting a negative score."""
    response = client.post(
        "/api/v1/leaderboard/submit",
        headers=auth_headers,
        json={
            "score": -100,
            "mode": "walls"
        }
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
