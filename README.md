[![CI](https://github.com/danoan/word-detective/actions/workflows/ci.yml/badge.svg)](https://github.com/danoan/word-detective/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/danoan/word-detective/branch/main/graph/badge.svg?token=iZm7yCVsNI)](https://codecov.io/gh/danoan/word-detective)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/8743025f16b04d7a8dadbe4ae23da567)](https://www.codacy.com/gh/danoan/word-detective/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=danoan/word-detective&amp;utm_campaign=Badge_Grade)

# Word Detective

Word Detective is a multilingual word puzzle game where players find all hidden words that can be formed using only seven letters displayed in a hexagonal interface.

Play it [here](http://word-detective.barriguinhas.fr/games/en).

## Overview

The game automatically generates puzzles from text sources (books, articles, word lists) and serves them through an interactive web interface. Players are presented with 7 letters and must discover all valid words that can be spelled using only those letters.

**Key Features:**

- Multiple puzzle modes: Daily, Weekly, Random, and Custom (from uploaded text)
- Multi-language support: English, French, Italian, and Portuguese
- Word definitions lookup as players progress
- Progress persistence via browser cookies
- Hint system to help stuck players

## Architecture

The project consists of three main components:

```
┌─────────────────────────────────────────────────────────┐
│              WEB BROWSER (Frontend)                     │
│    HTML/CSS + JavaScript (Webpack bundle)               │
│    Game UI, state management, cookie persistence        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST API
┌──────────────────────▼──────────────────────────────────┐
│             NODE.JS SERVER (Express.js)                 │
│    REST API endpoints, template rendering               │
│    Spawns C++ binaries for puzzle generation            │
└──────────────────────┬──────────────────────────────────┘
                       │ Child Process
┌──────────────────────▼──────────────────────────────────┐
│              C++ BACKEND (CMake)                        │
│    Puzzle generation engine, data structures            │
│    Unicode text processing, word validation             │
└─────────────────────────────────────────────────────────┘
```

### C++ Backend (`source/word-detective-backend/`)

The core puzzle generation engine written in C++17:

- **Data Structures**: Specialized `Brick` tree structure for efficient word storage and lookup by unique character paths, plus `Trie` for prefix matching
- **Text Processing**: Unicode-aware text segmentation with ICU library support for multiple languages
- **Applications**:
  - `word-detective`: Generates puzzle JSON from pre-built word data
  - `export-brick`: Converts raw text files into optimized binary `.brk` files

### Node.js Server (`source/server/`)

Express.js web server providing:

- REST API for puzzle generation and word definitions
- Game routes for different puzzle modes (daily, weekly, random, custom)
- Binary service bridge to execute C++ executables
- Internationalized UI templates

### Frontend (`source/word-detective-js/`)

Vanilla JavaScript (ES6 modules) bundled with Webpack:

- Interactive hexagonal letter interface
- Game state management and word validation
- Cookie-based progress persistence
- Word definition display

## Project Structure

```
source/
├── word-detective-backend/     # C++ core engine
│   ├── app/
│   │   ├── word-detective/     # Puzzle generation executable
│   │   └── export-brick/       # Text to .brk converter
│   ├── modules/
│   │   ├── datastr/            # Brick and Trie data structures
│   │   ├── utils/              # Text processing utilities
│   │   └── standard-extensions/
│   └── lab/test/               # Unit tests (Catch2)
│
├── server/                     # Node.js web server
│   ├── modules/api/            # REST API routes
│   ├── games/                  # Game mode templates
│   └── assets/
│       ├── messages/           # UI translations (en, fr, it, pt)
│       └── corpora/            # Word lists per language
│
├── word-detective-js/          # Frontend JavaScript
│   └── src/modules/            # Game controller, definitions, cookies
│
└── word-source-manager/        # Python utility for word sources
```

## Dependencies

- **C++**: Boost (filesystem, system), ICU, nlohmann/json (shipped)
- **Node.js**: Express, node-fetch, express-fileupload
- **Python**: Jinja2 (for template rendering)
- **Build**: CMake 3.13+, Webpack

## Installation

### Building the C++ Backend

```bash
cd word-detective
mkdir build && cd build
cmake -DCMAKE_INSTALL_PREFIX="../install" \
      -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_TESTS=ON \
      ..
make install
```

CMake options:
- `BUILD_TESTS=ON/OFF` - Build unit tests (default: OFF)
- `BUILD_BENCHMARKS=ON/OFF` - Build performance benchmarks (default: OFF)
- `BUILD_STATIC=ON/OFF` - Static linking (default: OFF)

### Running Tests

```bash
cd build
ctest --output-on-failure
```

### Starting the Server

```bash
cd source/server
npm install
npm start
```

## Generating Puzzles

Generate a puzzle from a text file:

```bash
./install/app/word-detective --input-file books/jekyll.txt --language en
```

Convert a word list to optimized brick format:

```bash
./install/app/export-brick --input-file wordlist.txt --output-file words.brk --language en
```

## Supported Languages

| Language   | Code | Word Corpus |
|------------|------|-------------|
| English    | en   | 5,000 words |
| French     | fr   | 5,000 words |
| Portuguese | pt   | 5,000 words |
| Italian    | it   | 1,000 words |

## License

See LICENSE file for details.
