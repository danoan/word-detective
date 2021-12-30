#ifndef WORD_DETECTIVE_EXPORTBRICK_INPUTDATA_H
#define WORD_DETECTIVE_EXPORTBRICK_INPUTDATA_H

#include <string>

#include "word-detective/utils/text/segmenter/base/languages.h"

struct InputData{
  using Languages = WordDetective::Utils::Text::Languages;

  std::string input_filepath;
  std::string output_filepath;

  Languages language;
};

#endif