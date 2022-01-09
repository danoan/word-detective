#ifndef WORD_DETECTIVE_SPELLINGBEE_INPUTDATA_H
#define WORD_DETECTIVE_SPELLINGBEE_INPUTDATA_H

#include <string>
#include "word-detective/utils/text/segmenter/base/languages.h"

struct InputData {
  using Languages = WordDetective::Utils::Text::Languages;
  enum OutputMode{ALL_PUZZLES,RANDOM_PUZZLE,PUZZLE_BY_INDEX};

  std::string filepath;
  std::string outputfilepath{};

  OutputMode out_mode{ALL_PUZZLES};
  int index{0};

  int num_letters{5};
  int min_words{5};

  Languages language;

};

#endif