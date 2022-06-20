namespace PuzzleGenerator::WordCollector {
template <class TForwardIterator>
// TODO: Require appropriated typetraits
std::string get_unique_characters(const TForwardIterator begin,
                                  const TForwardIterator end) {
  std::vector<int> unique_unicodes;
  for (auto it = begin; it != end; ++it) {
    auto vector_of_unicodes = WordDetective::Utils::to_unicode_codes(*it);
    unique_unicodes.insert(unique_unicodes.begin(), vector_of_unicodes.begin(),
                           vector_of_unicodes.end());
  }

  sort(unique_unicodes.begin(), unique_unicodes.end());
  auto last = unique(unique_unicodes.begin(), unique_unicodes.end());
  unique_unicodes.erase(last, unique_unicodes.end());

  return WordDetective::Utils::from_unicode_codes(unique_unicodes);
}
}  // namespace PuzzleGenerator::WordCollector