#include <algorithm>
#include <boost/filesystem.hpp>
#include <fstream>
#include <iostream>
#include <random>
#include <thread>
#include <vector>

#include "benchmark-utils/Experiment.h"
#include "benchmark-utils/render.h"
#include "models.h"
#include "word-detective/utils/timer.h"

using namespace WordDetective::Utils;

namespace TestCases {
using namespace std;
string building(unordered_map<string, int>& word_frequency_map, istream* is) {
  stringstream ss;

  Timer timer;
  timer.start();
  map_segmenter(word_frequency_map, is);
  timer.end(ss);

  return ss.str();
}

string traversal(unordered_map<string, int>& word_frequency_map, istream* is) {
  stringstream ss;
  int traversal_frequency = 0;
  map_segmenter(word_frequency_map, is);

  Timer timer;
  timer.start();
  for (auto my_pair : word_frequency_map) {
    traversal_frequency += my_pair.second;
  }
  timer.end(ss);

  return ss.str();
}

string query(unordered_map<string, int>& word_frequency_map, istream* is) {
  stringstream ss;
  map_segmenter(word_frequency_map, is);

  vector<std::string> keys;
  keys.reserve(word_frequency_map.size());
  for (auto my_pair : word_frequency_map) {
    keys.push_back(my_pair.first);
  }

  random_device rd;
  uniform_int_distribution<int> uid(0, keys.size() - 1);

  int query_frequency = 0;
  int n_queries = 1e6;

  Timer timer;
  timer.start();
  for (int i = 0; i < n_queries; ++i) {
    query_frequency += word_frequency_map[keys[uid(rd)]];
  }
  timer.end(ss);

  return ss.str();
}

string building(list<WordFrequencyElement>& word_frequency_list, istream* is) {
  stringstream ss;

  Timer timer;
  timer.start();
  list_segmenter(word_frequency_list, is);
  timer.end(ss);

  return ss.str();
}
string traversal(list<WordFrequencyElement>& word_frequency_list, istream* is) {
  stringstream ss;
  list_segmenter(word_frequency_list, is);

  int traversal_frequency = 0;

  Timer timer;
  timer.start();
  for (auto WFE : word_frequency_list) {
    traversal_frequency += WFE.frequency;
  }
  timer.end(ss);

  return ss.str();
}

string query(list<WordFrequencyElement>& word_frequency_list, istream* is) {
  stringstream ss;
  list_segmenter(word_frequency_list, is);

  vector<WordFrequencyElement> keys;
  keys.reserve(word_frequency_list.size());
  for (auto WFE : word_frequency_list) {
    keys.push_back(WFE);
  }

  random_device rd;
  uniform_int_distribution<int> uid(0, keys.size() - 1);

  int query_frequency = 0;
  int n_queries = 1e6;

  Timer timer;
  timer.start();
  for (int i = 0; i < n_queries; ++i) {
    assert(std::binary_search(word_frequency_list.begin(),
                              word_frequency_list.end(), keys[uid(rd)]));
    query_frequency += keys[uid(rd)].frequency;
  }
  timer.end(ss);

  return ss.str();
}

void _traversal(function<void(WordFrequencyElement)> callback_fn,
                const WordDetective::Datastr::Trie& word_frequency_trie) {
  using IteratorPair = std::pair<WordDetective::Datastr::Trie::Iterator,
                                 WordDetective::Datastr::Trie::Iterator>;

  string current_word;
  stack<IteratorPair> S;
  S.push({word_frequency_trie.begin(), word_frequency_trie.end()});
  while (!S.empty()) {
    auto itPair = S.top();
    S.pop();

    auto itB = itPair.first;
    auto itE = itPair.second;

    if (itB == itE) {
      current_word.pop_back();
      continue;
    }

    current_word += (*itB)->key();

    if ((*itB)->is_word()) {
      callback_fn({current_word, (*itB)->frequency()});
      current_word.pop_back();
      S.push({++itB, itE});
    } else {
      auto itC = itB;
      S.push({++itC, itE});
      S.push({(*itB)->begin(), (*itB)->end()});
    }
  }
}

bool _query(const WordDetective::Datastr::Trie& word_frequency_trie,
            const string& word, int& frequency) {
  auto it = word_frequency_trie.begin();
  auto end = word_frequency_trie.end();
  for (char c : word) {
    bool reach_the_end = false;
    while ((*it)->key() != c) {
      ++it;
      if (it == end) {
        reach_the_end = true;
        break;
      }
    }
    if (reach_the_end) {
      return false;
    } else {
      frequency = (*it)->frequency();

      end = (*it)->end();
      it = (*it)->begin();
    }
  }
  return true;
};

string building(WordDetective::Datastr::Trie& word_frequency_trie,
                istream* is) {
  stringstream ss;

  Timer timer;
  timer.start();
  trie_segmenter(word_frequency_trie, is);
  timer.end(ss);

  return ss.str();
}

string traversal(WordDetective::Datastr::Trie& word_frequency_trie,
                 istream* is) {
  stringstream ss;
  trie_segmenter(word_frequency_trie, is);

  Timer timer;
  timer.start();

  int traversal_frequency = 0;
  list<WordFrequencyElement> words;
  _traversal(
      [&traversal_frequency](WordFrequencyElement wfe) {
        traversal_frequency += wfe.frequency;
      },
      word_frequency_trie);

  timer.end(ss);
  return ss.str();
}

string query(WordDetective::Datastr::Trie& word_frequency_trie, istream* is) {
  stringstream ss;
  trie_segmenter(word_frequency_trie, is);

  vector<WordFrequencyElement> keys;
  _traversal([&keys](WordFrequencyElement wfe) { keys.push_back(wfe); },
             word_frequency_trie);

  random_device rd;
  uniform_int_distribution<int> uid(0, keys.size() - 1);

  int query_frequency = 0;
  int n_queries = 1e6;

  Timer timer;
  timer.start();
  for (int i = 0; i < n_queries; ++i) {
    int frequency = 0;
    int id = uid(rd);
    assert(_query(word_frequency_trie, keys[id].word, frequency));
    assert(frequency == keys[id].frequency);
    query_frequency += frequency;
  }
  timer.end(ss);

  return ss.str();
}
}  // namespace TestCases

