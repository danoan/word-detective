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

void SubPath::run(const std::string& path, int path_index, std::string subpath,
                  std::unordered_set<std::string>& subpaths,
                  const BrickInterface* brick) {
  // TODO: Use a list instead of unordered_set
  // TODO: Include only the longest path (no subpath
  // should be a substring of any other)
  if (path_index >= path.length()) {
    return;
  }

  run(path, path_index + 1, subpath, subpaths, brick);
  char c = brick->key();
  if (path.at(path_index) == c) {
    for (auto it = brick->begin(); it != brick->end(); ++it) {
      run(path, path_index + 1, subpath + c, subpaths, *it);
    }
    subpaths.insert(subpath + c);
  }
}

void SubPath::run(std::unordered_set<std::string>& subpaths,
                  const std::string& path, const Brick& brick) {
  for (auto it = brick.begin(); it != brick.end(); ++it) {
    run(path, 0, "", subpaths, *it);
  }
}

void collect_words(unordered_set<string>& words, const string& letters,
                   const Datastr::Brick& brick) {
  auto bit = brick.begin();
  auto pit = letters.begin();
  int length = 0;
  while (pit != letters.end()) {
    if ((*bit)->key() == *pit) {
      length++;
      pit++;

      if (length == letters.size()) {
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

std::string path_from_word(const std::string& word) {
  std::string letters = word;
  sort(letters.begin(), letters.end());
  for (int i = letters.size() - 2; i >= 0; i--) {
    if (letters[i] == letters[i + 1]) {
      letters.erase(letters.begin() + i + 1);
    }
  }
  return letters;
}

void get_all_puzzles(std::list<Puzzle::Puzzle>& list_of_puzzles,
                     const Datastr::Brick& brick, int num_letters,
                     int min_words) {
  auto callback = [&list_of_puzzles, &brick, &num_letters, &min_words](
                      const Datastr::BrickInterface& brick_node, int level) {
    if (brick_node.beginWords() != brick_node.endWords() &&
        level == num_letters - 1) {
      std::string letters = path_from_word(*brick_node.beginWords());

      std::unordered_set<std::string> word_collection;
      collect_words_from_all_subpaths(word_collection, letters, brick);

      if (word_collection.size() > min_words) {
        list_of_puzzles.push_back(
            {letters, {word_collection.begin(), word_collection.end()}});
      }
    }
  };
  StandardExtensions::Brick::Traversal::PreOrder::run(callback, brick);
}

json all_puzzles(const Datastr::Brick& brick, int num_letters, int min_words) {
  std::list<Puzzle::Puzzle> list_of_puzzles;
  get_all_puzzles(list_of_puzzles, brick, num_letters, min_words);
  return json(list_of_puzzles);
}

json random_puzzle(const Datastr::Brick& brick, int num_letters,
                   int min_words) {
  Puzzle::Puzzle puzzle;
  auto callback = [&brick, &puzzle](const Datastr::BrickInterface& brick_node,
                                    const std::string& path) {
    puzzle.letters = path;
    puzzle.words.clear();

    std::unordered_set<std::string> word_collection;
    collect_words_from_all_subpaths(word_collection, path, brick);
    puzzle.words.insert(puzzle.words.begin(), word_collection.begin(),
                        word_collection.end());
  };

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

json puzzle_by_index(const Datastr::Brick& brick, int num_letters,
                     int min_words, int index) {
  std::list<Puzzle::Puzzle> list_of_puzzles;
  get_all_puzzles(list_of_puzzles, brick, num_letters, min_words);

  if (index >= list_of_puzzles.size())
    throw std::runtime_error("The puzzle index does not exist");

  auto it = list_of_puzzles.begin();
  for (int i = 0; i < index; ++i) ++it;

  if (list_of_puzzles.size() > 0) {
    return json(*it);
  } else {
    return json({});
  }
}