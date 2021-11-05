#include "export-brick-api.h"

namespace ExportBrick {
bool word_filter(const std::string& s) {
  using namespace WordDetective;

  return Utils::Text::more_than_n_characters<3>(s) &&
         !Utils::Text::starts_with_capital_letter(s);
};
}  // namespace ExportBrick