#ifndef PUZZLEGENERATOR_API_H
#define PUZZLEGENERATOR_API_H

#include <iostream>
#include <random>

#include "word-detective/datastr/Brick.h"
#include "utils.h"

namespace PuzzleGenerator {
struct GeneratePuzzleParameters {
  unsigned int number_of_letters;
  unsigned int number_of_splits;
};

std::list<std::string> generate_puzzle(GeneratePuzzleParameters gpm,  const WordDetective::Datastr::Brick& brick);
}  // namespace PuzzleGenerator

#endif
