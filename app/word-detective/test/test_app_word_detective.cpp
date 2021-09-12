#include <catch/catch.hpp>
#include <iostream>

#include "boost/filesystem.hpp"
#include "word-detective-api.h"
#include "word-detective/standard-extensions/brick/io.hpp"
#include "word-detective/utils/text/filter.hpp"
#include "word-detective/utils/text/segmenter.hpp"
#include "word-detective/utils/text/segmenter/english.hpp"

TEST_CASE("Word detective API", "[app][word-detective]") {
  SECTION("path from word") {
    REQUIRE(path_from_word("compound") == "cdmnopu");
    REQUIRE(path_from_word("memorial") == "aeilmor");
  }

  std::string list_of_5k_english_words_filepath = PROJECT_SOURCE_DIR;
  list_of_5k_english_words_filepath +=
      "/app/word-detective/test/input/ef-5000.txt";

  std::ifstream ifs(list_of_5k_english_words_filepath);
  std::unordered_map<std::string, int> word_map;
  Utils::Text::segment_into_map<Utils::Text::Languages::English>(
      word_map, ifs, [](const std::string& word) {
        using namespace WordDetective::Utils::Text;
        return !starts_with_capital_letter(word) &&
               more_than_n_characters<3>(word);
      });

  INFO(word_map.size());
  REQUIRE(word_map.size() == 4241);

  Datastr::Brick brick_5k;
  for (auto p : word_map) brick_5k << p.first;

  SECTION("collect words from path") {
    std::list<std::string> words_to_check{"coalition", "location",
                                          "allocation"};
    std::unordered_set<std::string> word_collection;
    collect_words(word_collection, "acilnot", brick_5k);

    INFO(word_collection.size());
    REQUIRE(word_collection.size() == words_to_check.size());
    for (auto word : words_to_check) {
      INFO(word);
      REQUIRE(word_collection.find(word) != word_collection.end());
    }
  }

  SECTION("collect words from all subpaths in cdmnopu") {
    std::list<std::string> words_to_check{"coup",   "mood", "compound", "dump",
                                          "pound",  "pond", "pump",     "upon",
                                          "common", "noon", "mood"};
    std::unordered_set<std::string> word_collection;
    collect_words_from_all_subpaths(word_collection, "cdmnopu", brick_5k);

    INFO(word_collection.size());
    REQUIRE(word_collection.size() == words_to_check.size());
    for (auto word : word_collection) {
      INFO(word);
      REQUIRE(word_collection.find(word) != word_collection.end());
    }
  }

  SECTION("collect words from all subpaths in aeilmor") {
    std::list<std::string> words_to_check{
        "area", "realm", "rear",   "rare", "moral",  "memorial", "rail",
        "room", "roll",  "mirror", "role", "male",   "loom",     "mill",
        "meal", "error", "mere",   "more", "memoir", "oral",     "mail",
        "memo", "mall",  "email",  "real"};
    std::unordered_set<std::string> word_collection;
    collect_words_from_all_subpaths(word_collection, "aeilmor", brick_5k);

    INFO(word_collection.size());
    REQUIRE(word_collection.size() == words_to_check.size());
    for (auto word : word_collection) {
      INFO(word);
      REQUIRE(word_collection.find(word) != word_collection.end());
    }
  }

  SECTION("collect words from all subpaths in acilnot") {
    std::list<std::string> words_to_check{
        "attain",  "total",      "intact",   "tail",     "onto",
        "noon",    "tactic",     "canal",    "cotton",   "clinic",
        "initial", "national",   "nation",   "action",   "coalition",
        "call",    "toll",       "location", "colonial", "clinical",
        "contact", "tactical",   "coat",     "onion",    "into",
        "notion",  "local",      "coal",     "tool",     "tall",
        "cool",    "allocation", "icon",     "contain",  "loan"};

    std::unordered_set<std::string> word_collection;
    collect_words_from_all_subpaths(word_collection, "acilnot", brick_5k);

    INFO(word_collection.size());
    REQUIRE(word_collection.size() == words_to_check.size());
    for (auto word : word_collection) {
      INFO(word);
      REQUIRE(word_collection.find(word) != word_collection.end());
    }
  }
}
