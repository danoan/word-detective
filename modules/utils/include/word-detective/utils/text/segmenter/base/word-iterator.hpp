#ifndef WORD_DETECTIVE_UTILS_TEXT_SEGMENTER_BASE_WORD_ITERATOR_HPP
#define WORD_DETECTIVE_UTILS_TEXT_SEGMENTER_BASE_WORD_ITERATOR_HPP

#include <iterator>
#include <string>

#include "languages.h"

namespace WordDetective::Utils::Text {

class WordIterator {
 private:
  class WordIteratorBase {
   public:
    using iterator_category = std::input_iterator_tag;
    using value_type = std::string;

    WordIteratorBase() : m_words_read(0), m_the_end(false) {}
    virtual ~WordIteratorBase(){};

    value_type get_word() { return m_current_word; }

    friend bool operator==(const WordIteratorBase& a,
                           const WordIteratorBase& b) {
      if (a.m_the_end || b.m_the_end) {
        return a.m_the_end == b.m_the_end;
      } else {
        return a.m_words_read == b.m_words_read;
      }
    }

    friend bool operator!=(const WordIteratorBase& a,
                           const WordIteratorBase& b) {
      if (a.m_the_end || b.m_the_end) {
        return a.m_the_end != b.m_the_end;
      } else {
        return a.m_words_read != b.m_words_read;
      }
    }

    virtual void next_word() = 0;

   protected:
    std::string m_current_word;
    size_t m_words_read;
    bool m_the_end;
  };

 public:
  using iterator_category = WordIteratorBase::iterator_category;
  using value_type = WordIteratorBase::value_type;
  using Interface = WordIteratorBase;

  explicit WordIterator(WordIteratorBase* word_iterator_ptr)
      : m_word_iterator(word_iterator_ptr) {
    m_word_iterator->next_word();
  }

  WordIterator& operator++() {
    m_word_iterator->next_word();
    return *this;
  }

  value_type operator*() const { return m_word_iterator->get_word(); }

  friend bool operator==(const WordIterator& a, const WordIterator& b) {
    return (*a.m_word_iterator) == (*b.m_word_iterator);
  }

  friend bool operator!=(const WordIterator& a, const WordIterator& b) {
    return (*a.m_word_iterator) != (*b.m_word_iterator);
  }

 private:
  std::shared_ptr<WordIteratorBase> m_word_iterator;
};

class EmptyWordIterator : public WordIterator::Interface {
 public:
  EmptyWordIterator() { m_the_end = true; }
  void next_word() {}
};

}  // namespace WordDetective::Utils::Text

#endif
