#include "InputReader.h"

void usage(char* argv[]) {
  std::cout << "Usage: " << argv[0] << "\n"
            << "[-i Input_Text_Filepath. Default: stdin]\n"
            << "Output_Brick_Object";
}

InputData read_input(int argc, char* argv[]) {
  InputData id;
  id.input_filepath = "stdin";

  if (argc < 2) {
    std::cout << "stop 1\n";
    usage(argv);
    exit(0);
  }

  int opt;
  while ((opt = getopt(argc, argv, "i:")) != -1) {
    switch (opt) {
      case 'i': {
        id.input_filepath = optarg;
        break;
      }
      default: {
        usage(argv);
        std::cout << "stop 2\n";
        exit(0);
      }
    }
  }

  id.output_filepath = argv[optind++];

  return id;
}