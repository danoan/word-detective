#ifndef PUZZLEGENERATOR_UTILS_h
#define PUZZLEGENERATOR_UTILS_h

#include <list>
#include <memory>
#include <random>
#include <regex>
#include <set>
#include <sstream>
#include <string>
#include <vector>

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

#endif
