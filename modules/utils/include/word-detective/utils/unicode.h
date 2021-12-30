#ifndef WORD_DETECTIVE_UTILS_UNICODE_H
#define WORD_DETECTIVE_UTILS_UNICODE_H

#include <string>
#include <vector>

#include "unicode/unistr.h"

namespace WordDetective::Utils{
  std::vector<int> to_unicode_codes(const std::string& s);
  std::string from_unicode_codes(const std::vector<int>& vs);
}

#endif