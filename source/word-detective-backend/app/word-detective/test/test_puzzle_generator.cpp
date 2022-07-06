#include <iostream>

#include "catch/catch.hpp"
#include "unicode/regex.h"
#include "unicode/utypes.h"
#include "utils.h"
#include "word-detective/datastr/Brick.h"
#include "word-detective/standard-extensions/brick/io.hpp"

TEST_CASE("Split Combinations", "[puzzle-generator][split-combinations]") {
  auto equal_vector_of_splits =
      [](const PuzzleGenerator::SplitGenerator::SplitVector& v1,
         const PuzzleGenerator::SplitGenerator::SplitVector& v2) {
        REQUIRE(v1.size() == v2.size());

        auto it_1 = v1.begin();
        auto it_2 = v2.begin();
        while (it_1 != v1.end()) {
          REQUIRE(*it_1 == *it_2);
          it_1++;
          it_2++;
        }
      };

  auto print_list_of_splits =
      [](const PuzzleGenerator::SplitGenerator::SplitVector& list_of_splits) {
        for (auto s : list_of_splits) {
          for (auto n : s) {
            std::cout << n << ",";
          }
          std::cout << std::endl;
        }
      };

  SECTION("generate_split_combinations(1,7)") {
    std::vector<std::list<unsigned> > LIST_OF_SPLITS = {{7}};
    auto list_of_splits =
        PuzzleGenerator::SplitGenerator::generate_split_combinations(1, 7);

    equal_vector_of_splits(LIST_OF_SPLITS, list_of_splits);
  }

  SECTION("generate_split_combinations(2,7)") {
    std::vector<std::list<unsigned> > LIST_OF_SPLITS = {{1, 6}, {2, 5}, {3, 4}};
    auto list_of_splits =
        PuzzleGenerator::SplitGenerator::generate_split_combinations(2, 7);

    equal_vector_of_splits(LIST_OF_SPLITS, list_of_splits);
  }

  SECTION("generate_split_combinations(3,7)") {
    std::vector<std::list<unsigned> > LIST_OF_SPLITS = {
        {1, 1, 5}, {1, 2, 4}, {1, 3, 3}, {2, 2, 3}};
    auto list_of_splits =
        PuzzleGenerator::SplitGenerator::generate_split_combinations(3, 7);

    equal_vector_of_splits(LIST_OF_SPLITS, list_of_splits);
  }

  SECTION("generate_split_combinations(3,10)") {
    std::vector<std::list<unsigned> > LIST_OF_SPLITS = {
        {1, 1, 8}, {1, 2, 7}, {1, 3, 6}, {1, 4, 5},
        {2, 2, 6}, {2, 3, 5}, {2, 4, 4}, {3, 3, 4}};
    auto list_of_splits =
        PuzzleGenerator::SplitGenerator::generate_split_combinations(3, 10);

    equal_vector_of_splits(LIST_OF_SPLITS, list_of_splits);
    // print_list_of_splits(list_of_splits);
  }
}

TEST_CASE("Flatten Traversal",
          "[puzzle-generator][english][flatten-traversal]") {
  std::string BRICK_FILEPATH = PROJECT_SOURCE_DIR;
  BRICK_FILEPATH += "/app/word-detective/test/input/en-5K.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  SECTION("Paths of length 0") {
    std::string flatten_traversal_string =
        PuzzleGenerator::FlattenTraversal::flatten_traversal(brick, 0);
    REQUIRE(flatten_traversal_string == "$$");
  }

  SECTION("Paths of length 3") {
    std::string FLATTEN_TRAVERSAL_SEGMENT =
        "$abl$abs$aby$acl$ade$adr$adt$aer$aes$afl$agn$ahl$aht$alm$alt$alw$aly$"
        "ams$aps$ary$awy$bel$";

    std::string flatten_traversal_string =
        PuzzleGenerator::FlattenTraversal::flatten_traversal(brick, 3);

    REQUIRE(
        flatten_traversal_string.substr(0, FLATTEN_TRAVERSAL_SEGMENT.size()) ==
        FLATTEN_TRAVERSAL_SEGMENT);
  }

  SECTION("Paths of length 4") {
    std::string FLATTEN_TRAVERSAL_SEGMENT =
        "$abck$abdn$abek$abel$abem$aben$aber$abes$abet$";
    std::string flatten_traversal_string =
        PuzzleGenerator::FlattenTraversal::flatten_traversal(brick, 4);

    REQUIRE(
        flatten_traversal_string.substr(0, FLATTEN_TRAVERSAL_SEGMENT.size()) ==
        FLATTEN_TRAVERSAL_SEGMENT);
  }

  SECTION("Paths of length 7") {
    std::string FLATTEN_TRAVERSAL_SEGMENT =
        "$abcdeln$abcdenu$abcehmr$abceilp$abceils$abceint$abcelrt$abceruy$"
        "abcgikn$abcgilo$abcilsy$abdeils$abdhnsu$";
    std::string flatten_traversal_string =
        PuzzleGenerator::FlattenTraversal::flatten_traversal(brick, 7);

    REQUIRE(
        flatten_traversal_string.substr(0, FLATTEN_TRAVERSAL_SEGMENT.size()) ==
        FLATTEN_TRAVERSAL_SEGMENT);
  }
}

