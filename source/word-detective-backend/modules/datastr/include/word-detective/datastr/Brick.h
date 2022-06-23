#ifndef WORD_DETECTIVE_DATASTR_BRICK_H
#define WORD_DETECTIVE_DATASTR_BRICK_H

#include <algorithm>
#include <list>
#include <memory>
#include <string>
#include <vector>

#include "word-detective/utils/unicode.h"

namespace WordDetective::Datastr {

/*
 * A Brick stores a collection of words.
 *
 * A path to a word `w` is formed by the ordered sequence of its unique
 * characters. For example, the path for the word "screen" is "cenrs".
 *
 * At the end of a path, we have all the words in the collection
 * that can be constructed using only the characters in the path.
 *
 * At each level of the brick, the characters are sorted in ascending order.
 *
 * Keys are stores as 32 bits integers. They represent their unicode code
 * point.
 */
class BrickInterface {
 public:
  using Iterator = std::list<BrickInterface*>::const_iterator;
  using WordIterator = std::list<std::string>::const_iterator;

  virtual ~BrickInterface(){};

  virtual Iterator begin() const = 0;
  virtual Iterator end() const = 0;

  virtual WordIterator beginWords() const = 0;
  virtual WordIterator endWords() const = 0;

  virtual int key() const = 0;
  virtual bool is_root() const = 0;
};

class Brick {
 public:
  friend class BrickExtension;
  class _Brick;

  std::unique_ptr<BrickInterface> m_root;

 public:
  Brick();

  Brick(Brick&& other) : m_root(std::move(other.m_root)) {}
  Brick& operator=(Brick&& other) {
    this->m_root = std::move(other.m_root);
    return *this;
  }

  Brick& operator=(const Brick& other) = delete;
  Brick(const Brick& brick) = delete;

  Brick& operator<<(const std::string& word);
  void insert_word(const std::string& word);

  BrickInterface::Iterator begin() const;
  BrickInterface::Iterator end() const;
};

class Brick::_Brick : public BrickInterface {
 public:
  bool m_is_root;
  int m_key;
  std::list<BrickInterface*> m_children;
  std::list<std::string> m_words;

 public:
  _Brick(bool is_root = false) : m_is_root(is_root){};
  _Brick(int key) : m_key(key) {}
  ~_Brick();

  _Brick(const _Brick&) = delete;
  _Brick& operator=(const _Brick&) = delete;

  _Brick(_Brick&& other) {
    std::move(other.m_children.begin(), other.m_children.end(),
              std::back_inserter(this->m_children));
    std::move(other.m_words.begin(), other.m_words.end(),
              std::back_inserter(this->m_words));
  }

  _Brick* insert(int new_key, Iterator pos_it);
  _Brick* insert(int new_key);

  inline Iterator begin() const { return m_children.begin(); }
  inline Iterator end() const { return m_children.end(); }

  inline WordIterator beginWords() const { return m_words.begin(); }
  inline WordIterator endWords() const { return m_words.end(); }

  inline int key() const { return m_key; }
  inline void add_word(const std::string& word) { m_words.push_back(word); }

  inline size_t num_nodes() const { return m_children.size(); }
  inline size_t num_words() const { return m_words.size(); }
  inline bool is_root() const { return m_is_root; }
};

class BrickExtension {
 protected:
  using _Brick = Brick::_Brick;
  static _Brick* get_root(const Brick& brick) {
    return static_cast<_Brick*>(brick.m_root.get());
  }
};

}  // namespace WordDetective::Datastr

#endif
