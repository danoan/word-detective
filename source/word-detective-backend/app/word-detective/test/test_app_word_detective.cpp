#include <catch/catch.hpp>
#include <iostream>

#include "boost/filesystem.hpp"
#include "word-detective-api.h"
#include "word-detective/standard-extensions/brick/io.hpp"
#include "word-detective/utils/text/filter.hpp"
#include "word-detective/utils/text/segmenter.hpp"
#include "word-detective/utils/text/segmenter/english.hpp"

TEST_CASE("English Word Detetctive API", "[app][word-detective][english][word-detective-api]"){
  std::string BRICK_FILEPATH = PROJECT_SOURCE_DIR;
  BRICK_FILEPATH += "/app/word-detective/test/input/en-5K.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  auto test_puzzle = [](const WordDetective::Datastr::Brick& brick, unsigned num_letters, unsigned trials=100){
    for(unsigned i=0;i<trials;++i){
      auto json_result = random_puzzle(brick,num_letters);
      if(num_letters==0){
        REQUIRE(json_result.empty());
      }else{
        REQUIRE(!json_result.empty());

        Puzzle::Puzzle puzzle;
        Puzzle::from_json(json_result,puzzle);
        REQUIRE(puzzle.letters.size()==num_letters);
        REQUIRE(PuzzleGenerator::WordCollector::get_unique_characters(puzzle.words.begin(),puzzle.words.end()).size()==num_letters);
      }
    }
  };

  SECTION("Random Puzzle of 0 letters"){
    test_puzzle(brick,0,1);
  }

  SECTION("Random Puzzle of 5 letters"){
    test_puzzle(brick,5);
  }

  SECTION("Random Puzzle of 7 letters"){
    test_puzzle(brick,7);
  }

  SECTION("Random Puzzle of 10 letters"){
    test_puzzle(brick,10);
  }

}

/********************* ITALIAN ************************/

TEST_CASE("Italian Word Detetctive API", "[app][word-detective][italian][word-detective-api]"){
  std::string BRICK_FILEPATH = PROJECT_SOURCE_DIR;
  BRICK_FILEPATH += "/app/word-detective/test/input/it-1K.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  auto test_puzzle = [](const WordDetective::Datastr::Brick& brick, unsigned num_letters, unsigned trials=100){
    for(unsigned i=0;i<trials;++i){
      auto json_result = random_puzzle(brick,num_letters);
      if(num_letters==0){
        REQUIRE(json_result.empty());
      }else{
        REQUIRE(!json_result.empty());

        Puzzle::Puzzle puzzle;
        Puzzle::from_json(json_result,puzzle);
        REQUIRE(WordDetective::Utils::to_unicode_codes(puzzle.letters).size()==num_letters);
        std::string unique_letters = PuzzleGenerator::WordCollector::get_unique_characters(puzzle.words.begin(),puzzle.words.end());
        REQUIRE(WordDetective::Utils::to_unicode_codes(unique_letters).size()==num_letters);
      }
    }
  };

  SECTION("Random Puzzle of 0 letters"){
    test_puzzle(brick,0,1);
  }

  SECTION("Random Puzzle of 5 letters"){
    test_puzzle(brick,5);
  }

  SECTION("Random Puzzle of 7 letters"){
    test_puzzle(brick,7);
  }

  SECTION("Random Puzzle of 10 letters"){
    test_puzzle(brick,10);
  }

}
