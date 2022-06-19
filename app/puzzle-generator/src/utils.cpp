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
                MutableParameters& mp, ControlParameters& cp) {
  if (cp.split.empty()) return true;

  unsigned k = cp.split.front();

  auto vector_of_unicodes_1 =
      WordDetective::Utils::to_unicode_codes(cp.letters);
  std::vector<std::string> vector_of_matched_strings;
  for (unsigned i = k; i <= k + vector_of_unicodes_1.size(); ++i) {
    std::string flatten_string = FlattenTraversal::flatten_traversal(brick, i);

    // 3.
    // \$[^\$cinot]*[cinot]{1}\$[^\$cinot]*[cinot]{1}\$[^\$cinot]*[cinot]{1}\$[^\$cinot]*\$

    std::stringstream ss;
    std::string all_the_others = "[^\\$" + cp.letters + "]*";
    std::string one_letter = "[" + cp.letters + "]";
    std::string begin_end = "\\$";

    ss << begin_end << all_the_others;
    for (unsigned j = 0; j < i - k; ++j) {
      ss << one_letter << all_the_others;
    }
    ss << begin_end;

    UErrorCode status = U_ZERO_ERROR;
    icu::UnicodeString u_s1(flatten_string.c_str());
    icu::UnicodeString u_e(ss.str().c_str());

    icu::RegexMatcher* matcher = new icu::RegexMatcher(u_e, 0, status);
    matcher->reset(u_s1);

    // std::cout << "i:" << i << "regex: " << ss.str() << "matches: " <<
    // matches.size() << "::" << matches[0] << std::endl;

    while (matcher->find()) {
      icu::UnicodeString tt;

      auto start = matcher->start(status);
      auto end = matcher->end(status);
      u_s1.extract(start, end - start, tt);

      std::string ts;
      tt.toUTF8String(ts);
      vector_of_matched_strings.emplace_back(ts);
    }
  }

  std::shuffle(vector_of_matched_strings.begin(),
               vector_of_matched_strings.end(), fp->g);

  cp.split.pop_front();
  for (auto ms : vector_of_matched_strings) {
    ms.pop_back();
    ms.erase(ms.begin());

    std::string tmp_letters = cp.letters;
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

    if (_find_path(brick, fp, mp, cp)) {
      mp.list_of_paths.emplace_front(ms);
      return true;
    }

    cp.letters = tmp_letters;
  }
  cp.split.emplace_front(k);
  return false;
}

std::list<std::string> find_path(const WordDetective::Datastr::Brick& brick,
                                 std::list<unsigned>& split) {
  std::random_device rd;
  std::mt19937 g(rd());

  std::unique_ptr<FixedParameters> fixed_parameters(new FixedParameters{g});
  MutableParameters mutable_parameters;
  ControlParameters control_parameters;
  control_parameters.split = split;

  unsigned k = split.front();
  auto first_flatten_string = FlattenTraversal::flatten_traversal(brick, k);
  if (first_flatten_string != "$$") {
    control_parameters.letters = random_selection(first_flatten_string);

    control_parameters.split.pop_front();
    if (_find_path(brick, fixed_parameters, mutable_parameters,
                   control_parameters)) {
      mutable_parameters.list_of_paths.emplace_front(
          control_parameters.letters);
    }
    control_parameters.split.emplace_front();
  }

  return mutable_parameters.list_of_paths;
}

}  // namespace PuzzleGenerator::FindPath

namespace PuzzleGenerator::GetValidPathSequence {
std::list<std::string> get_valid_path_sequence(
    const WordDetective::Datastr::Brick& brick, unsigned number_of_splits,
    unsigned number_of_letters) {
  auto vector_of_splits = SplitGenerator::generate_split_combinations(
      number_of_splits, number_of_letters);

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