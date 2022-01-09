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

Datastr::Brick create_brick(std::istream& book_stream,WordDetective::Utils::Text::Languages language) {
  Utils::Text::FilterFunction word_filter = [](const std::string& s) {
    return Utils::Text::more_than_n_characters<3>(s) &&
           !Utils::Text::starts_with_capital_letter(s);
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

void SubPath::run(const std::vector<int>& path, size_t path_index, icu::UnicodeString subpath,
                  std::unordered_set<std::string>& subpaths,
                  const BrickInterface* brick) {
  // TODO: Use a list instead of unordered_set
  // TODO: Include only the longest path (no subpath
  // should be a substring of any other)
  if (path_index >= path.size()) {
    return;
  }

  run(path, path_index + 1, subpath, subpaths, brick);
  int key = brick->key();
  if (path.at(path_index) == key) {
    for (auto it = brick->begin(); it != brick->end(); ++it) {
      run(path, path_index + 1, subpath + key, subpaths, *it);
    }
    string s;
    (subpath + key).toUTF8String(s);
    subpaths.insert(s);
  }
}

void SubPath::run(std::unordered_set<std::string>& subpaths,
                  const std::string& path, const Brick& brick) {
  auto vuc = WordDetective::Utils::to_unicode_codes(path);
  for (auto it = brick.begin(); it != brick.end(); ++it) {
    run(vuc, 0, "", subpaths, *it);
  }
}

void collect_words(unordered_set<string>& words, const string& letters,
                   const Datastr::Brick& brick) {
  auto bit = brick.begin();

  auto vuc = WordDetective::Utils::to_unicode_codes(letters);
  auto pit = vuc.begin();

  size_t length = 0;
  while (pit != vuc.end()) {
    if ((*bit)->key() == *pit) {
      length++;
      pit++;

      if (length == vuc.size()) {
        for (auto it = (*bit)->beginWords(); it != (*bit)->endWords(); ++it) {
          words.insert(*it);
        }
      }

      bit = (*bit)->begin();
    } else {
      bit++;
    }
  }
}

void collect_words_from_all_subpaths(unordered_set<string>& word_collection,
                                     const string& letters,
                                     const Datastr::Brick& brick) {
  std::unordered_set<std::string> subpaths;
  SubPath::run(subpaths, letters, brick);

  for (auto subpath : subpaths) collect_words(word_collection, subpath, brick);
}

std::string path_from_word(const string& word) {
  auto vs = WordDetective::Utils::to_unicode_codes(word);
  sort(vs.begin(),vs.end());
  auto last = unique(vs.begin(),vs.end());
  vs.erase(last,vs.end());

  return WordDetective::Utils::from_unicode_codes(vs);
}

void get_all_puzzles(std::list<Puzzle::Puzzle>& list_of_puzzles,
                     const Datastr::Brick& brick, size_t num_letters,
                     size_t min_words) {
  auto callback = [&list_of_puzzles, &brick, &num_letters, &min_words](
                      const Datastr::BrickInterface& brick_node, size_t level) {
    if (brick_node.beginWords() != brick_node.endWords() &&
        level == num_letters - 1) {
      std::string letters = path_from_word(*brick_node.beginWords());

      std::unordered_set<std::string> word_collection;
      collect_words_from_all_subpaths(word_collection, letters, brick);

      if (word_collection.size() >= min_words) {
        list_of_puzzles.push_back(
            {letters, {word_collection.begin(), word_collection.end()}});
      }
    }
  };
  StandardExtensions::Brick::Traversal::PreOrder::run(callback, brick);
}

json all_puzzles(const Datastr::Brick& brick, size_t num_letters, size_t min_words) {
  std::list<Puzzle::Puzzle> list_of_puzzles;
  get_all_puzzles(list_of_puzzles, brick, num_letters, min_words);
  return json(list_of_puzzles);
}

json random_puzzle(const Datastr::Brick& brick, size_t num_letters,
                   size_t min_words) {
  Puzzle::Puzzle puzzle;

  std::list<Puzzle::Puzzle> list_of_puzzles;
  get_all_puzzles(list_of_puzzles, brick, num_letters, min_words);

  std::random_device rd;
  std::uniform_int_distribution<int> distr(0, list_of_puzzles.size() - 1);

  auto it = list_of_puzzles.begin();
  for (int i = distr(rd); i > 0; --i) ++it;

  if (list_of_puzzles.size() > 0) {
    return json(*it);
  } else {
    return json({});
  }
}

json puzzle_by_index(const Datastr::Brick& brick, size_t num_letters,
                     size_t min_words, size_t index) {
  std::list<Puzzle::Puzzle> list_of_puzzles;
  get_all_puzzles(list_of_puzzles, brick, num_letters, min_words);

  if (index >= list_of_puzzles.size())
    throw std::runtime_error("The puzzle index does not exist");

  auto it = list_of_puzzles.begin();
  for (size_t i = 0; i < index; ++i) ++it;

  if (list_of_puzzles.size() > 0) {
    return json(*it);
  } else {
    return json({});
  }
}