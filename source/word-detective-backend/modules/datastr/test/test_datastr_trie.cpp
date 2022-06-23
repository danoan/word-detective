#include "catch/catch.hpp"
#include "word-detective/datastr/Trie.h"

using namespace WordDetective::Datastr;

using Callback = std::function<void(char key)>;
template <class TIterator>
void traverse(Callback callback, TIterator parent) {
  callback(parent->key());
  for (auto kid : *parent) {
    traverse(callback, kid);
  }
}

TEST_CASE("Trie construction", "[datastr][trie]") {
  Trie trie;
  std::list<std::string> words{
      {"happy", "happiness", "hamburger", "chair", "channel"}};
  for (auto w : words) trie << w;

  SECTION("Store paths in order") {
    std::string pre_order_travsersal = "chairnnelhamburgerppinessy";
    std::string to_compare = "";
    for (auto it : trie) traverse([&to_compare](char k) { to_compare += k; },it);
    REQUIRE(to_compare == pre_order_travsersal);
  }
}