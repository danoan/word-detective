#ifndef WORD_DETECTIVE_STANDARDEXTENSIONS_BRICK_TRAVERSAL_HPP
#define WORD_DETECTIVE_STANDARDEXTENSIONS_BRICK_TRAVERSAL_HPP

#include <functional>
#include <ostream>
#include <string>
#include <random>


#include "word-detective/datastr/Brick.h"
#include "word-detective/standard-extensions/type-traits.hpp"

namespace WordDetective::StandardExtensions::Brick::Traversal {
using Brick = WordDetective::Datastr::Brick;
using BrickInterface = WordDetective::Datastr::BrickInterface;

class PreOrder : public WordDetective::Datastr::BrickExtension {
  using Callback = std::function<void(const BrickInterface&, int)>;
  static void _run(const Callback& func, const BrickInterface* brick, int level = 0);

 public:
  static void run(const Callback& func, const Brick& brick);
  static void run(std::ostream& os, const Brick& brick);
};

class RandomPath : public WordDetective::Datastr::BrickExtension {
  using Callback = std::function<void(const BrickInterface&, const std::string&)>;

  template<class TForwardIterator>
  static typename TForwardIterator::value_type _at(TForwardIterator begin, TForwardIterator end, size_t index){
    for(int i=0;i<index && begin!=end;++i){
      begin++;
    }
    if(begin==end) throw std::runtime_error("Index out of bounds");
    return *begin;
  }

  static const BrickInterface* _run(const BrickInterface* b, std::string& path,
                   int path_length_target) {
    path.push_back(b->key());

    if (path_length_target == path.size()) {
      if (b->beginWords() != b->endWords()) return b;
      else return nullptr;
    }

    if(static_cast<const _Brick*>(b)->num_nodes()==0) return nullptr;

    std::random_device rd;
    std::uniform_int_distribution<int> distr(0,static_cast<const _Brick*>(b)->num_nodes()-1);

    const BrickInterface* found = nullptr;
    return _run(_at(b->begin(),b->end(), distr(rd)) ,path, path_length_target);
  }

 public:
  static bool run(const Callback& callback, const Brick& brick, int path_length) {
    _Brick* curr = get_root(brick);
    if(curr->num_nodes()==0) callback(*curr,"");

    std::random_device rd;
    std::uniform_int_distribution<int> distr(0,curr->num_nodes()-1);

    std::string path = "";
    int tries = 10;
    const BrickInterface* found = nullptr;
    while(found==nullptr && tries > 0){
      found = _run(_at(curr->begin(),curr->end(), distr(rd)) ,path,path_length);
      tries--;
    }

    if(found==nullptr){
      callback(*curr,"");
      return false;
    }else{
      callback(*found,path);
      return true;
    }

  }
};

}  // namespace WordDetective::StandardExtensions::Brick::Traversal

#endif