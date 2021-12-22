#ifndef WORD_DETECTIVE_UTILS_TEXT_SEGMENTER_BASE_GENERAL_SEGMENTER_HPP
#define WORD_DETECTIVE_UTILS_TEXT_SEGMENTER_BASE_GENERAL_SEGMENTER_HPP

#include <functional>
#include <istream>
#include <memory>
#include <string>

#include "languages.h"
#include "word-iterator.hpp"

namespace WordDetective::Utils::Text {
using FilterFunction = std::function<bool(const std::string)>;
bool always_true_filter(const std::string& s);

class SegmenterInterface {
 public:
  virtual ~SegmenterInterface(){};
  virtual WordIterator begin() = 0;
  virtual WordIterator end() = 0;
};

class DefaultSegmenter {
 public:
  //TODO: Make something like static_assert (I tried but didnt work)
  template <class... Types>
  explicit DefaultSegmenter(Types... args) {
    throw std::runtime_error("Segmenter is missing for this language. Make sure to include the language segmenter .hpp file. For example, english.hpp");
  }

  WordIterator begin() { return WordIterator(nullptr); }
  WordIterator end() { return WordIterator(nullptr); }
};

template <Languages language>
class SegmenterSelector {
 public:
  using Segmenter = DefaultSegmenter;
};

template <Languages language>
class GeneralSegmenter : public SegmenterInterface {
 public:
  using Segmenter = typename SegmenterSelector<language>::Segmenter;

 public:
  explicit GeneralSegmenter(std::istream* in_stream,
                   FilterFunction filter = always_true_filter) {
    m_segmenter.reset(new Segmenter(in_stream, filter));
  }

  WordIterator begin() { return m_segmenter->begin(); }
  WordIterator end() { return m_segmenter->end(); }

 private:
  std::unique_ptr<Segmenter> m_segmenter;
};

}  // namespace WordDetective::Utils::Text

#endif
