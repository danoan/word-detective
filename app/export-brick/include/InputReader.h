#ifndef WORD_DETECTIVE_EXPORTBRICK_INPUTREADER_H
#define WORD_DETECTIVE_EXPORTBRICK_INPUTREADER_H

#include <unistd.h>
#include <iostream>

#include "InputData.h"

void usage(char* argv[]);
InputData read_input(int argc, char* argv[]);

#endif