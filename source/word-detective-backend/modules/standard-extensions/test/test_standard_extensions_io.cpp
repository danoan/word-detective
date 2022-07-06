#include "boost/filesystem.hpp"
#include "catch/catch.hpp"
#include "word-detective/datastr/Brick.h"
#include "word-detective/standard-extensions/brick/io.hpp"
#include "word-detective/standard-extensions/brick/traversal.hpp"
#include "word-detective/utils/text/segmenter.hpp"
#include "word-detective/utils/text/segmenter/english.hpp"

using namespace WordDetective::StandardExtensions;
using namespace WordDetective;

class Traverse : public Datastr::BrickExtension {
  using Callback = std::function<void(const Datastr::BrickInterface&)>;

  static void _run(Callback callback, const Datastr::BrickInterface* brick) {
    callback(*brick);
    for (auto element : *brick) {
      _run(callback, element);
    }
  }

 public:
  static void run(Callback callback, const Datastr::Brick& brick) {
    for (auto element : brick) {
      _run(callback, element);
    }
  }
};

TEST_CASE("Brick IO operations", "[standard-extensions][brick][io]") {
  Datastr::Brick brick;
  std::list<std::string> words{{"bargains", "struck", "dinosaurs", "know",
                                "happened", "quick", "latest", "trick"}};

  for (auto w : words) brick << w;

  std::string output_folder = PROJECT_SOURCE_DIR;
  output_folder += "/lab/test/coverage/assets";
  boost::filesystem::create_directories(output_folder);

  std::string simple_brick_filepath_one_byte =
      output_folder + "/simple_brick_one_byte.brk";
  SECTION("Save a one byte simple Brick") {
    try {
      auto fd = std::ofstream(simple_brick_filepath_one_byte,std::ios_base::binary);
      Brick::IO::Save<unsigned char>::run(fd,
                                          brick);
      REQUIRE(true);
    } catch (std::exception& ex) {
      REQUIRE(false);
    }
  }

  SECTION("Load a one byte simple Brick") {
    using WordIterator = std::list<std::string>::const_iterator;

    try {
      auto fd = std::ifstream(simple_brick_filepath_one_byte,std::ios_base::binary);
      Datastr::Brick loaded_brick;
      Brick::IO::Load::run(loaded_brick, fd);

      std::set<std::string> word_collection;
      Traverse::run(
          [&word_collection](const Datastr::BrickInterface& brick) {
            word_collection.insert(brick.beginWords(), brick.endWords());
          },
          loaded_brick);

      for (auto w : words)
        REQUIRE(word_collection.find(w) != word_collection.end());
    } catch (std::exception& ex) {
      REQUIRE(false);
    }
  }

  std::string simple_brick_filepath_four_bytes =
      output_folder + "/simple_brick_four_bytes.brk";
  SECTION("Save a four bytes simple Brick") {
    try {
      auto fd = std::ofstream(simple_brick_filepath_four_bytes,std::ios_base::binary);
      Brick::IO::Save<int>::run(fd, brick);
      REQUIRE(true);
    } catch (std::exception& ex) {
      REQUIRE(false);
    }
  }

  SECTION("Load a four bytes simple Brick") {
    using WordIterator = std::list<std::string>::const_iterator;

    try {
      auto fd = std::ifstream(simple_brick_filepath_four_bytes,std::ios_base::binary);
      Datastr::Brick loaded_brick;
      Brick::IO::Load::run(loaded_brick, fd);

      std::set<std::string> word_collection;
      Traverse::run(
          [&word_collection](const Datastr::BrickInterface& brick) {
            word_collection.insert(brick.beginWords(), brick.endWords());
          },
          loaded_brick);

      for (auto w : words)
        REQUIRE(word_collection.find(w) != word_collection.end());
    } catch (std::exception& ex) {
      REQUIRE(false);
    }
  }

  SECTION("Save and load list of 5K english words") {
    std::string list_of_5k_english_words = PROJECT_SOURCE_DIR;
    list_of_5k_english_words +=
        "/modules/standard-extensions/test/input/en-5K.txt";

    std::ifstream ifs(list_of_5k_english_words);
    std::unordered_map<std::string, int> word_map;
    Utils::Text::segment_into_map<Utils::Text::Languages::English>(word_map,
                                                                   ifs);

    INFO(word_map.size());
    REQUIRE(word_map.size() == 4522);

    Datastr::Brick brick_5k;
    for (auto p : word_map) brick_5k << p.first;

    std::string brick_5k_filepath = output_folder + "/list_5k_words.brk";
    try {
      auto fd = std::ofstream(brick_5k_filepath,std::ios_base::binary);
      Brick::IO::Save<unsigned char>::run(fd, brick_5k);
      REQUIRE(true);
    } catch (std::exception& ex) {
      REQUIRE(false);
    }

    Datastr::Brick loaded_brick;
    try {
      auto fd = std::ifstream(brick_5k_filepath,std::ios_base::binary);
      Brick::IO::Load::run(loaded_brick, fd);
      REQUIRE(true);
    } catch (std::exception& ex) {
      REQUIRE(false);
    }

    using WordIterator = std::list<std::string>::const_iterator;
    std::set<std::string> word_collection;
    Traverse::run(
        [&word_collection](const Datastr::BrickInterface& brick) {
          word_collection.insert(brick.beginWords(), brick.endWords());
        },
        loaded_brick);

    for (auto p : word_map) {
      INFO(p.first);
      REQUIRE(word_collection.find(p.first) != word_collection.end());
    }
  }
}

TEST_CASE("Brick traversal operations",
          "[standard-extensions][brick][traversal") {
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
  Datastr::Brick brick;
  std::list<std::string> words{{"dress", "porch", "scared", "faith", "night",
                                "crosses", "lovers", "streets", "well"}};
  for (auto w : words) brick << w;

  SECTION("Pre order") {
    std::string pre_order_expected = "acdersfhitceorshoprderselorsvwrstghint";
    std::string path = "";
    auto callback = [&path](const Datastr::BrickInterface& brick, int level) {
      path += brick.key();
    };

    Brick::Traversal::PreOrder::run(callback, brick);
    REQUIRE(path == pre_order_expected);
  }

  SECTION("Random path") {
    std::set<std::string> collected_words;
    std::set<std::string> path_5_words = {
        {"crosses", "porch", "faith", "night"}};

    auto callback = [&collected_words](const Datastr::BrickInterface& brick,
                                       const std::string& path) {
      collected_words.insert(brick.beginWords(), brick.endWords());
    };

    int tries=10;
    while( tries >0 ){
      Brick::Traversal::RandomPath::run(callback, brick, 5);
      tries--;
    }

    for (auto w : collected_words) {
      INFO(w);
      REQUIRE(path_5_words.find(w) != path_5_words.end());
    }
  }
}