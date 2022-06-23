#include "word-detective/datastr/Brick.h"

namespace WordDetective::Datastr {
Brick::_Brick::~_Brick() {
  for (auto t : m_children) {
    delete t;
  }
}

Brick::_Brick* Brick::_Brick::insert(int new_key, Iterator pos_it) {
  _Brick* t = new _Brick(new_key);
  m_children.insert(pos_it, t);

  return t;
}

Brick::_Brick* Brick::_Brick::insert(int new_key) {
  _Brick* t = new _Brick(new_key);
  m_children.push_back(t);

  return t;
}

void Brick::insert_word(const std::string& word) {
  using namespace std;

  BrickInterface* curr = m_root.get();

  vector<int> unicode_codes = WordDetective::Utils::to_unicode_codes(word);
  sort(unicode_codes.begin(),unicode_codes.end());
  auto last = unique(unicode_codes.begin(),unicode_codes.end());
  unicode_codes.erase(last,unicode_codes.end());

  for (auto key : unicode_codes) {
    bool found = false;
    auto pos_it = curr->begin();
    for (; pos_it != curr->end(); pos_it++) {
      // Does not work for utf8 characters
      if (key == (*pos_it)->key()) {
        curr = *pos_it;
        found = true;
        break;
      } else if (key < (*pos_it)->key()) {
        break;
      }
    }

    if (!found) {
      curr = static_cast<_Brick*>(curr)->insert(key, pos_it);
    }
  }

  static_cast<_Brick*>(curr)->add_word(word);
}

Brick& Brick::operator<<(const std::string& word){
  insert_word(word);
  return *this;
}

Brick::Brick() : m_root(new Brick::_Brick()){};
BrickInterface::Iterator Brick::begin() const { return m_root->begin(); }
BrickInterface::Iterator Brick::end() const { return m_root->end(); }

}  // namespace WordDetective::Datastr
