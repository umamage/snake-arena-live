# Snake Arena Live Backend

FastAPI backend for the Snake Arena Live game application.

## Features

- **Authentication**: User signup, login, logout, and session management with JWT tokens
- **Leaderboard**: Score submission and leaderboard retrieval with game mode filtering
- **Spectator Mode**: View active players and their game states in real-time
- **Mock Database**: In-memory storage for development (easily replaceable with real database)

## Setup

### Prerequisites

- Python 3.12+
- UV package manager

### Installation

```bash
# Install dependencies
uv sync

# Or add individual packages
uv add fastapi uvicorn pydantic "python-jose[cryptography]" bcrypt python-multipart
uv add --dev pytest httpx
```

## Running the Server

### Development Server

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

The server will start on `http://localhost:8080`

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc

## Running Tests

```bash
# Run all tests
uv run pytest -v

# Run with coverage
uv run pytest --cov=app --cov-report=html

# Run specific test file
uv run pytest tests/test_auth.py -v
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── auth.py          # Authentication utilities (JWT, password hashing)
│   ├── config.py        # Configuration settings
│   ├── database.py      # Mock in-memory database
│   ├── models.py        # Pydantic models
│   └── routers/
│       ├── __init__.py
│       ├── auth.py      # Authentication endpoints
│       ├── leaderboard.py  # Leaderboard endpoints
│       └── players.py   # Players/spectator endpoints
├── tests/
│   ├── __init__.py
│   ├── conftest.py      # Pytest fixtures
│   ├── test_auth.py     # Authentication tests
│   ├── test_leaderboard.py  # Leaderboard tests
│   └── test_players.py  # Players tests
├── main.py              # FastAPI application entry point
└── pyproject.toml       # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create new user account
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout (requires auth)
- `GET /api/v1/auth/me` - Get current user info (requires auth)

### Leaderboard
- `GET /api/v1/leaderboard` - Get leaderboard (optional mode filter)
- `POST /api/v1/leaderboard/submit` - Submit score (requires auth)

### Players/Spectator
- `GET /api/v1/players/active` - Get list of active players
- `GET /api/v1/players/{playerId}/game-state` - Get player's game state

## Environment Variables

- `SECRET_KEY`: JWT secret key (default: auto-generated, change in production)
- `CORS_ORIGINS`: Allowed CORS origins (default: localhost:3000, localhost:5173, localhost:8080)

## Mock Database

The current implementation uses an in-memory database with pre-populated sample data:

**Sample Users** (all have password: `password123`):
- player1@test.com (SnakeMaster)
- player2@test.com (SpeedySnake)
- player3@test.com (ProGamer)

**Sample Active Players**:
- ap1 (LivePlayer1)
- ap2 (LivePlayer2)

## Replacing Mock Database

To replace the mock database with a real one:

1. Install database driver (e.g., `uv add sqlalchemy psycopg2-binary`)
2. Update `app/database.py` with SQLAlchemy models
3. Replace in-memory dictionaries with database queries
4. Update initialization logic

## Development

### Adding New Endpoints

1. Create/update router in `app/routers/`
2. Add models to `app/models.py` if needed
3. Register router in `main.py`
4. Write tests in `tests/`

### Code Quality

```bash
# Format code
uv run black app tests

# Lint
uv run ruff check app tests

# Type checking
uv run mypy app
```

## License

MIT