TEST_CASE("Get Valid English Path Sequence",
          "[puzzle-generator][english][valid-path-sequence]") {
  std::string BRICK_FILEPATH = PROJECT_SOURCE_DIR;
  BRICK_FILEPATH += "/app/word-detective/test/input/en-5K.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  SECTION("5 letters and 2 splits") {
    unsigned number_of_letters = 5;
    unsigned number_of_splits = 2;

    for (int i = 0; i < 100; ++i) {
      auto list_of_paths =
          PuzzleGenerator::GetValidPathSequence::get_valid_path_sequence(
              brick, number_of_splits, number_of_letters);
      std::set<char> unique_chars;
      for (auto s : list_of_paths) {
        unique_chars.insert(s.begin(), s.end());
      }
      REQUIRE(unique_chars.size() == 5);
    }
  }

  SECTION("7 letters and 2 splits") {
    unsigned number_of_letters = 7;
    unsigned number_of_splits = 2;

    for (int i = 0; i < 100; ++i) {
      auto list_of_paths =
          PuzzleGenerator::GetValidPathSequence::get_valid_path_sequence(
              brick, number_of_splits, number_of_letters);
      std::set<char> unique_chars;
      for (auto s : list_of_paths) {
        unique_chars.insert(s.begin(), s.end());
      }
      REQUIRE(unique_chars.size() == 7);
    }
  }

  SECTION("10 letters and 2 splits") {
    unsigned number_of_letters = 10;
    unsigned number_of_splits = 2;

    for (int i = 0; i < 100; ++i) {
      auto list_of_paths =
          PuzzleGenerator::GetValidPathSequence::get_valid_path_sequence(
              brick, number_of_splits, number_of_letters);
      std::set<char> unique_chars;
      for (auto s : list_of_paths) {
        unique_chars.insert(s.begin(), s.end());
      }
      REQUIRE(unique_chars.size() == 10);
    }
  }

  SECTION("10 letters and 3 splits") {
    unsigned number_of_letters = 10;
    unsigned number_of_splits = 3;

    for (int i = 0; i < 100; ++i) {
      auto list_of_paths =
          PuzzleGenerator::GetValidPathSequence::get_valid_path_sequence(
              brick, number_of_splits, number_of_letters);
      std::set<char> unique_chars;
      for (auto s : list_of_paths) {
        unique_chars.insert(s.begin(), s.end());
      }
      REQUIRE(unique_chars.size() == 10);
    }
  }
}

