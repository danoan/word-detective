#ifndef WORD_DETECTIVE_STANDARDEXTENSIONS_TYPETRAITS_H
#define WORD_DETECTIVE_STANDARDEXTENSIONS_TYPETRAITS_H

#include <iterator>
#include <type_traits>

namespace WordDetective::StandardExtensions::TypeTraits {

template <typename TType>
struct is_output_iterator : std::is_same<typename TType::iterator_category,
                                         std::output_iterator_tag> {};
}  // namespace WordDetective::StandardExtensions::TypeTraits


#endif