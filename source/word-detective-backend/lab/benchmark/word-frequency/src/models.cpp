#include "models.h"

std::regex EnglishSegmenter::rgx("[A-Za-z]+");

bool operator<(const WordFrequencyElement& w1, const WordFrequencyElement& w2) {
  return w1.word < w2.word;
}

void EnglishSegmenter::fill_up_buffer() {
  m_in_stream->read(m_buffer, BUFFER_SIZE);
  int last = m_in_stream->gcount() - 1;

  if (!m_in_stream->eof()) {
    int back_step = 0;
    while (m_buffer[last] != '\n') {
      m_buffer[last--] = '\0';
      back_step--;
    }
    m_in_stream->seekg(back_step, std::ios_base::cur);
  }

  m_buffer_str = m_buffer;
  if (!m_in_stream->eof()) {
    assert(m_buffer_str.back() == '\n');
  }

  m_buffer_str_it = m_buffer_str.cbegin();
}

bool EnglishSegmenter::next_word(std::string& word) {
  if (std::regex_search(m_buffer_str_it, m_buffer_str.cend(), m_match, rgx)) {
    m_buffer_str_it = m_match[0].second;

    word = m_match.str();
    return true;
  } else {
    if (m_in_stream->eof()) return false;
    fill_up_buffer();
    return next_word(word);
  }
}

void map_segmenter(std::unordered_map<std::string, int>& word_frequency_map,
                   std::istream* in_stream) {
  EnglishSegmenter ES(in_stream);

  std::string word;
  while (ES.next_word(word)) {
    if (word_frequency_map.find(word) == word_frequency_map.end()) {
      word_frequency_map[word] = 1;
    } else {
      word_frequency_map[word] += 1;
    }
  }
}

void list_segmenter(std::list<WordFrequencyElement>& word_frequency_list,
                    std::istream* in_stream) {
  EnglishSegmenter ES(in_stream);

  std::string word;
  while (ES.next_word(word)) {
    word_frequency_list.push_back(WordFrequencyElement{word, 1});
  }

  word_frequency_list.sort(
      [](const WordFrequencyElement& w1, const WordFrequencyElement& w2) {
        return w1.word < w2.word;
      });

  auto cur = word_frequency_list.begin();
  auto next = cur;
  next++;

  while (next != word_frequency_list.end()) {
    if (cur->word == next->word) {
      cur->frequency++;
      next = word_frequency_list.erase(next);
    } else {
      cur++;
      next++;
    }
  }
}

void trie_segmenter(WordDetective::Datastr::Trie& word_frequency_trie,
                    std::istream* in_stream) {
  EnglishSegmenter ES(in_stream);

  std::string word;
  while (ES.next_word(word)) {
    word_frequency_trie.insert_word(word);
  };
}