#include "word-detective/utils/text/segmenter/italian.hpp"

namespace WordDetective::Utils::Text {
std::regex ItalianSegmenter::WordIteratorImpl::rgx("[A-Za-z\\-àèéìòùÀÈÉÌÒÙ'\"`]+");
}
