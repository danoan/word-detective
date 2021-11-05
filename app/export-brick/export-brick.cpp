#include <fstream>
#include <string>
#include <unordered_map>

#include "InputData.h"
#include "InputReader.h"
#include "export-brick-api.h"
#include "word-detective/datastr/Brick.h"
#include "word-detective/standard-extensions/brick/io.hpp"
#include "word-detective/utils/text/filter.hpp"
#include "word-detective/utils/text/segmenter.hpp"
#include "word-detective/utils/text/segmenter/english.hpp"

using namespace std;
using namespace WordDetective;

int main(int argc, char* argv[]) {
  InputData id = read_input(argc, argv);

  unordered_map<string, int> corpora;
  if (id.input_filepath == "stdin") {
    Utils::Text::segment_into_map<Utils::Text::Languages::English>(
        corpora, cin, ExportBrick::word_filter);
  } else {
    fstream f(id.input_filepath, ios_base::in);
    Utils::Text::segment_into_map<Utils::Text::Languages::English>(
        corpora, f, ExportBrick::word_filter);
  }

  Datastr::Brick b;
  for (auto w : corpora) {
    b.insert_word(w.first);
  }

  ofstream ofs(id.output_filepath, ios_base::binary);
  StandardExtensions::Brick::IO::Save<unsigned char>::run(ofs, b);

  return 0;
}