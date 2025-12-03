"""Tests for authentication endpoints."""
import pytest
from fastapi import status


def test_signup_success(client):
    """Test successful user signup."""
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "newuser@test.com",
            "username": "NewUser",
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == "newuser@test.com"
    assert data["user"]["username"] == "NewUser"
    assert data["user"]["highScore"] == 0
    assert "id" in data["user"]
    assert "createdAt" in data["user"]


def test_signup_duplicate_email(client, test_user):
    """Test signup with duplicate email."""
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": test_user["email"],
            "username": "DifferentUsername",
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email already registered" in response.json()["detail"]


def test_signup_duplicate_username(client, test_user):
    """Test signup with duplicate username."""
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "different@test.com",
            "username": test_user["username"],
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Username already taken" in response.json()["detail"]


def test_login_success(client, test_user):
    """Test successful login."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"]
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == test_user["email"]
    assert data["user"]["username"] == test_user["username"]


def test_login_invalid_password(client, test_user):
    """Test login with invalid password."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user["email"],
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid password" in response.json()["detail"]


def test_login_user_not_found(client):
    """Test login with non-existent user."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@test.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "User not found" in response.json()["detail"]


def test_get_current_user_authenticated(client, auth_headers, test_user):
    """Test getting current user info when authenticated."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == test_user["email"]
    assert data["username"] == test_user["username"]
    assert data["id"] == test_user["id"]


def test_get_current_user_unauthenticated(client):
    """Test getting current user info when not authenticated."""
    response = client.get("/api/v1/auth/me")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user_invalid_token(client):
    """Test getting current user info with invalid token."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_logout_authenticated(client, auth_headers):
    """Test logout when authenticated."""
    response = client.post("/api/v1/auth/logout", headers=auth_headers)
    
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_logout_unauthenticated(client):
    """Test logout when not authenticated."""
    response = client.post("/api/v1/auth/logout")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
