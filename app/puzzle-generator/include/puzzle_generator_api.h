#ifndef PUZZLEGENERATOR_API_H
#define PUZZLEGENERATOR_API_H

#include <iostream>
#include <random>
#include <unordered_set>

#include "utils.h"
#include "word-detective/datastr/Brick.h"

namespace PuzzleGenerator {
struct GeneratePuzzleParameters {
  unsigned int number_of_letters;
  unsigned int number_of_splits;
};

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

std::unordered_set<std::string> generate_puzzle(
    GeneratePuzzleParameters gpm, const WordDetective::Datastr::Brick& brick);
}  // namespace PuzzleGenerator

#endif
