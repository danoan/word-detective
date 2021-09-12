#ifndef WORD_DETECTIVE_UTILS_TEXT_FILTER_HPP
#define WORD_DETECTIVE_UTILS_TEXT_FILTER_HPP

#include <string>

namespace WordDetective::Utils::Text {
bool starts_with_capital_letter(const std::string& s) noexcept;

template <int n>
bool more_than_n_characters(const std::string& s) noexcept {
  return s.size() > n;
}
}  // namespace WordDetective::Utils::Text

#endif