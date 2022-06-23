#include "word-detective/datastr/Trie.h"

namespace WordDetective::Datastr {
Trie::_Trie::~_Trie() {
  for (auto t : m_children) {
    delete t;
  }
}

Trie::_Trie* Trie::_Trie::insert(char new_c, Iterator pos_it) {
  _Trie* t = new _Trie(new_c);
  m_children.insert(pos_it, t);

  return t;
}

void Trie::insert_word(const std::string& word) {
  _Trie* curr = m_root.get();

  for (auto c : word) {
    bool found = false;
    auto pos_it = curr->begin();
    for (; pos_it != curr->end(); pos_it++) {
      // Does not work for utf8 characters
      if (c == (*pos_it)->key()) {
        curr = *pos_it;
        found = true;
        break;
      } else if (c < (*pos_it)->key()) {
        break;
      }
    }

    if (!found) {
      curr = curr->insert(c, pos_it);
    }
  }

  curr->make_a_word();
}

Trie& Trie::operator<<(const std::string& word){
  insert_word(word);
  return *this;
}

Trie::Trie() : m_root(new Trie::_Trie()) {}
Trie::Iterator Trie::begin() const { return m_root->begin(); }
Trie::Iterator Trie::end() const { return m_root->end(); }
}  // namespace WordDetective::Datastr