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
#include "word-detective/utils/text/segmenter/english.hpp"

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

Datastr::Brick create_brick(std::istream& book_stream);

class SubPath : Datastr::BrickExtension {
  using Brick = Datastr::Brick;
  using BrickInterface = Datastr::BrickInterface;

  void static run(const std::string& path, int path_index, std::string subpath,
                  std::unordered_set<std::string>& subpaths,
                  const BrickInterface* brick);

 public:
  void static run(std::unordered_set<std::string>& subpaths,
                  const std::string& path, const Brick& brick);
};

void collect_words(unordered_set<string>& words, const string& letters,
                   const Datastr::Brick& brick);

void collect_words_from_all_subpaths(unordered_set<string>& word_collection,
                                     const string& letters,
                                     const Datastr::Brick& brick);

std::string path_from_word(const std::string& word);

void get_all_puzzles(std::list<Puzzle::Puzzle>& list_of_puzzles,
                     const Datastr::Brick& brick, int num_letters);
json all_puzzles(const Datastr::Brick& brick, size_t num_letters, size_t min_words);
json random_puzzle(const Datastr::Brick& brick, size_t num_letters, size_t min_words);
json puzzle_by_index(const Datastr::Brick& brick, size_t num_letters,
                     size_t min_words, int index);

#endif
