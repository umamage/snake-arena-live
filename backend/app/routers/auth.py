"""Authentication endpoints router."""
from fastapi import APIRouter, HTTPException, status, Depends
from app.models import (
    LoginRequest, LoginResponse, SignupRequest, SignupResponse,
    User, ErrorResponse
)
from app.database import (
    get_user_by_email, get_user_by_username, create_user,
    create_session
)
from app.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse, responses={
    401: {"model": ErrorResponse, "description": "Authentication failed"},
    404: {"model": ErrorResponse, "description": "User not found"}
})
async def login(request: LoginRequest):
    """
    Authenticate a user with email and password.
    Returns user information and sets authentication token.
    """
    # Get user by email
    user_data = get_user_by_email(request.email)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify password
    if not verify_password(request.password, user_data["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data["id"]})
    
    # Create session
    create_session(access_token, user_data["id"])
    
    # Create user response
    user = User(
        id=user_data["id"],
        username=user_data["username"],
        email=user_data["email"],
        highScore=user_data["highScore"],
        createdAt=user_data["createdAt"]
    )
    
    return LoginResponse(user=user)


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED, responses={
    400: {"model": ErrorResponse, "description": "Invalid input or user already exists"}
})
async def signup(request: SignupRequest):
    """
    Create a new user account.
    Returns the created user information.
    """
    # Check if email already exists
    if get_user_by_email(request.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if get_user_by_username(request.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Hash password
    password_hash = get_password_hash(request.password)
    
    # Create user
    user_data = create_user(request.email, request.username, password_hash)
    
    # Create user response
    user = User(
        id=user_data["id"],
        username=user_data["username"],
        email=user_data["email"],
        highScore=user_data["highScore"],
        createdAt=user_data["createdAt"]
    )
    
    return SignupResponse(user=user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, responses={
    401: {"description": "Unauthorized"}
})
async def logout(current_user: User = Depends(get_current_user)):
    """
    End the current user session.
    Note: In this mock implementation, we don't actually invalidate the token.
    In a real implementation, you would add the token to a blacklist.
    """
    # In a real implementation, you would invalidate the token here
    # For now, we just return success
    return None


@router.get("/me", response_model=User, responses={
    401: {"model": ErrorResponse, "description": "Not authenticated"}
})
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Retrieve the currently authenticated user's information.
    """
    return current_user
