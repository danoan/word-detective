#include "puzzle_generator_api.h"

namespace PuzzleGenerator {

void SubPath::run(const std::vector<int>& path, size_t path_index,
                  icu::UnicodeString subpath,
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
    std::string s;
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

void collect_words(std::unordered_set<std::string>& words, const std::string& letters,
                   const WordDetective::Datastr::Brick& brick) {
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

void collect_words_from_all_subpaths(std::unordered_set<std::string>& word_collection,
                                     const std::string& letters,
                                     const WordDetective::Datastr::Brick& brick) {
  std::unordered_set<std::string> subpaths;
  SubPath::run(subpaths, letters, brick);

  for (auto subpath : subpaths) collect_words(word_collection, subpath, brick);
}

std::unordered_set<std::string> generate_puzzle(
    GeneratePuzzleParameters gpm, const WordDetective::Datastr::Brick& brick) {

  auto list_of_paths = GetValidPathSequence::get_valid_path_sequence(
      brick, gpm.number_of_splits, gpm.number_of_letters);

  std::unordered_set<std::string> word_collection;
  for(auto p: list_of_paths){
    collect_words_from_all_subpaths(word_collection,p,brick);
  }

  return word_collection;
}
}  // namespace PuzzleGenerator
