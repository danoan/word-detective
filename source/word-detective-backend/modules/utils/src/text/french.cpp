#include "word-detective/utils/text/segmenter/french.hpp"

namespace WordDetective::Utils::Text {
std::regex FrenchSegmenter::WordIteratorImpl::rgx("[A-Za-z\\-àâäæçéèêëïîôœùûüÿÀÂÄÆÇÉÈÊËÏÎÔŒÙÛÜŸ'\"`]+");
}
