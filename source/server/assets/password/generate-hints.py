#!/usr/bin/env python3
"""
Generate Password game hints using ChatGPT.

Reads words from a corpus file and generates 5 one-word clues per word,
suitable for the Password (Mot de Passe) word-guessing game.

Usage:
  python generate-hints.py --corpus <corpus_file> --output <output_json> [--lang <language_code>] [--limit <N>]

Examples:
  python generate-hints.py --corpus ../../assets/corpora/en-5K.txt --output en/words.json --lang en
  python generate-hints.py --corpus ../../assets/corpora/en-5K.txt --output en/words.json --lang en --limit 100

The script merges new words into the existing output file (if any),
so it can be run incrementally.
"""
import argparse
import json
import os
import sys
import time

try:
    import openai
except ImportError:
    print("Error: openai package not installed. Run: pip install openai", file=sys.stderr)
    sys.exit(1)


LANGUAGE_NAMES = {
    "en": "English",
    "fr": "French",
    "it": "Italian",
    "pt": "Portuguese",
}

PROMPT_TEMPLATE = """You are helping create a word-guessing game called "Password" (like the TV game show).

For the {language} word "{word}", generate exactly 5 one-word clues that would help someone guess this word.

Rules for clues:
- Each clue must be a SINGLE word (no spaces, no hyphens)
- Clues must be in {language}
- Clues should go from most obvious to most obscure
- Clues cannot be the target word itself or a direct derivative of it
- Clues should not be too generic (e.g., "thing", "object")

Respond with ONLY a JSON array of 5 strings, nothing else.
Example: ["clue1", "clue2", "clue3", "clue4", "clue5"]"""


def generate_hints_for_word(client, word, language_code):
    language = LANGUAGE_NAMES.get(language_code, "English")
    prompt = PROMPT_TEMPLATE.format(language=language, word=word)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=100,
    )

    content = response.choices[0].message.content.strip()
    hints = json.loads(content)

    if not isinstance(hints, list) or len(hints) != 5:
        raise ValueError(f"Expected 5 hints, got: {content}")

    return hints


def load_existing(output_path):
    if os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def load_corpus_words(corpus_path, min_length=4):
    words = []
    with open(corpus_path, "r", encoding="utf-8") as f:
        for line in f:
            word = line.strip().lower()
            if len(word) >= min_length and word.isalpha():
                words.append(word)
    return words


def main():
    parser = argparse.ArgumentParser(description="Generate Password game hints using ChatGPT")
    parser.add_argument("--corpus", required=True, help="Path to corpus text file (one word per line)")
    parser.add_argument("--output", required=True, help="Path to output JSON file")
    parser.add_argument("--lang", default="en", help="Language code: en, fr, it, pt (default: en)")
    parser.add_argument("--limit", type=int, default=0, help="Max number of NEW words to process (0 = all)")
    parser.add_argument("--min-length", type=int, default=4, help="Minimum word length (default: 4)")
    args = parser.parse_args()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    client = openai.OpenAI(api_key=api_key)

    corpus_words = load_corpus_words(args.corpus, args.min_length)
    existing = load_existing(args.output)

    new_words = [w for w in corpus_words if w not in existing]
    if args.limit > 0:
        new_words = new_words[: args.limit]

    print(f"Corpus: {len(corpus_words)} words (>= {args.min_length} chars)")
    print(f"Already generated: {len(existing)} words")
    print(f"To generate: {len(new_words)} words")

    if not new_words:
        print("Nothing to generate.")
        return

    generated = 0
    for i, word in enumerate(new_words):
        try:
            hints = generate_hints_for_word(client, word, args.lang)
            existing[word] = hints
            generated += 1
            print(f"[{i + 1}/{len(new_words)}] {word}: {hints}")

            # Save after every 10 words
            if generated % 10 == 0:
                os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
                with open(args.output, "w", encoding="utf-8") as f:
                    json.dump(existing, f, indent=2, ensure_ascii=False)

            # Rate limiting
            time.sleep(0.5)

        except Exception as e:
            print(f"[{i + 1}/{len(new_words)}] ERROR for '{word}': {e}", file=sys.stderr)
            continue

    # Final save
    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)

    print(f"\nDone. Generated hints for {generated} new words.")
    print(f"Total words in output: {len(existing)}")


if __name__ == "__main__":
    main()
