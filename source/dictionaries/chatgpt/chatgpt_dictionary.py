#!/usr/bin/env python3
"""
ChatGPT-based dictionary wrapper for word-detective.
Usage: python chatgpt_dictionary.py <word> <language_code>
  language_code: 'en' or 'it' (will be mapped to 'eng' or 'ita')
"""
import sys
import os
import json
from danoan.word_def.plugins.modules.multilanguage_chatgpt import Adapter, Configuration

LANGUAGE_MAP = {"en": "eng", "it": "ita", "fr": "fra"}

def get_definition(word: str, language_code: str) -> dict:
    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        return {"error": "OPENAI_API_KEY not set"}

    lang = LANGUAGE_MAP.get(language_code, "eng")
    config = Configuration(openai_key=openai_key)
    adapter = Adapter(config, lang)

    definitions = adapter.get_definition(word)
    return {"word": word, "definition": definitions[0] if definitions else ""}

if __name__ == "__main__":
    word = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else "en"
    result = get_definition(word, lang)
    print(json.dumps(result))