enum class TestType { building, traversal, query };

using WordFrequencyMap = std::unordered_map<std::string, int>;
using WordFrequencyList = std::list<WordFrequencyElement>;
using WordFrequencyTrie = WordDetective::Datastr::Trie;

template <class TDataStructure>
struct TestRunner {
  static Benchmark::TestCase run(const std::string& inputFilepath,
                                 TestType test_type) {
    std::fstream fs(inputFilepath);
    TDataStructure word_frequency_container;

    Benchmark::TestCase test_case;
    std::string time;
    switch (test_type) {
      case TestType::building:
        test_case.label = "building";
        time = TestCases::building(word_frequency_container, &fs);
        break;
      case TestType::traversal:
        test_case.label = "traversal";
        time = TestCases::traversal(word_frequency_container, &fs);
        break;
      case TestType::query:
        test_case.label = "query";
        time = TestCases::query(word_frequency_container, &fs);
        break;
      default:
        break;
    }

    test_case.executionTime = time;
    return test_case;
  }
};

void check_test_consistency(const std::string& inputFilepath) {
  WordFrequencyMap word_frequency_map;
  {
    std::fstream fs(inputFilepath);
    TestCases::building(word_frequency_map, &fs);
  }

  WordFrequencyList word_frequency_list;
  {
    std::fstream fs(inputFilepath);
    TestCases::building(word_frequency_list, &fs);
  }

  WordFrequencyTrie word_frequency_trie;
  {
    std::fstream fs(inputFilepath);
    TestCases::building(word_frequency_trie, &fs);
  }

  // WordFrequencyList equivalent to WordFrequencyMap
  for (auto WFE : word_frequency_list) {
    if (word_frequency_map[WFE.word] != WFE.frequency) {
      std::cerr << "Error (list and map): " << WFE.word << ":"
                << word_frequency_map[WFE.word] << "," << WFE.frequency << "\n";
      throw std::runtime_error("Results among tests are not consistent");
    }
  }

  // WordFrequencyList equivalent to WordFrequenceTrie
  for (auto WFE : word_frequency_list) {
    int frequency = 0;
    TestCases::_query(word_frequency_trie, WFE.word, frequency);
    if (frequency != WFE.frequency) {
      std::cerr << "Error (list and trie): " << WFE.word << ":" << frequency
                << "," << WFE.frequency << "\n";
      throw std::runtime_error("Results among tests are not consistent");
    }
  }
}

struct InputData {
  std::list<std::string> filepaths;
  std::string outputFilepath;
};

InputData read_input(int argc, char* argv[]) {
  InputData id;
  for (int i = 1; i < argc-1; ++i) {
    id.filepaths.push_back(argv[i]);
  }
  id.outputFilepath = argv[argc-1];
  return id;
}

int main(int argc, char* argv[]) {
  using namespace Benchmark;
  InputData id = read_input(argc, argv);

  Benchmark::Benchmark benchmark("Word Frequency Data Structure");

  for (auto& filepath : id.filepaths) {
    boost::filesystem::path path(filepath);
    std::string filename = path.filename().c_str();

    using MapRunner = TestRunner<WordFrequencyMap>;
    using ListRunner = TestRunner<WordFrequencyList>;
    using TrieRunner = TestRunner<WordFrequencyTrie>;

    Experiment experiment(filename);
    try {
      check_test_consistency(filepath);

      experiment.add_scenario(Scenario("unordered_map"))
          .add_test_case(MapRunner::run(filepath, TestType::building))
          .add_test_case(MapRunner::run(filepath, TestType::traversal))
          .add_test_case(MapRunner::run(filepath, TestType::query));

      experiment.add_scenario(Scenario("list"))
          .add_test_case(ListRunner::run(filepath, TestType::building))
          .add_test_case(ListRunner::run(filepath, TestType::traversal))
          .add_test_case(ListRunner::run(filepath, TestType::query));

      experiment.add_scenario(Scenario("trie"))
          .add_test_case(TrieRunner::run(filepath, TestType::building))
          .add_test_case(TrieRunner::run(filepath, TestType::traversal))
          .add_test_case(TrieRunner::run(filepath, TestType::query));

      benchmark.add_experiment(experiment);

    } catch (std::exception ex) {
      std::cerr << "Experiment: " << filename
                << " has inconsistent results. Skipping to the next one.";
      continue;
    }
  }

  std::string templateFilepath = PROJECT_SOURCE_DIR;
  templateFilepath += "/lab/benchmark/word-frequency/templates/report.tmp.md";

  render_markdown(benchmark,
                  templateFilepath,
                  id.outputFilepath);
  return 0;
}
