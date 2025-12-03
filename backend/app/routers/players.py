"""Players and spectator mode endpoints router."""
from typing import Optional
from fastapi import APIRouter, Path
from app.models import ActivePlayer, GameState
from app.database import get_active_players, get_player_game_state

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("/active", response_model=list[ActivePlayer])
async def get_active_players_list():
    """
    Retrieve a list of currently active players for spectator mode.
    """
    players = get_active_players()
    return players


@router.get("/{playerId}/game-state", response_model=Optional[GameState], responses={
    404: {"description": "Player not found"}
})
async def get_player_game_state_endpoint(
    playerId: str = Path(..., description="The ID of the player to watch")
):
    """
    Retrieve the current game state for a specific player (for spectator mode).
    Returns null if player is not found.
    """
    game_state = get_player_game_state(playerId)
    return game_state
