#include "utils.h"

namespace PuzzleGenerator::SplitGenerator {

void _generate_split_combination(
    const std::unique_ptr<FixedParameters>& fixed_parameters,
    MutableParameters& mutable_parameters,
    ControlParameters& control_parameters) {
  unsigned last_element = mutable_parameters.current_split.back();

  if (mutable_parameters.current_split.size() ==
          fixed_parameters->number_of_elements - 1 &&
      last_element <= control_parameters.sum_remainder) {
    mutable_parameters.current_split.emplace_back(
        control_parameters.sum_remainder);
    mutable_parameters.vector_of_splits.emplace_back(
        mutable_parameters.current_split);
    mutable_parameters.current_split.pop_back();
  } else {
    for (unsigned i = last_element; i <= control_parameters.sum_remainder;
         ++i) {
      control_parameters.sum_remainder -= i;
      mutable_parameters.current_split.emplace_back(i);
      _generate_split_combination(fixed_parameters, mutable_parameters,
                                  control_parameters);
      mutable_parameters.current_split.pop_back();
      control_parameters.sum_remainder += i;
    }
  }
}

SplitVector generate_split_combinations(unsigned number_of_elements,
                                        unsigned elements_sum) {
  std::unique_ptr<FixedParameters> fixed_parameters(
      new FixedParameters{number_of_elements, elements_sum});
  MutableParameters mutable_parameters;
  ControlParameters control_parameters{0, elements_sum};

  if (number_of_elements == 0) return SplitGenerator::SplitVector{{}};
  if (number_of_elements == 1)
    return SplitGenerator::SplitVector{{elements_sum}};

  for (unsigned i = 1; i <= elements_sum; ++i) {
    control_parameters.sum_remainder -= i;
    mutable_parameters.current_split.emplace_back(i);
    _generate_split_combination(fixed_parameters, mutable_parameters,
                                control_parameters);
    mutable_parameters.current_split.pop_back();
    control_parameters.sum_remainder += i;
  }

  return mutable_parameters.vector_of_splits;
}

}  // namespace PuzzleGenerator::SplitGenerator

#include <iostream>
namespace PuzzleGenerator::FlattenTraversal {
using Brick = WordDetective::Datastr::Brick;
using BrickInterface = WordDetective::Datastr::BrickInterface;
using PreOrder = WordDetective::StandardExtensions::Brick::Traversal::PreOrder;

std::string flatten_traversal(const Brick& brick, int path_length) {
  // icu::UnicodeString current_path;
  std::vector<int> vector_of_unicodes;
  std::vector<std::string> vector_of_paths;

  auto callback = [path_length, &vector_of_unicodes, &vector_of_paths](
                      const BrickInterface& brick, int level) {
    if (level < path_length) {
      while (vector_of_unicodes.size() != ((unsigned)level)) {
        vector_of_unicodes.pop_back();
      }

      vector_of_unicodes.emplace_back(brick.key());
      if (level == path_length - 1) {
        if (brick.beginWords() != brick.endWords()) {
          vector_of_paths.emplace_back(
              WordDetective::Utils::from_unicode_codes(vector_of_unicodes));
        }
      }
    }
  };

  PreOrder::run(callback, brick);

  std::string flatten_path = "$";
  for (auto s : vector_of_paths) {
    flatten_path += s + "$";
  }
  if (vector_of_paths.size() == 0) {
    flatten_path += "$";
  }

  return flatten_path;
}
}  // namespace PuzzleGenerator::FlattenTraversal

namespace PuzzleGenerator::FindPath {

std::string random_selection(const std::string& flatten_string) {
  std::random_device rd;
  std::uniform_int_distribution<int> distr(0, flatten_string.size() - 1);

  unsigned pos_start = flatten_string.size() - 1;
  while (pos_start == flatten_string.size() - 1) {
    pos_start = flatten_string.find_first_of("$", distr(rd));
  }
  pos_start += 1;

  unsigned pos_end = flatten_string.find_first_of("$", pos_start);

  // std::cout << pos_start << std::endl;
  // std::cout << pos_end << std::endl;

  return flatten_string.substr(pos_start, pos_end - pos_start);
};

bool _find_path(const WordDetective::Datastr::Brick& brick,
                const std::unique_ptr<FixedParameters>& fp,
                MutableParameters& mp, ControlParameters& cp, bool all_paths) {
  if (cp.split.empty()) {
    mp.list_of_paths.emplace_front(cp.letters);
    return true;
  }

  unsigned k = cp.split.front();

  auto vector_of_unicodes_1 =
      WordDetective::Utils::to_unicode_codes(cp.letters);
  std::vector<std::string> vector_of_matched_strings;
  for (unsigned i = k; i <= k + vector_of_unicodes_1.size(); ++i) {
    std::string flatten_string = FlattenTraversal::flatten_traversal(brick, i);

    // (?<=\\$)[^\$cinot]*[cinot]{1}\$[^\$cinot]*[cinot]{1}\$[^\$cinot]*(?=\\$)

    std::stringstream ss;
    std::string all_the_others = "[^\\$" + cp.letters + "]*";
    std::string one_letter = "[" + cp.letters + "]";
    std::string r_begin = "(?<=\\$)";
    std::string r_end = "(?=\\$)";

    ss << r_begin << all_the_others;
    if (cp.letters.length()>0){
      for (unsigned j = 0; j < i - k; ++j) {
        ss << one_letter << all_the_others;
      }
    }
    ss << r_end;

    UErrorCode status = U_ZERO_ERROR;
    icu::UnicodeString u_s1(flatten_string.c_str());
    icu::UnicodeString u_e(ss.str().c_str());

    icu::RegexMatcher* matcher = new icu::RegexMatcher(u_e, 0, status);
    matcher->reset(u_s1);

    while (matcher->find()) {
      icu::UnicodeString tt;

      auto start = matcher->start(status);
      auto end = matcher->end(status);
      u_s1.extract(start, end - start, tt);

      std::string ts;
      tt.toUTF8String(ts);

      // This is an empty match. Do not consider
      if (ts=="") continue;
      vector_of_matched_strings.emplace_back(ts);
    }
  }

  std::shuffle(vector_of_matched_strings.begin(),
               vector_of_matched_strings.end(), fp->g);

  bool found = false;
  cp.split.pop_front();
  for (auto ms : vector_of_matched_strings) {
    cp.letters.clear();

    auto vector_of_unicodes_2 = WordDetective::Utils::to_unicode_codes(ms);

    std::set<int> set_of_unicodes(vector_of_unicodes_1.begin(),
                                  vector_of_unicodes_1.end());
    set_of_unicodes.insert(vector_of_unicodes_2.begin(),
                           vector_of_unicodes_2.end());

    std::vector<int> unique_vector_of_unicodes(set_of_unicodes.begin(),
                                               set_of_unicodes.end());
    std::string s =
        WordDetective::Utils::from_unicode_codes(unique_vector_of_unicodes);

    cp.letters.insert(cp.letters.begin(), s.begin(), s.end());

    if (_find_path(brick, fp, mp, cp, all_paths)) {
      found = true;
      if(!all_paths){
        break;
      }
    }

  }
  cp.split.emplace_front(k);
  return found;
}

std::list<std::string> find_path(const WordDetective::Datastr::Brick& brick,
                                 std::list<unsigned>& split, bool all_paths) {
  std::random_device rd;
  std::mt19937 g(rd());

  std::unique_ptr<FixedParameters> fixed_parameters(new FixedParameters{g});
  MutableParameters mutable_parameters;
  ControlParameters control_parameters;
  control_parameters.split = split;

  _find_path(brick,fixed_parameters,mutable_parameters,control_parameters,all_paths);
  return mutable_parameters.list_of_paths;
}

}  // namespace PuzzleGenerator::FindPath

