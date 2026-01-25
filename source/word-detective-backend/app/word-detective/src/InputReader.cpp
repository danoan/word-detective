#include "InputReader.h"

void usage(char* argv[]) {
  std::cerr << "Usage: " << argv[0] << "\n"
            << "[-L] language (default:english. (english,italian,french,portuguese))\n"
            << "[-l] number of letters in puzzle (default:5)\n"
            << "[-w] minimum number of words in a puzzle (default:5)\n"
            << "[-m] output mode (all,random,index) (default:all)\n"
            << "[-i] puzzle index (default:0)\n"
            << "[-b] input brick filepath (default: reads from stdin)\n"
            << "[-o] output filepath (default: prints in stdout)\n";
}

InputData read_input(int argc, char* argv[]) {
  InputData id;
  id.filepath = "stdin";

  int opt;
  while ((opt = getopt(argc, argv, "L:l:w:m:i:o:b:")) != -1) {
    switch (opt) {
      case 'L':
        if(strcmp("english",optarg)==0) id.language = InputData::Languages::English;
        else if (strcmp("italian",optarg)==0) id.language = InputData::Languages::Italian;
        else if (strcmp("french",optarg)==0) id.language = InputData::Languages::French;
        else if (strcmp("portuguese",optarg)==0) id.language = InputData::Languages::Portuguese;
        else id.language = InputData::Languages::English;
        break;
      case 'l':
        id.num_letters = atoi(optarg);
        break;
      case 'w':
        id.min_words = atoi(optarg);
        break;
      case 'm':
        if (strcmp("all", optarg) == 0) {
          id.out_mode = InputData::ALL_PUZZLES;
        } else if (strcmp("random", optarg) == 0) {
          id.out_mode = InputData::RANDOM_PUZZLE;
        } else if (strcmp("index", optarg) == 0) {
          id.out_mode = InputData::PUZZLE_BY_INDEX;
        } else {
          usage(argv);
          throw std::runtime_error("Unrecognized option");
        }
        break;
      case 'i':
        id.index = atoi(optarg);
        break;
      case 'o':
        id.outputfilepath = optarg;
        break;
      case 'b':
        id.filepath = optarg;
        break;
      default:
        usage(argv);
        exit(0);
        break;
    }
  }

  return id;
}