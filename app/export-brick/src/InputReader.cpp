#include "InputReader.h"

void usage(char* argv[]){
  std::cout << "Usage: " << argv[0]
  << "Input_Text_Filepath Output_Brick_Object";
}

InputData read_input(int argc, char* argv[]){
  InputData id;

  if(argc<2){
    usage(argv);
    exit(0);
  }

  id.input_filepath = argv[1];
  id.output_filepath = argv[2];

  return id;
}