namespace PuzzleGenerator::GetValidPathSequence {
std::list<std::string> get_valid_path_sequence(
    const WordDetective::Datastr::Brick& brick, unsigned number_of_splits,
    unsigned number_of_letters) {
  auto vector_of_splits = SplitGenerator::generate_split_combinations(
      number_of_splits, number_of_letters);

      // std::cout << "letters: " << number_of_letters << std::endl;

  std::random_device rd;
  std::mt19937 g(rd());
  std::shuffle(vector_of_splits.begin(), vector_of_splits.end(), g);

  std::list<std::string> list_of_paths;
  while (!vector_of_splits.empty()) {
    auto selected_split = vector_of_splits.back();
    vector_of_splits.pop_back();

    list_of_paths = FindPath::find_path(brick, selected_split);
    if (!list_of_paths.empty()) break;
  }

  return list_of_paths;
}
}  // namespace PuzzleGenerator::GetValidPathSequence

namespace PuzzleGenerator::WordCollector {
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

void collect_words(std::unordered_set<std::string>& words,
                   const std::string& letters,
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

void collect_words_from_all_subpaths(
    std::unordered_set<std::string>& word_collection,
    const std::string& letters, const WordDetective::Datastr::Brick& brick) {
  std::unordered_set<std::string> subpaths;
  SubPath::run(subpaths, letters, brick);

  for (auto subpath : subpaths) collect_words(word_collection, subpath, brick);
}

}  // namespace PuzzleGenerator::WordCollector

namespace PuzzleGenerator {

std::unordered_set<std::string> generate_puzzle(
    GeneratePuzzleParameters gpm, const WordDetective::Datastr::Brick& brick) {
  auto list_of_paths = GetValidPathSequence::get_valid_path_sequence(
      brick, gpm.number_of_splits, gpm.number_of_letters);

  std::unordered_set<std::string> word_collection;
  if(!list_of_paths.empty()){
    std::string p = list_of_paths.front();
    PuzzleGenerator::WordCollector::collect_words_from_all_subpaths(word_collection, p, brick);
  }

  return word_collection;
}
}  // namespace PuzzleGenerator

namespace PuzzleGenerator::RandomLetters {

std::vector<int> collect_all_letters(const Brick& brick) {
  std::vector<int> letters;
  for (auto it = brick.begin(); it != brick.end(); ++it) {
    letters.push_back((*it)->key());
  }
  return letters;
}

std::unordered_set<std::string> generate_puzzle_by_random_letters(
    const Brick& brick, size_t num_letters, size_t max_attempts) {
  std::vector<int> all_letters = collect_all_letters(brick);

  if (all_letters.size() < num_letters) {
    return {};
  }

  std::random_device rd;
  std::mt19937 gen(rd());

  for (size_t attempt = 0; attempt < max_attempts; ++attempt) {
    // Shuffle and pick first num_letters
    std::shuffle(all_letters.begin(), all_letters.end(), gen);
    std::vector<int> selected(all_letters.begin(),
                              all_letters.begin() + num_letters);

    // Sort to form a valid path (brick paths are sorted)
    std::sort(selected.begin(), selected.end());

    // Convert to string
    std::string letters = WordDetective::Utils::from_unicode_codes(selected);

    // Try to collect words for this letter combination
    std::unordered_set<std::string> word_collection;
    PuzzleGenerator::WordCollector::collect_words_from_all_subpaths(
        word_collection, letters, brick);

    if (!word_collection.empty()) {
      return word_collection;
    }
  }

  return {};
}

}  // namespace PuzzleGenerator::RandomLetters