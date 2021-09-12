#include <word-detective/utils/timer.h>

#include <fstream>
#include <word-detective/utils/text/filter.hpp>
#include <word-detective/utils/text/segmenter.hpp>
#include <word-detective/utils/text/segmenter/english.hpp>

#include "catch/catch.hpp"

using namespace WordDetective::Utils;

TEST_CASE("ASCII document", "[english][utils][text]") {
  std::unordered_map<std::string, int> word_frequency_map;
  std::string text = "You get a shiver in the dark it's a raining in the park but meantime...";

  SECTION("it segments a ASCII document") {
    std::stringstream ss(text);
    Text::segment_into_map<Text::Languages::English>(word_frequency_map, ss);

    REQUIRE(word_frequency_map.size() == 13);
    REQUIRE(word_frequency_map["You"] == 1);
    REQUIRE(word_frequency_map["get"] == 1);
    REQUIRE(word_frequency_map["a"] == 2);
    REQUIRE(word_frequency_map["shiver"] == 1);
    REQUIRE(word_frequency_map["in"] == 2);
    REQUIRE(word_frequency_map["it"] == 1);
    REQUIRE(word_frequency_map["s"] == 1);
  }

  SECTION("it filters a ASCII document") {
    auto no_initial_capital_letter = [](const std::string& s) {
      return !Text::starts_with_capital_letter(s);
    };
    auto more_than_three_chars = [](const std::string& s) {
      return Text::more_than_n_characters<3>(s);
    };

    auto composed_filter = [&no_initial_capital_letter,
                            &more_than_three_chars](const std::string& s) {
      return no_initial_capital_letter(s) && more_than_three_chars(s);
    };

    std::stringstream ss(text);
    Text::segment_into_map<Text::Languages::English>(word_frequency_map, ss,composed_filter);

    REQUIRE(word_frequency_map.size() == 5);
    REQUIRE(word_frequency_map["shiver"] == 1);
    REQUIRE(word_frequency_map["dark"] == 1);
    REQUIRE(word_frequency_map["raining"] == 1);
    REQUIRE(word_frequency_map["park"] == 1);
    REQUIRE(word_frequency_map["meantime"] == 1);
  }
}

TEST_CASE("utf8 document") {}

TEST_CASE("execution time", "[english][utils][text]") {
  std::string jekyll_file_path = PROJECT_SOURCE_DIR;
  jekyll_file_path += "/modules/utils/test/input/jekyll.txt";
  std::fstream fs(jekyll_file_path);

  std::stringstream ss;

  Timer timer;
  timer.start();

  std::unordered_map<std::string, int> word_frequency_map;
  Text::segment_into_map<Text::Languages::English>(word_frequency_map, fs);

  timer.end(ss);

  INFO("Running time: " + ss.str());
  REQUIRE(timer.seconds_last_diff == 0);
  REQUIRE(timer.milliseconds_last_diff < 300);
}