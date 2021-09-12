#ifndef WORD_DETECTIVE_UTILS_TEXT_SEGMENTER_HPP
#define WORD_DETECTIVE_UTILS_TEXT_SEGMENTER_HPP

#include <string>
#include <unordered_map>

#include "segmenter/base/languages.h"
#include "segmenter/base/general-segmenter.hpp"

namespace WordDetective::Utils::Text {

template <Languages language>
void segment_into_map(std::unordered_map<std::string, int>& word_frequency_map,
                      std::istream& in_stream,
                      FilterFunction filter = always_true_filter) {
  GeneralSegmenter<language> GS(&in_stream, filter);

  for (auto word : GS) {
    if (word_frequency_map.find(word) == word_frequency_map.end()) {
      word_frequency_map[word] = 1;
    } else {
      word_frequency_map[word] += 1;
    }
  }
}
}  // namespace WordDetective::Utils::Text

#endif
