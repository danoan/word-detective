
#include "word-detective/standard-extensions/brick/traversal.hpp"

namespace WordDetective::StandardExtensions::Brick::Traversal {

void PreOrder::_run(const Callback& func, const BrickInterface* brick, int level) {
  func(*brick, level);

  for (auto it = brick->begin(); it != brick->end(); ++it) {
    _run(func, *it, level + 1);
  }
}

void PreOrder::run(const Callback& func, const Brick& brick) {
  for (auto it = brick.begin(); it != brick.end(); ++it) {
    _run(func, *it);
  }
}

void PreOrder::run(std::ostream& os, const Brick& brick) {
  auto func = [&os](const BrickInterface& b, int level) {
    for (int i = 0; i < level; ++i) os << " ";
    os << b.key() << "\n";
  };

  for (auto it = brick.begin(); it != brick.end(); ++it) {
    _run(func, *it);
  }
}

}  // namespace WordDetective::StandardExtensions::Brick::Traversal
