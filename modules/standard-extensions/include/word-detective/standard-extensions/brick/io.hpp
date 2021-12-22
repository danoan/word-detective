#ifndef WORD_DETECTIVE_STANDARDEXTENSIONS_BRICK_IO_HPP
#define WORD_DETECTIVE_STANDARDEXTENSIONS_BRICK_IO_HPP

#include <fstream>
#include <istream>
#include <list>
#include <ostream>
#include <sstream>
#include <stack>
#include <type_traits>
#include <cassert>

#include "word-detective/datastr/Brick.h"
#include "traversal.hpp"

namespace WordDetective::StandardExtensions::Brick::IO {

using Brick = WordDetective::Datastr::Brick;
using BrickInterface = WordDetective::Datastr::BrickInterface;

template <typename TType,
          typename std::enable_if<std::is_arithmetic<TType>::value,
                                  TType>::type* = nullptr>
void write_number_binary(std::ostream& os, const TType& content) {
  os.write((char*)&content, sizeof(TType));
}

template <typename TAlphabetType>
class WriteFileDescriptor {
 public:
  using OffsetPair = std::pair<TAlphabetType, std::list<std::string>>;
  using WordIterator = std::list<std::string>::const_iterator;

 private:
  std::ostream& m_out_stream;
  unsigned char m_delimiter;
  size_t m_brick_length;

  std::list<OffsetPair> m_offset_pair_list;
 public:
  explicit WriteFileDescriptor(std::ostream& out_stream,
                      unsigned char delimiter = '#')
      : m_out_stream(out_stream),
        m_delimiter(delimiter),
        m_brick_length(0) {}

  ~WriteFileDescriptor() {}

  inline unsigned char delimiter() const { return m_delimiter; }

  void write_alphabet_byte_size() const {
    write_number_binary(m_out_stream,
                        static_cast<unsigned char>(sizeof(TAlphabetType)));
  }

  void write_brick_key(char key) {
    m_out_stream << key;
    ++m_brick_length;
  }

  void write_backtrack_count(TAlphabetType backtrack_count) {
    m_out_stream  << m_delimiter;
    ++m_brick_length;

    write_number_binary(m_out_stream, backtrack_count);
    m_brick_length += sizeof(TAlphabetType);
  }

  void write_brick_length() const {
    write_number_binary(m_out_stream, m_brick_length);
  }

  void push_offset_pair(TAlphabetType offset, WordIterator begin,
                        WordIterator end) {
    m_offset_pair_list.emplace_back(OffsetPair{offset, {begin, end}});
  }

  void write_offset_pair_list() {
    for (auto op : m_offset_pair_list) {
      write_number_binary(m_out_stream, op.first);
      write_number_binary(m_out_stream, op.second.size());
      for (auto s : op.second) {
        m_out_stream << s << m_delimiter;
      }
    }
  }
};

template <typename TAlphabetType>
class ReadFileDescriptor {
 public:
  using OffsetPair = std::pair<TAlphabetType, std::list<std::string>>;
  using WordIterator = std::list<std::string>::const_iterator;

 private:
  unsigned char m_delimiter;
  size_t m_brick_length;
  size_t m_brick_bytes_read;

  std::streampos offset_list_cursor;

  std::istream& m_in_stream;

  inline size_t read_brick_length(size_t& brick_length) const {
    auto cur_pos = m_in_stream.tellg();

    m_in_stream.seekg(- (int) sizeof(size_t), std::ios_base::end);
    m_in_stream.read((char*)&brick_length, sizeof(size_t));

    m_in_stream.seekg(cur_pos, std::ios_base::beg);

    return sizeof(size_t);
  }

 public:
  explicit ReadFileDescriptor(std::istream& in_stream,
                     unsigned char delimiter = '#')
      : m_delimiter(delimiter),
        m_brick_length(0),
        m_brick_bytes_read(0),
        m_in_stream(in_stream)
  {
    read_brick_length(m_brick_length);
    m_in_stream.seekg(m_brick_length + 1,
                       std::ios_base::beg);
    offset_list_cursor = m_in_stream.tellg();
    m_in_stream.seekg(std::ios_base::beg);

    unsigned char alphabet_size;
    read_alphabet_byte_size(alphabet_size);
    assert(alphabet_size==sizeof(TAlphabetType));

  }

  inline unsigned char delimiter() const { return m_delimiter; }

