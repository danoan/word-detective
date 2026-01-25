"""
Pytest configuration for chatgpt_dictionary tests.

Usage:
    # Run unit tests only (via tox):
    tox

    # Run integration tests (via tox):
    OPENAI_API_KEY=your-key tox -e integration
    tox -e integration -- --api-key your-key

    # Run all tests (via tox):
    OPENAI_API_KEY=your-key tox -e all

    # Run directly with pytest:
    pytest tests/ -m "not integration"
    pytest tests/ --api-key your-key
"""
import os
import pytest


def pytest_addoption(parser):
    parser.addoption(
        "--api-key",
        action="store",
        default=None,
        help="OpenAI API key for integration tests"
    )


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (require API key)"
    )


@pytest.fixture(scope="session")
def api_key(request):
    """Get API key from command line or environment."""
    key = request.config.getoption("--api-key")
    if key is None:
        key = os.environ.get("OPENAI_API_KEY")
    return key


@pytest.fixture
def set_api_key_env(api_key, monkeypatch):
    """Set OPENAI_API_KEY environment variable for tests."""
    if api_key:
        monkeypatch.setenv("OPENAI_API_KEY", api_key)
    else:
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
