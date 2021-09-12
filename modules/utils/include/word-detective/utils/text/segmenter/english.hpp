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
    WordIteratorImpl(std::istream* in_stream,
                     FilterFunction filter = always_true_filter)
        : m_in_stream(in_stream), m_filter(filter) {
      m_last_pos = in_stream->tellg();
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
      m_in_stream->seekg(m_last_pos);

      m_in_stream->read(m_buffer, BUFFER_SIZE);
      int last = m_in_stream->gcount() - 1;

      int back_step = 0;
      if (!m_in_stream->eof()) {
        while (m_buffer[last] != '\n') {
          m_buffer[last--] = '\0';
          back_step--;
        }
        m_in_stream->seekg(back_step, std::ios_base::cur);
      }

      m_buffer_begin = m_buffer;
      m_last_pos = m_in_stream->tellg();
    }

   private:
    static std::regex rgx;
    static constexpr unsigned int BUFFER_SIZE = 32000;

    std::istream* m_in_stream;
    char m_buffer[BUFFER_SIZE];
    const char* m_buffer_begin;
    std::streampos m_last_pos;

    std::cmatch m_match;
    FilterFunction m_filter;
  };

 public:
  EnglishSegmenter(std::istream* in_stream,
                   FilterFunction filter = always_true_filter)
      : m_in_stream(in_stream), m_filter(filter) {}

  WordIterator begin() {
    return WordIterator(new WordIteratorImpl(m_in_stream, m_filter));
  }

  WordIterator end() { return new EmptyWordIterator(); }

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