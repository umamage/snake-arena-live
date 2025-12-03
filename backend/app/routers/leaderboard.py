"""Leaderboard endpoints router."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models import (
    LeaderboardEntry, SubmitScoreRequest, SubmitScoreResponse,
    User, GameMode
)
from app.database import get_leaderboard, add_leaderboard_entry
from app.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=list[LeaderboardEntry])
async def get_leaderboard_entries(
    mode: Optional[GameMode] = Query(None, description="Filter by game mode")
):
    """
    Retrieve the game leaderboard, optionally filtered by game mode.
    """
    mode_str = mode.value if mode else None
    entries = get_leaderboard(mode_str)
    return entries


@router.post("/submit", response_model=SubmitScoreResponse, responses={
    401: {"description": "Unauthorized"}
})
async def submit_score(
    request: SubmitScoreRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Submit a game score to the leaderboard.
    Requires authentication.
    """
    # Add leaderboard entry
    rank = add_leaderboard_entry(
        user_id=current_user.id,
        score=request.score,
        mode=request.mode.value
    )
    
    if rank == -1:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit score"
        )
    
    return SubmitScoreResponse(success=True, rank=rank)