TEST_CASE("Generate English Puzzles",
          "[puzzle-generator][english][generate-puzzle]") {
  std::string BRICK_FILEPATH = PROJECT_SOURCE_DIR;
  BRICK_FILEPATH += "/app/word-detective/test/input/en-5K.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  SECTION("5 letter puzzle") {
    PuzzleGenerator::GeneratePuzzleParameters gpm{5, 2};

    for (auto i = 0; i < 100; i++) {
      auto puzzle_words = PuzzleGenerator::generate_puzzle(gpm, brick);
      std::set<int> unicodes;
      for (auto w : puzzle_words) {
        auto vu = WordDetective::Utils::to_unicode_codes(w);
        unicodes.insert(vu.begin(), vu.end());
      }
      REQUIRE(unicodes.size() == 5);
    }
  }

  SECTION("7 letter puzzle") {
    PuzzleGenerator::GeneratePuzzleParameters gpm{7, 2};

    for (auto i = 0; i < 100; i++) {
      auto puzzle_words = PuzzleGenerator::generate_puzzle(gpm, brick);
      std::set<int> unicodes;
      for (auto w : puzzle_words) {
        auto vu = WordDetective::Utils::to_unicode_codes(w);
        unicodes.insert(vu.begin(), vu.end());
      }
      REQUIRE(unicodes.size() == 7);
    }
  }

  SECTION("10 letter puzzle") {
    PuzzleGenerator::GeneratePuzzleParameters gpm{10, 2};

    for (auto i = 0; i < 100; i++) {
      auto puzzle_words = PuzzleGenerator::generate_puzzle(gpm, brick);
      std::set<int> unicodes;
      for (auto w : puzzle_words) {
        auto vu = WordDetective::Utils::to_unicode_codes(w);
        unicodes.insert(vu.begin(), vu.end());
      }
      REQUIRE(unicodes.size() == 10);
    }
  }
}

TEST_CASE("Word Collector", "[puzzle-generator][word-collector]") {
  std::string BRICK_FILEPATH = PROJECT_SOURCE_DIR;
  BRICK_FILEPATH += "/app/word-detective/test/input/en-5K.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  auto test_unique_characters = [](const std::string& s) {
    std::list<std::string> ls({s});
    return PuzzleGenerator::WordCollector::get_unique_characters(ls.begin(),
                                                                 ls.end());
  };

  SECTION("get_unique_characters") {
    REQUIRE(test_unique_characters("compound") == "cdmnopu");
    REQUIRE(test_unique_characters("memorial") == "aeilmor");
  }

  SECTION("collect words from path") {
    std::list<std::string> words_to_check{"coalition", "location",
                                          "allocation"};
    std::unordered_set<std::string> word_collection;
    PuzzleGenerator::WordCollector::collect_words(word_collection, "acilnot",
                                                  brick);

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
    PuzzleGenerator::WordCollector::collect_words_from_all_subpaths(
        word_collection, "cdmnopu", brick);

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
    PuzzleGenerator::WordCollector::collect_words_from_all_subpaths(
        word_collection, "aeilmor", brick);

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
    PuzzleGenerator::WordCollector::collect_words_from_all_subpaths(
        word_collection, "acilnot", brick);

    INFO(word_collection.size());
    REQUIRE(word_collection.size() == words_to_check.size());
    for (auto word : word_collection) {
      INFO(word);
      REQUIRE(word_collection.find(word) != word_collection.end());
    }
  }
}

/********************* ITALIAN ************************/

TEST_CASE("Italian Flatten Traversal",
          "[puzzle-generator][italian][flatten-traversal]") {
  std::string BRICK_FILEPATH = PROJECT_SOURCE_DIR;
  BRICK_FILEPATH += "/app/word-detective/test/input/it-1K.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  SECTION("Paths of length 10") {
    std::string FLATTEN_TRAVERSAL_SEGMENT =
        "$adeilnrstu$ceinorstuz$";
    std::string flatten_traversal_string =
        PuzzleGenerator::FlattenTraversal::flatten_traversal(brick, 10);

    REQUIRE(
        flatten_traversal_string.substr(0, FLATTEN_TRAVERSAL_SEGMENT.size()) ==
        FLATTEN_TRAVERSAL_SEGMENT);
  }
}

