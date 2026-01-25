#!/usr/bin/env python3
"""
ChatGPT-based dictionary wrapper for word-detective.
Usage:
  chatgpt-dictionary real-word <word> <secret_key> [--lang <language_code>]
  chatgpt-dictionary definition <word> [--lang <language_code>]

  language_code: 'en', 'it', or 'fr' (default: 'fr')
"""
import argparse
import sys
import os
import json
from danoan.word_def.plugins.modules.multilanguage_chatgpt import Adapter, Configuration

LANGUAGE_MAP = {"en": "eng", "it": "ita", "fr": "fra"}


def get_definition(word: str, language_code: str) -> dict:
    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        return {"error": "OPENAI_API_KEY not set"}

    lang = LANGUAGE_MAP.get(language_code, "fra")
    config = Configuration(openai_key=openai_key)
    adapter = Adapter(config, lang)

    definitions = adapter.get_definition(word)
    return {"word": word, "definition": definitions[0] if definitions else ""}


def action_real_word(args):
    """Check if a word exists by attempting to get its definition."""
    result = get_definition(args.word, args.lang)

    if "error" in result:
        return {"Status": False, "Error": result["error"]}

    if result.get("definition"):
        return {"Status": True}
    else:
        return {"Status": False}


def action_definition(args):
    """Get the definition of a word."""
    result = get_definition(args.word, args.lang)

    if "error" in result:
        return {"Status": False, "Error": result["error"]}

    if result.get("definition"):
        return {"Status": True, "Definitions": [result["definition"]]}
    else:
        return {"Status": False}


def create_parser():
    parser = argparse.ArgumentParser(
        description="ChatGPT-based dictionary for word-detective."
    )

    subparsers = parser.add_subparsers()

    # real-word subcommand (for word-source-manager compatibility)
    real_word_parser = subparsers.add_parser(
        "real-word", description="Check if a word really exists"
    )
    real_word_parser.add_argument("word", help="Word to check.")
    real_word_parser.add_argument(
        "secret_key", nargs="?", default="", help="API key (unused, for compatibility)"
    )
    real_word_parser.add_argument(
        "--lang", default="fr", help="Language code: en, it, fr (default: fr)"
    )
    real_word_parser.set_defaults(func=action_real_word)

    # definition subcommand
    definition_parser = subparsers.add_parser(
        "definition", description="Get the definition of a word"
    )
    definition_parser.add_argument("word", help="Word to define.")
    definition_parser.add_argument(
        "--lang", default="fr", help="Language code: en, it, fr (default: fr)"
    )
    definition_parser.set_defaults(func=action_definition)

    return parser


def main():
    parser = create_parser()
    args = parser.parse_args()

    if "func" in args:
        json.dump(args.func(args), sys.stdout)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
