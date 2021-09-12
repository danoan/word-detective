#include "word-detective/datastr/Brick.h"

namespace WordDetective::Datastr {
Brick::_Brick::~_Brick() {
  for (auto t : m_children) {
    delete t;
  }
}

Brick::_Brick* Brick::_Brick::insert(char new_c, Iterator pos_it) {
  _Brick* t = new _Brick(new_c);
  m_children.insert(pos_it, t);

  return t;
}

Brick::_Brick* Brick::_Brick::insert(char new_c) {
  _Brick* t = new _Brick(new_c);
  m_children.push_back(t);

  return t;
}

void Brick::insert_word(const std::string& word) {
  using namespace std;

  BrickInterface* curr = m_root.get();

  string bricks = word;
  sort(bricks.begin(), bricks.end());
  {
    int n = bricks.size();
    for (int i = n - 1; i > 0; --i) {
      if (bricks[i - 1] == bricks[i]) {
        bricks.erase(i, 1);
      }
    }
  }

  for (auto c : bricks) {
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
      curr = static_cast<_Brick*>(curr)->insert(c, pos_it);
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
