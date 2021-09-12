#include <cassert>
#include <istream>
#include <list>
#include <regex>
#include <string>
#include <unordered_map>

#include "word-detective/datastr/Trie.h"

struct WordFrequencyElement {
  std::string word;
  int frequency;
};

bool operator<(const WordFrequencyElement& w1, const WordFrequencyElement& w2);

class EnglishSegmenter {
 public:
  EnglishSegmenter(std::istream* in_stream) : m_in_stream(in_stream){
    m_buffer_str.reserve(BUFFER_SIZE);
    fill_up_buffer();
  }
  bool next_word(std::string& word);
  void fill_up_buffer();

 private:
  static constexpr unsigned int BUFFER_SIZE = 32000;
  static std::regex rgx;

  char m_buffer[BUFFER_SIZE];

  std::istream* m_in_stream;
  std::string m_buffer_str;
  std::string::const_iterator m_buffer_str_it;

  std::smatch m_match;
};

void map_segmenter(std::unordered_map<std::string, int>& word_frequency_map,
                   std::istream* in_stream);

void list_segmenter(std::list<WordFrequencyElement>& word_frequency_list,
                    std::istream* in_stream);

void trie_segmenter(WordDetective::Datastr::Trie& word_frequency_trie,
                    std::istream* in_stream);
