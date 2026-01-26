# SPDX-FileCopyrightText: 2022-present DanielMA <danoan2008@gmail.com>
#
# SPDX-License-Identifier: MIT

import json

from word_source_manager.word_source_manager import (
    create_parser,
    find_word_source_by_name,
    prepare_json_response,
)


class TestPrepareJsonResponse:
    def test_success_false_by_default(self):
        result = json.loads(prepare_json_response("test message"))
        assert result["Success"] is False
        assert result["Message"] == "test message"

    def test_success_true_when_specified(self):
        result = json.loads(prepare_json_response("test message", success=True))
        assert result["Success"] is True
        assert result["Message"] == "test message"


class TestFindWordSourceByName:
    def test_finds_existing_word_source(self):
        word_sources = [
            {"name": "en-5K", "language": "english"},
            {"name": "it-7K", "language": "italian"},
        ]
        result = find_word_source_by_name(word_sources, "en-5K")
        assert result == {"name": "en-5K", "language": "english"}

    def test_returns_none_for_nonexistent_word_source(self):
        word_sources = [
            {"name": "en-5K", "language": "english"},
        ]
        result = find_word_source_by_name(word_sources, "nonexistent")
        assert result is None


class TestCreateParser:
    def test_parser_created_successfully(self):
        parser = create_parser()
        assert parser is not None

    def test_add_subcommand_parses_correctly(self):
        parser = create_parser()
        args = parser.parse_args(["add", "test-name", "english", "/path/to/checker", "/path/to/words.txt"])
        assert args.name == "test-name"
        assert args.language == "english"
        assert args.word_check_app_filepath == "/path/to/checker"
        assert args.word_source_filepath == "/path/to/words.txt"

    def test_remove_subcommand_parses_correctly(self):
        parser = create_parser()
        args = parser.parse_args(["remove", "test-name"])
        assert args.name == "test-name"

    def test_list_subcommand_parses_correctly(self):
        parser = create_parser()
        args = parser.parse_args(["list"])
        assert hasattr(args, "func")

    def test_request_word_subcommand_parses_correctly(self):
        parser = create_parser()
        args = parser.parse_args(["request-word", "hello", "en-5K"])
        assert args.word == "hello"
        assert args.word_source_name == "en-5K"

    def test_process_requested_words_subcommand_parses_correctly(self):
        parser = create_parser()
        args = parser.parse_args(["process-requested-words", "en-5K"])
        assert args.word_source_name == "en-5K"
