#include <fstream>
#include <string>
#include <unordered_map>

#include "InputData.h"
#include "InputReader.h"
#include "word-detective/datastr/Brick.h"
#include "word-detective/standard-extensions/brick/io.hpp"
#include "word-detective/utils/text/filter.hpp"
#include "word-detective/utils/text/segmenter.hpp"
#include "word-detective/utils/text/segmenter/english.hpp"

using namespace std;
using namespace WordDetective;

int main(int argc, char* argv[]) {
  InputData id = read_input(argc, argv);

  fstream f(id.input_filepath, ios_base::in);
  unordered_map<string, int> corpora;

  Utils::Text::FilterFunction word_filter =
      [](const std::string& s) {
        return Utils::Text::more_than_n_characters<3>(s) &&
               !Utils::Text::starts_with_capital_letter(s);
      };

  Utils::Text::segment_into_map<Utils::Text::Languages::English>(corpora, f,word_filter);

  Datastr::Brick b;
  for (auto w : corpora) {
    b.insert_word(w.first);
  }

  StandardExtensions::Brick::IO::Save<unsigned char>::run(id.output_filepath,
                                                          b);

  return 0;
}