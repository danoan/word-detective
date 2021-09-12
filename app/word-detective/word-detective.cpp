#include <fstream>
#include <iostream>
#include <boost/filesystem.hpp>

#include "nlohmann/json.hpp"

#include "word-detective/standard-extensions/brick/io.hpp"

#include "InputData.h"
#include "InputReader.h"
#include "word-detective-api.h"

void output(const json& jsonOutput, const std::string& outputFilepath) {
  if (outputFilepath != "") {
    ofstream ofs(outputFilepath);
    ofs << jsonOutput;
  } else {
    cout << jsonOutput;
  }
}

int main(int argc, char* argv[]) {
  InputData id = read_input(argc, argv);

  boost::filesystem::path p(id.outputfilepath);
  boost::filesystem::create_directories(p.remove_filename());

  Datastr::Brick brick;
  StandardExtensions::Brick::IO::Load::run(brick, id.filepath);

  switch (id.out_mode) {
    case InputData::ALL_PUZZLES: {
      output(all_puzzles(brick, id.num_letters,id.min_words), id.outputfilepath);
      break;
    }
    case InputData::RANDOM_PUZZLE: {
      output(random_puzzle(brick, id.num_letters,id.min_words), id.outputfilepath);
      break;
    }
    case InputData::PUZZLE_BY_INDEX: {
      output(puzzle_by_index(brick, id.num_letters,id.min_words,id.index), id.outputfilepath);
      break;
    }
    default:
      throw std::runtime_error("Unrecognized option: " + id.out_mode);
  }

  return 0;
}
