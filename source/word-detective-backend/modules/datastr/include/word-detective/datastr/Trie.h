#ifndef WORD_DETECTIVE_DATASTR_TRIE_H
#define WORD_DETECTIVE_DATASTR_TRIE_H

#include <list>
#include <string>
#include <memory>

namespace WordDetective::Datastr {

/*
* A Trie stores a collection of words.
*
* A Trie is a forest of words. A word is stored in the form of a path. If word
* `w` is stored in the Trie, then there is a tree in the forest which has a path
* from root to leave that forms word `w`.
*
* Words that share the same prefix shares the portion of the path corresponding to
* the prefix they share.
*/
class Trie {
  class _Trie;
  std::unique_ptr<_Trie> m_root;

 public:
  using Iterator = std::list<_Trie*>::const_iterator;

  Trie();
  Trie(const Trie& other) = delete;
  Trie& operator=(const Trie& other) = delete;

  void insert_word(const std::string& word);
  Trie& operator<<(const std::string& word);

  Iterator begin() const;
  Iterator end() const;
};

class Trie::_Trie {
  std::list<_Trie*> m_children;
  char m_c;
  bool m_valid_word;
  int m_frequency;

 public:
  using Iterator = std::list<_Trie*>::const_iterator;

  _Trie():m_frequency(0){};
  _Trie(char c) : m_c(c),m_frequency(0) {}
  ~_Trie();

  _Trie* insert(char new_c, Iterator pos_it);

  inline Iterator begin() const { return m_children.begin(); }
  inline Iterator end() const { return m_children.end(); }
  inline char key() const { return m_c; }
  inline void make_a_word() { m_valid_word = true; m_frequency++; }
  inline bool is_word() const { return m_valid_word; }
  inline int frequency() const { return m_frequency; }
};

}  // namespace WordDetective::Datastr

#endif