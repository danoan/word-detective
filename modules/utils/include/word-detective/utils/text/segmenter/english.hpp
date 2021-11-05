#ifndef WORD_DETECTIVE_UTILS_TEXT_SEGMENTER_ENGLISH_HPP
#define WORD_DETECTIVE_UTILS_TEXT_SEGMENTER_ENGLISH_HPP

#include <istream>
#include <regex>
#include <string>

#include "base/general-segmenter.hpp"
#include "base/languages.h"
#include "base/word-iterator.hpp"

namespace WordDetective::Utils::Text {
class EnglishSegmenter : public SegmenterInterface {
 public:
  class WordIteratorImpl : public WordIterator::Interface {
   public:
    explicit WordIteratorImpl(std::istream* in_stream,
                              FilterFunction filter = always_true_filter)
        : m_in_stream(in_stream), m_filter(filter), m_last_back_step(-1) {
      fill_up_buffer();
    }

    void next_word() {
      if (std::regex_search(m_buffer_begin, m_match, rgx)) {
        m_words_read++;
        m_buffer_begin = m_match[0].second;
        m_current_word = m_match.str();
        if (!m_filter(m_current_word)) next_word();
      } else {
        if (m_in_stream->eof()) {
          m_the_end = true;
        } else {
          fill_up_buffer();
          next_word();
        }
      }
    }

   private:
    void fill_up_buffer() {
      unsigned int read_start = 0;
      for (; m_last_back_step >= 0; ++read_start, --m_last_back_step) {
        m_buffer[read_start] = m_buffer[BUFFER_HALF_SIZE + m_last_back_step];
      }

      memset((m_buffer + read_start), '\0', BUFFER_HALF_SIZE - read_start);
      m_in_stream->read((m_buffer + read_start), BUFFER_HALF_SIZE - read_start);
      int last = m_in_stream->gcount() - 1;

      m_last_back_step = -1;
      if (!m_in_stream->eof()) {
        while (m_buffer[last] != '\n') {
          m_last_back_step++;
          m_buffer[BUFFER_HALF_SIZE + m_last_back_step] = m_buffer[last];
          m_buffer[last--] = '\0';
        }
      }

      m_buffer_begin = m_buffer;
    }

   private:
    static std::regex rgx;
    static constexpr unsigned int BUFFER_SIZE = 64000;
    static constexpr unsigned int BUFFER_HALF_SIZE = 32000;

    std::istream* m_in_stream;
    char m_buffer[BUFFER_SIZE];
    const char* m_buffer_begin;
    int m_last_back_step;

    std::cmatch m_match;
    FilterFunction m_filter;
  };

 public:
  explicit EnglishSegmenter(std::istream* in_stream,
                            FilterFunction filter = always_true_filter)
      : m_in_stream(in_stream), m_filter(filter) {}

  WordIterator begin() {
    return WordIterator(new WordIteratorImpl(m_in_stream, m_filter));
  }

  WordIterator end() { return WordIterator(new EmptyWordIterator()); }

 private:
  std::istream* m_in_stream;
  FilterFunction m_filter;
};

template <>
class SegmenterSelector<Languages::English> {
 public:
  using Segmenter = EnglishSegmenter;
};

}  // namespace WordDetective::Utils::Text

#endif