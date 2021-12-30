#include "word-detective/utils/unicode.h"

namespace WordDetective::Utils{
  std::vector<int> to_unicode_codes(const std::string& s){
    using namespace std;

    icu::UnicodeString in_us(s.c_str());
    vector<int> vs;
    vs.reserve(in_us.length());

    for(int i=0;i<in_us.length();++i){
      vs.push_back(in_us.charAt(i));
    }

    return vs;
  }

  std::string from_unicode_codes(const std::vector<int>& vs){
    using namespace std;

    icu::UnicodeString out_us;

    for(size_t i=0;i<vs.size();++i){
      out_us.append(vs.at(i));
    }

    std::string s;
    out_us.toUTF8String(s);

    return s;
  }
}
