#include "word-detective-api.h"

namespace Puzzle {

void to_json(json& j, const Puzzle& puzzle) {
  j["puzzle"] = {};
  j["puzzle"]["letters"] = puzzle.letters;
  j["puzzle"]["words"] = puzzle.words;
}

void from_json(const json& j, Puzzle& puzzle) {
  j.at("puzzle").at("letters").get_to(puzzle.letters);
  j.at("puzzle").at("words").get_to(puzzle.words);
}

ostream& operator<<(ostream& os, const Puzzle& puzzle) {
  os << json(puzzle);
  return os;
}

ostream& operator<<(ostream& os, const std::list<Puzzle>& list_of_puzzles) {
  os << json(list_of_puzzles);
  return os;
}

};  // namespace Puzzle

Datastr::Brick create_brick(std::istream& book_stream,
                            WordDetective::Utils::Text::Languages language) {
  Utils::Text::FilterFunction word_filter = [](const std::string& s) {
    return Utils::Text::more_than_n_characters<3>(s) &&
           !Utils::Text::starts_with_capital_letter(s) &&
           !Utils::Text::has_apostrophe(s);
  };

  unordered_map<string, int> corpora;

  switch (language) {
    case WordDetective::Utils::Text::Languages::Italian:
      Utils::Text::segment_into_map<Utils::Text::Languages::Italian>(
          corpora, book_stream, word_filter);
      break;
    case WordDetective::Utils::Text::Languages::English:
    default:
      Utils::Text::segment_into_map<Utils::Text::Languages::English>(
          corpora, book_stream, word_filter);
      break;
  }

  Datastr::Brick b;
  for (auto w : corpora) {
    b.insert_word(w.first);
  }

  return b;
}

json all_puzzles(const Datastr::Brick& brick, size_t num_letters,
                 size_t min_words) {
  assert("Not implemented yet" && false);
}

json puzzle_by_index(const Datastr::Brick& brick, size_t num_letters,
                     size_t min_words, size_t index) {
  assert("Not implemented yet" && false);
}

json random_puzzle(const Datastr::Brick& brick, size_t num_letters) {
  unsigned number_of_splits = 2;
  auto list_of_paths =
      PuzzleGenerator::GetValidPathSequence::get_valid_path_sequence(
          brick, number_of_splits, num_letters);

  PuzzleGenerator::GeneratePuzzleParameters gpm;
  gpm.number_of_letters = num_letters;
  gpm.number_of_splits = number_of_splits;

  std::unordered_set<std::string> word_collection = PuzzleGenerator::generate_puzzle(gpm,brick);

  if (!word_collection.empty()) {
    std::string letters = PuzzleGenerator::WordCollector::get_unique_characters(
        word_collection.begin(), word_collection.end());

    Puzzle::Puzzle puzzle{letters,
                          {word_collection.begin(), word_collection.end()}};
    return json(puzzle);
  }

  return json({});
}

json random_puzzle_by_letters(const Datastr::Brick& brick, size_t num_letters,
                              size_t max_attempts) {
  std::unordered_set<std::string> word_collection =
      PuzzleGenerator::RandomLetters::generate_puzzle_by_random_letters(
          brick, num_letters, max_attempts);

  if (!word_collection.empty()) {
    std::string letters = PuzzleGenerator::WordCollector::get_unique_characters(
        word_collection.begin(), word_collection.end());

    Puzzle::Puzzle puzzle{letters,
                          {word_collection.begin(), word_collection.end()}};
    return json(puzzle);
  }

  return json({});
}