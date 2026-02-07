#ifndef WORD_DETECTIVE_WORD_DETECTIVE_API_H
#define WORD_DETECTIVE_WORD_DETECTIVE_API_H

#include <list>
#include <random>
#include <string>
#include <unordered_set>

#include "nlohmann/json.hpp"
#include "word-detective/datastr/Brick.h"
#include "word-detective/standard-extensions/brick/traversal.hpp"
#include "word-detective/utils/text/filter.hpp"
#include "word-detective/utils/text/segmenter.hpp"
#include "word-detective/utils/text/segmenter/base/languages.h"
#include "word-detective/utils/text/segmenter/english.hpp"
#include "word-detective/utils/text/segmenter/italian.hpp"
#include "word-detective/utils/unicode.h"
#include "utils.h"

using namespace std;
using namespace WordDetective;

using json = nlohmann::json;

namespace Puzzle {
struct Puzzle {
  std::string letters;
  std::list<std::string> words;
};

void to_json(json& j, const Puzzle& puzzle);
void from_json(const json& j, Puzzle& puzzle);
ostream& operator<<(ostream& os, const Puzzle& puzzle);
ostream& operator<<(ostream& os, const std::list<Puzzle>& list_of_puzzles);

};  // namespace Puzzle

Datastr::Brick create_brick(std::istream& book_stream, WordDetective::Utils::Text::Languages language);

json random_puzzle(const Datastr::Brick& brick, size_t num_letters);

/**
 * @brief Generates a random puzzle by selecting random letters and checking if
 * a valid puzzle exists
 *
 * @param brick The brick containing the word collection
 * @param num_letters Number of letters to select (default 7)
 * @param max_attempts Maximum attempts to find a valid puzzle (default 3)
 * @return json JSON representation of the puzzle, or empty JSON if no valid
 * puzzle found
 */
json random_puzzle_by_letters(const Datastr::Brick& brick,
                              size_t num_letters = 7,
                              size_t max_attempts = 3);

json all_puzzles(const Datastr::Brick& brick, size_t num_letters,
                 size_t min_words);
json puzzle_by_index(const Datastr::Brick& brick, size_t num_letters,
                     size_t min_words, size_t index);

#endif
