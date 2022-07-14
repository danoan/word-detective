#include "word-detective/utils/text/filter.hpp"

namespace WordDetective::Utils::Text {
bool always_true_filter(const std::string& s) noexcept { return true; }
bool starts_with_capital_letter(const std::string& s) noexcept {
  return isupper(s[0]);
}
bool has_apostrophe(const std::string& s) noexcept {
  static std::regex rgx_apostrophe("['\"`]");
  return std::regex_search(s,rgx_apostrophe);
}
}  // namespace WordDetective::Utils::Text
