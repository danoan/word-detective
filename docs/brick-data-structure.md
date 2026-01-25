# The Brick Data Structure

The Brick is a tree data structure inspired by the Trie, but specifically designed for word puzzle generation. While a Trie is a prefix tree commonly used to store words, the Brick organizes words by their unique character composition, making it ideal for the Word Detective game.

## Motivation

In Word Detective, a puzzle consists of a pair: a **list of characters** and a **list of words** that can be formed using only those characters. The Brick data structure stores puzzles efficiently: each path in the tree forms a valid puzzle, where the sequence of characters from root to any node represents a character set, and the associated words are those that can be spelled using exactly those characters.

## How It Works

### Inserting a Word

To insert a word into a Brick:

1. Sort its characters in ascending order
2. Remove duplicate characters
3. Insert the resulting sequence as you would in a Trie
4. Store the original word at the end of the path

For example, inserting "screen":
- Original word: `screen`
- Sorted unique characters: `c, e, n, r, s`
- Path in Brick: `c → e → n → r → s`
- Word "screen" is stored at the final node

### Key Differences from a Trie

| Aspect | Trie | Brick |
|--------|------|-------|
| Path meaning | Spells the word itself | Sorted unique characters |
| Words at nodes | Implicit (path = word) | Explicit (must store word list) |
| Path endings | Always at leaves | Can end at intermediate nodes |
| Multiple words per path | No | Yes (words sharing same character set) |

Many words can share the same path. For instance, "deep" and "peed" both have the path `d → e → p`, so both words are stored at that node.

## Example

Consider this puzzle with 7 letters:

```json
{
  "letters": "deioprv",
  "words": ["prior", "proper", "error", "driver", "deed", "video", "over",
            "period", "pipe", "divide", "drive", "deep", "derive", "river",
            "poor", "order", "pride", "dive", "drop", "deer", "deprive",
            "provider", "ever", "provide", "door", "pepper", "prove",
            "peer", "ride", "revive", "rope"]
}
```

The Brick stores these words organized by their character signatures:

```
                         [root]
                           |
                          [d]
                         / | \
                       [e] ... ...
                      / | \
                    [i] [o] [p]
                    /    |    \
                  [v]  [r]   "deep","peed"
                  /      \        \
              "dive"    [v]      [r]
               /          \        \
            "video"     "drove"   "deer"
              |            |
            [p,r]        ...
              |
          "provide"
              |
            ...
```

## Properties

### Unbalancedness

The Brick tends to be unbalanced toward the left. This occurs because a word containing the letter 'a' will be placed in the 'a' subtree regardless of its other letters. Since 'a' is early in the alphabet and common in many languages, left subtrees grow larger than their right siblings.

### Path Flexibility

Unlike a Trie where paths always end at leaves, Brick paths can terminate at any node. This is necessary because different words have different numbers of unique characters:

- "deed" → path `d → e` (2 characters)
- "deep" → path `d → e → p` (3 characters)
- "deprive" → path `d → e → i → p → r → v` (6 characters)

## Binary File Format (.brk)

Bricks are serialized to `.brk` files for efficient loading:

```
|-------BRICK_LIST------||--------OFFSET_LIST-------|
<ALPHABET_SIZE>[[KEY]#<BACKTRACK_COUNT>][<OFFSET><NUM_WORDS>[WORD#]]<BRICK_LENGTH>
```

### Format Components

| Field | Description |
|-------|-------------|
| `ALPHABET_SIZE` | Bytes per character (1 for ASCII, 4 for Unicode) |
| `KEY` | A single character in a path |
| `#` | Delimiter marker |
| `BACKTRACK_COUNT` | Levels to climb up when a path ends |
| `OFFSET` | Keys inserted before appending words to a path |
| `NUM_WORDS` | Number of words to append at path end |
| `WORD` | A word in the collection |
| `BRICK_LENGTH` | Total bytes in BRICK_LIST |

### Design Rationale

This format was chosen over simpler alternatives (like storing words in insertion order) because:

1. **Independence**: The format is decoupled from the `insert_word` algorithm and the internal data structure used for word storage
2. **Efficiency**: Loading traverses the Brick only once, rather than performing one insertion per word

## Puzzle Generation Algorithm

The algorithm finds valid puzzle paths (sequences of N letters that yield interesting word collections):

```
Input:
  n := Number of letters in the puzzle
  b := Brick

def get_combinations(brick, kn_tuple, current_sum=0, previous_path=""):
    if kn_tuple.empty():
        yield tuple()

    j = kn_tuple.front()

    for m in range(j, current_sum + 1):
        # Get all non-empty paths of length m
        m_flat = m_flat_brick(brick, m)

        # Find paths with (m-j) letters in common with previous_path
        r = build_regex(previous_path, m)
        candidate_paths = [path for path in m_flat if path.match(r)]

        for path in candidate_paths:
            yield (path,) + get_combinations(brick, kn_tuple, current_sum+j, path)

# Generate puzzle
kn_tuple = get_kn_tuple()  # Numbers summing to n
valid_puzzle_paths = list(get_combinations(brick, kn_tuple))
puzzle_path = shuffle_and_pick(valid_puzzle_paths)
word_collection = collect_all_words_subpaths(puzzle_path)
```

### Flat Brick Representation

The algorithm uses an "m-flat" representation: a string concatenating all non-empty paths of length m, separated by `$`.

Example (3-flat for the example Brick):
```
dep$der$dor$eip$eor$epr$erv$opr
```

### Word Collection

Once a puzzle path is selected (e.g., `deoprv`), all subpaths are explored to collect words:

| Subpath | Words |
|---------|-------|
| `de` | deed |
| `dep` | deep |
| `der` | deer |
| `deor` | order |
| `dor` | door |
| `dopr` | drop |
| `eor` | error |
| `eopr` | proper, rope |
| `eorv` | over |
| `eoprv` | prove |
| `epr` | pepper, peer |
| `erv` | ever |
| `opr` | poor |

### Statistics

In the English 5K corpus, there are **17,948 valid puzzles** with 7 letters.

## Implementation

### Source Files

- **Data structure**: `source/word-detective-backend/modules/datastr/`
  - `Brick.h` - Class definition
  - `Brick.cpp` - Implementation

- **Extensions**: `source/word-detective-backend/modules/standard-extensions/`
  - `traversal.hpp` - Pre-order and random path traversal
  - `io.hpp` - Binary serialization/deserialization

- **Puzzle generation**: `source/word-detective-backend/app/word-detective/`

### Usage Example

```cpp
// Load pre-built brick
Brick brick;
ifstream file("en-5K.brk", ios::binary);
IO::Load::run(brick, file);

// Generate random puzzle with 7 letters
json puzzle = random_puzzle(brick, 7);
// Returns: {"letters": "aeinrst", "words": ["rain", "stain", ...]}
```

## Unicode Support

Keys are stored as 32-bit integers representing Unicode code points, enabling multilingual support:

- French: `é` (233), `è` (232), `ê` (234)
- Portuguese: `ã` (227), `ç` (231), `ó` (243)
- Italian: `à` (224), `ì` (236), `ù` (249)
