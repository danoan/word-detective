#include "word-detective/utils/text/filter.hpp"

namespace WordDetective::Utils::Text {
bool always_true_filter(const std::string& s) { return true; }
bool starts_with_capital_letter(const std::string& s) noexcept {
  return isupper(s[0]);
}
}  // namespace WordDetective::Utils::Text
