#include "puzzle_generator_api.h"

namespace PuzzleGenerator {

std::list<std::string> generate_puzzle(
    GeneratePuzzleParameters gpm, const WordDetective::Datastr::Brick& brick) {
  auto vector_of_splits = SplitGenerator::generate_split_combinations(
      gpm.number_of_splits, gpm.number_of_letters);

  std::random_device rd;
  std::mt19937 g(rd());
  std::shuffle(vector_of_splits.begin(), vector_of_splits.end(), g);

  std::list<std::string> list_of_paths;
  while (!vector_of_splits.empty()) {
    auto selected_split = vector_of_splits.back();
    vector_of_splits.pop_back();

    list_of_paths = FindPath::find_path(brick, selected_split);
    if (!list_of_paths.empty()) break;
  }

  return list_of_paths;
}
}  // namespace PuzzleGenerator
