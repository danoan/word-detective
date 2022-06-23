#include "word-detective/utils/text/segmenter/english.hpp"

namespace WordDetective::Utils::Text {
std::regex EnglishSegmenter::WordIteratorImpl::rgx("[A-Za-z\\-]+");
}
