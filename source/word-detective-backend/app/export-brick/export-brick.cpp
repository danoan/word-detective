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
#include "word-detective/utils/text/segmenter/french.hpp"
#include "word-detective/utils/text/segmenter/italian.hpp"

using namespace std;
using namespace WordDetective;

int main(int argc, char* argv[]) {
  InputData id = read_input(argc, argv);

  unordered_map<string, int> corpora;

  istream* is = &cin;
  unique_ptr<fstream> fs;
  if (id.input_filepath != "stdin") {
    fs.reset(new fstream(id.input_filepath, ios_base::in));
    is = fs.get();
  }

  switch (id.language) {
    case InputData::Languages::Italian:
      Utils::Text::segment_into_map<Utils::Text::Languages::Italian>(
          corpora, *is, ExportBrick::word_filter);
      break;
    case InputData::Languages::French:
      Utils::Text::segment_into_map<Utils::Text::Languages::French>(
          corpora, *is, ExportBrick::word_filter);
      break;
    case InputData::Languages::English:
    default:
      Utils::Text::segment_into_map<Utils::Text::Languages::English>(
          corpora, *is, ExportBrick::word_filter);
      break;
  }

  Datastr::Brick b;
  for (auto w : corpora) {
    b.insert_word(w.first);
  }

  ofstream ofs(id.output_filepath, ios_base::binary);
  StandardExtensions::Brick::IO::Save<int>::run(ofs, b);

  return 0;
}