  inline void read_alphabet_byte_size(unsigned char& alpha_size) {
    m_in_stream.seekg(0, std::ios_base::beg);
    m_in_stream.read((char*)&alpha_size, 1);
  }

  inline size_t read_key(char& c) {
    c = m_in_stream.get();
    m_brick_bytes_read += sizeof(char);

    return sizeof(char);
  }

  inline size_t read_backtrack_count(TAlphabetType& backtrack_count) {
    m_in_stream.read((char*)&backtrack_count, sizeof(TAlphabetType));
    m_brick_bytes_read += sizeof(TAlphabetType);

    return sizeof(TAlphabetType);
  }

  void read_next_offset_pair(OffsetPair& op) {
    size_t num_words = 0;

    auto cur_pos = m_in_stream.tellg();
    m_in_stream.seekg(offset_list_cursor,std::ios_base::beg);

    m_in_stream.read((char*)&op.first, sizeof(TAlphabetType));
    m_in_stream.read((char*)&num_words, sizeof(size_t));

    op.second.clear();
    for (; num_words > 0; num_words--) {
      char word[32];
      m_in_stream.get(word, 32, m_delimiter);
      m_in_stream.get();
      op.second.push_back(word);
    }

    offset_list_cursor = m_in_stream.tellg();
    m_in_stream.seekg(cur_pos,std::ios_base::beg);
  }

  bool eof() { return m_brick_bytes_read >= m_brick_length; }
};

template <typename TAlphabetType>
class Save : public WordDetective::Datastr::BrickExtension {
  using MyWriteFileDescriptor = WriteFileDescriptor<TAlphabetType>;
  using OffsetPair = typename MyWriteFileDescriptor::OffsetPair;

  static void _run(std::ostream& out_stream, const Brick& brick) {
    using namespace std;

    MyWriteFileDescriptor wfd(out_stream);
    TAlphabetType last_level = 0;
    int offset = 0;

    wfd.write_alphabet_byte_size();
    auto func = [&wfd, &last_level, &offset](const BrickInterface& b,
                                             TAlphabetType level) {
      // The last visited was a leaf
      if (last_level > 0 && last_level >= level) {
        wfd.write_backtrack_count(
            static_cast<TAlphabetType>(last_level - level + 1));
      }
      last_level = level;
      wfd.write_brick_key(b.key());

      offset++;
      if (b.beginWords() != b.endWords()) {
        wfd.push_offset_pair(offset, b.beginWords(), b.endWords());
        offset = 0;
      }
    };

    WordDetective::StandardExtensions::Brick::Traversal::PreOrder::run(func, brick);

    wfd.write_offset_pair_list();
    wfd.write_brick_length();
  }

 public:
  static void run(std::ostream& out_stream, const Brick& brick) {
    _run(out_stream, brick);
  }
};

class Load : public WordDetective::Datastr::BrickExtension {
  template <typename TAlphabetType>
  static void _run(Brick& brick, std::istream& in_stream) {
    using namespace std;

    using MyReadFileDescriptor = ReadFileDescriptor<TAlphabetType>;
    using OffsetPair = typename MyReadFileDescriptor::OffsetPair;

    _Brick* root = get_root(brick);
    MyReadFileDescriptor rfd(in_stream);

    stack<_Brick*> S;
    S.push(root);

    char c;
    OffsetPair op;

    rfd.read_next_offset_pair(op);
    while (!rfd.eof()) {
      _Brick* cur = S.top();
      rfd.read_key(c);

      if (c == rfd.delimiter()) {
        TAlphabetType backtrack_count = 0;
        rfd.read_backtrack_count(backtrack_count);

        for (; backtrack_count > 0; backtrack_count--) S.pop();
      } else {
        op.first--;
        auto p = cur->insert(c);
        S.push(p);
        if (op.first == 0) {
          std::for_each(op.second.begin(), op.second.end(),
                        [&p](const std::string& word) { p->add_word(word); });
          rfd.read_next_offset_pair(op);
        }
      }
    }
  }

 public:
  static void run(Brick& brick, std::istream& in_stream) {
    using namespace std;

    unsigned char alphabet_byte_size = in_stream.get();
    in_stream.seekg(std::ios_base::beg);

    if (alphabet_byte_size == 1) {
      _run<unsigned char>(brick, in_stream);
    } else if (alphabet_byte_size == 4) {
      _run<int>(brick, in_stream);
    }
  }
};
}  // namespace WordDetective::StandardExtensions::Brick::IO

#endif