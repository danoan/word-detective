#!/usr/bin/env python3
"""
Tests for chatgpt_dictionary.py

Usage:
    # Run unit tests only (no API key needed):
    pytest tests/ -m "not integration"

    # Run all tests with API key from environment:
    OPENAI_API_KEY=your-key pytest tests/

    # Run all tests with API key as parameter:
    pytest tests/ --api-key your-key
"""
import os
import sys
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import chatgpt_dictionary as cd


class TestLanguageMap:
    """Test language code mapping."""

    def test_english_mapping(self):
        assert cd.LANGUAGE_MAP.get("en") == "eng"

    def test_italian_mapping(self):
        assert cd.LANGUAGE_MAP.get("it") == "ita"

    def test_unknown_language_returns_none(self):
        assert cd.LANGUAGE_MAP.get("fr") is None


class TestGetDefinitionNoApiKey:
    """Test behavior when no API key is provided."""

    def test_returns_error_when_no_key(self, monkeypatch):
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        result = cd.get_definition("hello", "en")
        assert "error" in result
        assert result["error"] == "OPENAI_API_KEY not set"


class TestGetDefinitionWithMock:
    """Test get_definition with mocked API calls."""

    @patch("chatgpt_dictionary.Adapter")
    @patch("chatgpt_dictionary.Configuration")
    def test_returns_definition_on_success(self, mock_config, mock_adapter, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "fake-key")

        mock_adapter_instance = MagicMock()
        mock_adapter_instance.get_definition.return_value = ["a greeting"]
        mock_adapter.return_value = mock_adapter_instance

        result = cd.get_definition("hello", "en")

        assert result["word"] == "hello"
        assert result["definition"] == "a greeting"
        mock_config.assert_called_once_with(openai_key="fake-key")
        mock_adapter.assert_called_once()

    @patch("chatgpt_dictionary.Adapter")
    @patch("chatgpt_dictionary.Configuration")
    def test_returns_empty_definition_when_not_found(self, mock_config, mock_adapter, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "fake-key")

        mock_adapter_instance = MagicMock()
        mock_adapter_instance.get_definition.return_value = []
        mock_adapter.return_value = mock_adapter_instance

        result = cd.get_definition("xyznonexistent", "en")

        assert result["word"] == "xyznonexistent"
        assert result["definition"] == ""

    @patch("chatgpt_dictionary.Adapter")
    @patch("chatgpt_dictionary.Configuration")
    def test_uses_correct_language_for_italian(self, mock_config, mock_adapter, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "fake-key")

        mock_adapter_instance = MagicMock()
        mock_adapter_instance.get_definition.return_value = ["un saluto"]
        mock_adapter.return_value = mock_adapter_instance

        cd.get_definition("ciao", "it")

        mock_adapter.assert_called_once_with(mock_config.return_value, "ita")

    @patch("chatgpt_dictionary.Adapter")
    @patch("chatgpt_dictionary.Configuration")
    def test_defaults_to_english_for_unknown_language(self, mock_config, mock_adapter, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "fake-key")

        mock_adapter_instance = MagicMock()
        mock_adapter_instance.get_definition.return_value = ["definition"]
        mock_adapter.return_value = mock_adapter_instance

        cd.get_definition("bonjour", "fr")

        mock_adapter.assert_called_once_with(mock_config.return_value, "eng")


@pytest.mark.integration
class TestGetDefinitionIntegration:
    """
    Integration tests that make real API calls.
    These tests are skipped unless an API key is available.

    Run with:
        OPENAI_API_KEY=your-key pytest tests/ -m integration
        pytest tests/ --api-key your-key -m integration
    """

    def test_english_definition(self, api_key, set_api_key_env):
        if not api_key:
            pytest.skip("OPENAI_API_KEY not set - skipping integration tests")

        result = cd.get_definition("hello", "en")
        assert result["word"] == "hello"
        assert "definition" in result
        assert len(result["definition"]) > 0

    def test_italian_definition(self, api_key, set_api_key_env):
        if not api_key:
            pytest.skip("OPENAI_API_KEY not set - skipping integration tests")

        result = cd.get_definition("ciao", "it")
        assert result["word"] == "ciao"
        assert "definition" in result
        assert len(result["definition"]) > 0
