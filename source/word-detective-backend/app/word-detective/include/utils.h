#ifndef PUZZLEGENERATOR_UTILS_h
#define PUZZLEGENERATOR_UTILS_h

#include <list>
#include <memory>
#include <random>
#include <regex>
#include <set>
#include <sstream>
#include <string>
#include <unordered_set>
#include <vector>

#include "unicode/regex.h"
#include "unicode/utypes.h"
#include "word-detective/datastr/Brick.h"
#include "word-detective/standard-extensions/brick/traversal.hpp"
#include "word-detective/utils/unicode.h"

namespace PuzzleGenerator::SplitGenerator {
using SplitVector = std::vector<std::list<unsigned>>;

struct FixedParameters {
  unsigned number_of_elements;
  unsigned elements_sum;
};

struct MutableParameters {
  SplitVector vector_of_splits;
  std::list<unsigned> current_split;
};

struct ControlParameters {
  unsigned current_element_number;
  unsigned sum_remainder;
};

void _generate_split_combination(
    const std::unique_ptr<FixedParameters>& fixed_parameters,
    MutableParameters& mutable_parameters,
    ControlParameters& control_parameters);

/**
 * @brief Generates all combinations of `number_of_elements` numbers such that
 * their sum equals `elements_sum`
 *
 * @param number_of_elements
 * @param elements_sum
 * @return SplitVector
 */
SplitVector generate_split_combinations(unsigned number_of_elements,
                                        unsigned elements_sum);

}  // namespace PuzzleGenerator::SplitGenerator

namespace PuzzleGenerator::FlattenTraversal {
using Brick = WordDetective::Datastr::Brick;
using BrickInterface = WordDetective::Datastr::BrickInterface;
using PreOrder = WordDetective::StandardExtensions::Brick::Traversal::PreOrder;

std::string flatten_traversal(const Brick& brick, int path_length);
}  // namespace PuzzleGenerator::FlattenTraversal

namespace PuzzleGenerator::FindPath {
struct FixedParameters {
  std::mt19937 g;
};

struct MutableParameters {
  std::list<std::string> list_of_paths;
};

struct ControlParameters {
  std::string letters;
  std::list<unsigned> split;
};

std::string random_selection(const std::string& flatten_string);

bool _find_path(const WordDetective::Datastr::Brick& brick,
                const std::unique_ptr<FixedParameters>& fixed_parameters,
                MutableParameters& mutable_parameters,
                ControlParameters& control_parameters);

std::list<std::string> find_path(const WordDetective::Datastr::Brick& brick,
                                 std::list<unsigned>& split);
}  // namespace PuzzleGenerator::FindPath

namespace PuzzleGenerator::GetValidPathSequence {
std::list<std::string> get_valid_path_sequence(
    const WordDetective::Datastr::Brick& brick, unsigned number_of_splits,
    unsigned number_of_letters);
}

namespace PuzzleGenerator::WordCollector {
class SubPath : WordDetective::Datastr::BrickExtension {
  using Brick = WordDetective::Datastr::Brick;
  using BrickInterface = WordDetective::Datastr::BrickInterface;

  void static run(const std::vector<int>& path, size_t path_index,
                  icu::UnicodeString subpath,
                  std::unordered_set<std::string>& subpaths,
                  const BrickInterface* brick);

 public:
  void static run(std::unordered_set<std::string>& subpaths,
                  const std::string& path, const Brick& brick);
};

void collect_words(std::unordered_set<std::string>& words,
                   const std::string& letters,
                   const WordDetective::Datastr::Brick& brick);

void collect_words_from_all_subpaths(
    std::unordered_set<std::string>& word_collection,
    const std::string& letters, const WordDetective::Datastr::Brick& brick);

template <class TForwardIterator>
std::string get_unique_characters(
    const std::unordered_set<std::string>& word_collection);

}  // namespace PuzzleGenerator::WordCollector

namespace PuzzleGenerator {
struct GeneratePuzzleParameters {
  unsigned int number_of_letters;
  unsigned int number_of_splits;
};

std::unordered_set<std::string> generate_puzzle(
    GeneratePuzzleParameters gpm, const WordDetective::Datastr::Brick& brick);

}  // namespace PuzzleGenerator

#include "utils.hpp"

#endif
