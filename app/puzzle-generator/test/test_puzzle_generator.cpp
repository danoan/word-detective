#include <iostream>

#include "catch/catch.hpp"
#include "puzzle_generator_api.h"
#include "utils.h"
#include "word-detective/datastr/Brick.h"
#include "word-detective/standard-extensions/brick/io.hpp"

TEST_CASE("Split Combinations", "[puzzle-generator][split-combinations]") {
  auto equal_vector_of_splits = [](const PuzzleGenerator::SplitGenerator::SplitVector& v1, const PuzzleGenerator::SplitGenerator::SplitVector& v2){
    REQUIRE(v1.size() == v2.size());

    auto it_1 = v1.begin();
    auto it_2 = v2.begin();
    while (it_1 != v1.end()) {
      REQUIRE(*it_1==*it_2);
      it_1++;
      it_2++;
    }
  };

  auto print_list_of_splits = [](const PuzzleGenerator::SplitGenerator::SplitVector& list_of_splits){
    for(auto s : list_of_splits){
      for(auto n : s){
        std::cout << n << ",";
      }
      std::cout << std::endl;
    }
  };


  SECTION("generate_split_combinations(1,7)") {
    std::vector<std::list<unsigned> > LIST_OF_SPLITS = {{7}};
    auto list_of_splits =
        PuzzleGenerator::SplitGenerator::generate_split_combinations(1, 7);

    equal_vector_of_splits(LIST_OF_SPLITS,list_of_splits);
  }

  SECTION("generate_split_combinations(2,7)") {
    std::vector<std::list<unsigned> > LIST_OF_SPLITS = {{1,6},{2,5},{3,4}};
    auto list_of_splits =
        PuzzleGenerator::SplitGenerator::generate_split_combinations(2, 7);

    equal_vector_of_splits(LIST_OF_SPLITS,list_of_splits);
  }

  SECTION("generate_split_combinations(3,7)") {
    std::vector<std::list<unsigned> > LIST_OF_SPLITS = {{1,1,5},{1,2,4},{1,3,3},{2,2,3}};
    auto list_of_splits =
        PuzzleGenerator::SplitGenerator::generate_split_combinations(3, 7);

    equal_vector_of_splits(LIST_OF_SPLITS,list_of_splits);
  }

  SECTION("generate_split_combinations(3,10)") {
    std::vector<std::list<unsigned> > LIST_OF_SPLITS = {{1,1,8},{1,2,7},{1,3,6},{1,4,5},{2,2,6},{2,3,5},{2,4,4},{3,3,4}};
    auto list_of_splits =
        PuzzleGenerator::SplitGenerator::generate_split_combinations(3, 10);

    equal_vector_of_splits(LIST_OF_SPLITS,list_of_splits);
    // print_list_of_splits(list_of_splits);
  }

}

TEST_CASE("Flatten Traversal", "[puzzle-generator][flatten-traversal]") {
  const std::string BRICK_FILEPATH =
      "/home/daniel/Projects/Git/word-detective/books/ef-5000.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  SECTION("Paths of length 0"){
    std::string flatten_traversal_string = PuzzleGenerator::FlattenTraversal::flatten_traversal(brick,0);
    REQUIRE(flatten_traversal_string=="$$");
  }

  SECTION("Paths of length 3"){
    std::string FLATTEN_TRAVERSAL_SEGMENT="$abl$abs$aby$acl$ade$adr$adt$aer$aes$afl$agn$ahl$aht$alm$alt$alw$aly$ams$aps$ary$awy$bel$";

    std::string flatten_traversal_string = PuzzleGenerator::FlattenTraversal::flatten_traversal(brick,3);

    REQUIRE(flatten_traversal_string.substr(0,FLATTEN_TRAVERSAL_SEGMENT.size())==FLATTEN_TRAVERSAL_SEGMENT);
  }

  SECTION("Paths of length 4"){
    std::string FLATTEN_TRAVERSAL_SEGMENT="$abck$abdn$abek$abel$abem$aben$aber$abes$abet$";
    std::string flatten_traversal_string = PuzzleGenerator::FlattenTraversal::flatten_traversal(brick,4);

    REQUIRE(flatten_traversal_string.substr(0,FLATTEN_TRAVERSAL_SEGMENT.size())==FLATTEN_TRAVERSAL_SEGMENT);
  }

  SECTION("Paths of length 7"){
    std::string FLATTEN_TRAVERSAL_SEGMENT="$abcdeln$abcdenu$abcehmr$abceilp$abceils$abceint$abcelrt$abceruy$abcgikn$abcgilo$abcilsy$abdeils$abdhnsu$";
    std::string flatten_traversal_string = PuzzleGenerator::FlattenTraversal::flatten_traversal(brick,7);

    REQUIRE(flatten_traversal_string.substr(0,FLATTEN_TRAVERSAL_SEGMENT.size())==FLATTEN_TRAVERSAL_SEGMENT);
  }

}

TEST_CASE("Generate Puzzles","[puzzle-generator][generate-puzzles]"){
  const std::string BRICK_FILEPATH =
      "/home/daniel/Projects/Git/word-detective/books/ef-5000.txt.brk";

  WordDetective::Datastr::Brick brick;
  std::ifstream ifs(BRICK_FILEPATH, std::ios::binary);

  WordDetective::StandardExtensions::Brick::IO::Load::run(brick, ifs);

  SECTION("5 letters and 2 splits"){
    PuzzleGenerator::GeneratePuzzleParameters gpm{5,2};

    for(int i=0;i<100;++i){
      auto list_of_paths = PuzzleGenerator::generate_puzzle(gpm,brick);
      std::set<char> unique_chars;
      for(auto s:list_of_paths){
        unique_chars.insert(s.begin(),s.end());
      }
      REQUIRE(unique_chars.size()==5);
    }
  }

  SECTION("7 letters and 2 splits"){
    PuzzleGenerator::GeneratePuzzleParameters gpm{7,2};

    for(int i=0;i<100;++i){
      auto list_of_paths = PuzzleGenerator::generate_puzzle(gpm,brick);
      std::set<char> unique_chars;
      for(auto s:list_of_paths){
        unique_chars.insert(s.begin(),s.end());
      }
      REQUIRE(unique_chars.size()==7);
    }
  }

  SECTION("10 letters and 2 splits"){
    PuzzleGenerator::GeneratePuzzleParameters gpm{10,2};

    for(int i=0;i<100;++i){
      auto list_of_paths = PuzzleGenerator::generate_puzzle(gpm,brick);
      std::set<char> unique_chars;
      for(auto s:list_of_paths){
        unique_chars.insert(s.begin(),s.end());
      }
      REQUIRE(unique_chars.size()==10);
    }
  }

  SECTION("10 letters and 3 splits"){
    PuzzleGenerator::GeneratePuzzleParameters gpm{10,3};

    for(int i=0;i<100;++i){
      auto list_of_paths = PuzzleGenerator::generate_puzzle(gpm,brick);
      std::set<char> unique_chars;
      for(auto s:list_of_paths){
        unique_chars.insert(s.begin(),s.end());
      }
      REQUIRE(unique_chars.size()==10);
    }
  }

}