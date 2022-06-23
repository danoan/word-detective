#include "catch/catch.hpp"
#include "word-detective/datastr/Brick.h"

using namespace WordDetective::Datastr;

class Traverse : public BrickExtension {
  using Callback = std::function<void(char key, _Brick::WordIterator begin,
                                      _Brick::WordIterator end)>;

  static void _run(Callback callback, const BrickInterface* brick) {
    callback(brick->key(), brick->beginWords(), brick->endWords());
    for (auto element : *brick) {
      _run(callback, element);
    }
  }

 public:
  static void run(Callback callback, const Brick& brick) {
    for (auto element : brick) {
      _run(callback, element);
    }
  }
};

TEST_CASE("Brick construction", "[datastr][brick]") {
  /*
   *dress -> ders
   *porch -> chopr
   *scared -> acders
   *faith -> afhit
   *night -> ghint
   *crosses -> ceors
   *lovers -> elorsv
   *streets -> erst
   *well -> elw
   *
   *         a           c       d         e         g
   *       c   f       e   h     e     l       r     h
   *       d   h       o   o     r     o w     s     i
   *       e   i       r   p     s     r       t     n
   *       r   t       s   r           s             t
   *       s                           v
   */

  using WordIterator = std::list<std::string>::const_iterator;

  Brick brick;
  std::list<std::string> words{ {"faith","lovers","crosses","night","dress","scared","porch","streets","well"} };
  for(auto word : words){
    brick << word;
  }

  SECTION("Store paths in order") {
    std::string to_compare = "";
    std::string pre_order_traversal = "acdersfhitceorshoprderselorsvwrstghint";

    Traverse::run([&to_compare](char key, WordIterator begin,
                                WordIterator end) { to_compare += key; },
                  brick);
    REQUIRE(to_compare == pre_order_traversal);
  }

  SECTION("Store all the words") {
    std::set<std::string> words_collection;
    Traverse::run(
        [&words_collection](char key, WordIterator begin,
                            WordIterator end) {
          words_collection.insert(begin, end);
        },
        brick);

    for(auto word: words){
      REQUIRE(words_collection.find(word)!=words_collection.end());
    }

  }
}
