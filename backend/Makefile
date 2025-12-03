.PHONY: install dev test lint format clean help

# Default target
all: help

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies using uv"
	@echo "  make dev        - Run development server (auto-reload)"
	@echo "  make prod       - Run production server (4 workers)"
	@echo "  make test       - Run all tests"
	@echo "  make test-cov   - Run tests with coverage report"
	@echo "  make lint       - Run linting (ruff)"
	@echo "  make format     - Format code (black)"
	@echo "  make clean      - Remove cache files"

install:
	uv sync

dev:
	uv run uvicorn main:app --reload --host 0.0.0.0 --port 8080

prod:
	uv run uvicorn main:app --host 0.0.0.0 --port 8080 --workers 4

test:
	uv run pytest -v

test-cov:
	uv run pytest --cov=app --cov-report=term-missing

lint:
	uv run ruff check app tests

format:
	uv run black app tests

clean:
	rm -rf __pycache__
	rm -rf .pytest_cache
	rm -rf .coverage
	find . -type d -name "__pycache__" -exec rm -rf {} +
