#include "word-detective/utils/text/segmenter/portuguese.hpp"

namespace WordDetective::Utils::Text {
std::regex PortugueseSegmenter::WordIteratorImpl::rgx("[A-Za-z\\-áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ'\"`]+");
}