TEST_CASE("Get Valid Italian Path Sequence",
          "[puzzle-generator][italian][valid-path-sequence]") {
  std::string BRICK_FILEPATH = PROJECT_SOURCE_DIR;
  BRICK_FILEPATH += "/app/word-detective/test/input/it-1K.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  SECTION("5 letters and 2 splits") {
    unsigned number_of_letters = 5;
    unsigned number_of_splits = 2;

    for (int i = 0; i < 100; ++i) {
      auto list_of_paths =
          PuzzleGenerator::GetValidPathSequence::get_valid_path_sequence(
              brick, number_of_splits, number_of_letters);
      std::set<int> unique_unicodes;
      for (auto s : list_of_paths) {
        auto v = WordDetective::Utils::to_unicode_codes(s);
        unique_unicodes.insert(v.begin(), v.end());
      }
      REQUIRE(unique_unicodes.size() == 5);
    }
  }

  SECTION("7 letters and 2 splits") {
    unsigned number_of_letters = 7;
    unsigned number_of_splits = 2;

    for (int i = 0; i < 100; ++i) {
      auto list_of_paths =
          PuzzleGenerator::GetValidPathSequence::get_valid_path_sequence(
              brick, number_of_splits, number_of_letters);
      std::set<int> unique_unicodes;
      for (auto s : list_of_paths) {
        auto v = WordDetective::Utils::to_unicode_codes(s);
        unique_unicodes.insert(v.begin(), v.end());
      }
      REQUIRE(unique_unicodes.size() == 7);
    }
  }

  SECTION("10 letters and 2 splits") {
    unsigned number_of_letters = 10;
    unsigned number_of_splits = 2;

    for (int i = 0; i < 100; ++i) {
      auto list_of_paths =
          PuzzleGenerator::GetValidPathSequence::get_valid_path_sequence(
              brick, number_of_splits, number_of_letters);
      std::set<int> unique_unicodes;
      for (auto s : list_of_paths) {
        auto v = WordDetective::Utils::to_unicode_codes(s);
        unique_unicodes.insert(v.begin(), v.end());
      }
      REQUIRE(unique_unicodes.size() == 10);
    }
  }

  SECTION("10 letters and 3 splits") {
    unsigned number_of_letters = 10;
    unsigned number_of_splits = 3;

    for (int i = 0; i < 100; ++i) {
      auto list_of_paths =
          PuzzleGenerator::GetValidPathSequence::get_valid_path_sequence(
              brick, number_of_splits, number_of_letters);
      std::set<int> unique_unicodes;
      for (auto s : list_of_paths) {
        auto v = WordDetective::Utils::to_unicode_codes(s);
        unique_unicodes.insert(v.begin(), v.end());
      }
      REQUIRE(unique_unicodes.size() == 10);
    }
  }
}

TEST_CASE("Generate Italian Puzzles",
          "[puzzle-generator][italian][generate-puzzle]") {
  std::string BRICK_FILEPATH = PROJECT_SOURCE_DIR;
  BRICK_FILEPATH += "/app/word-detective/test/input/it-1K.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  SECTION("5 letter puzzle") {
    PuzzleGenerator::GeneratePuzzleParameters gpm{5, 2};

    for (auto i = 0; i < 100; i++) {
      auto puzzle_words = PuzzleGenerator::generate_puzzle(gpm, brick);
      std::set<int> unicodes;
      for (auto w : puzzle_words) {
        auto vu = WordDetective::Utils::to_unicode_codes(w);
        unicodes.insert(vu.begin(), vu.end());
      }
      REQUIRE(unicodes.size() == 5);
    }
  }

  SECTION("7 letter puzzle") {
    PuzzleGenerator::GeneratePuzzleParameters gpm{7, 2};

    for (auto i = 0; i < 100; i++) {
      auto puzzle_words = PuzzleGenerator::generate_puzzle(gpm, brick);
      std::set<int> unicodes;
      for (auto w : puzzle_words) {
        auto vu = WordDetective::Utils::to_unicode_codes(w);
        unicodes.insert(vu.begin(), vu.end());
      }
      REQUIRE(unicodes.size() == 7);
    }
  }

  SECTION("10 letter puzzle") {
    PuzzleGenerator::GeneratePuzzleParameters gpm{10, 2};

    for (auto i = 0; i < 100; i++) {
      auto puzzle_words = PuzzleGenerator::generate_puzzle(gpm, brick);
      std::set<int> unicodes;
      for (auto w : puzzle_words) {
        auto vu = WordDetective::Utils::to_unicode_codes(w);
        unicodes.insert(vu.begin(), vu.end());
      }
      REQUIRE(unicodes.size() == 10);
    }
  }
}
