#include <boost/filesystem.hpp>
#include <fstream>
#include <iostream>

#include "InputData.h"
#include "InputReader.h"
#include "nlohmann/json.hpp"
#include "word-detective-api.h"
#include "word-detective/standard-extensions/brick/io.hpp"

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

  if (id.outputfilepath != "") {
    boost::filesystem::path p(id.outputfilepath);
    boost::filesystem::create_directories(p.remove_filename());
  }

  Datastr::Brick brick;
  if (id.filepath == "stdin") {
    // Create brick from book
    brick = create_brick(std::cin,id.language);
  } else {
    // Create brick from, brick file
    auto fd = std::ifstream(id.filepath, std::ios_base::binary);
    StandardExtensions::Brick::IO::Load::run(brick, fd);
  }

  switch (id.out_mode) {
    case InputData::ALL_PUZZLES: {
      output(all_puzzles(brick, id.num_letters, id.min_words),
             id.outputfilepath);
      break;
    }
    case InputData::RANDOM_PUZZLE: {
      output(random_puzzle(brick, id.num_letters),
             id.outputfilepath);
      break;
    }
    case InputData::RANDOM_PUZZLE_BY_LETTERS: {
      output(random_puzzle_by_letters(brick, id.num_letters),
             id.outputfilepath);
      break;
    }
    case InputData::PUZZLE_BY_INDEX: {
      output(puzzle_by_index(brick, id.num_letters, id.min_words, id.index),
             id.outputfilepath);
      break;
    }
    default:
      throw std::runtime_error("Unrecognized option");
  }

  return 0;
}
