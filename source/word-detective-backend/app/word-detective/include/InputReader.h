#ifndef WORD_DETECTIVE_SPELLINGBEE_INPUTREADER_H
#define WORD_DETECTIVE_SPELLINGBEE_INPUTREADER_H

#include <iostream>
#include <unistd.h>
#include <cstring>
#include "InputData.h"

void usage(char* argv[]);
InputData read_input(int argc, char* argv[]);

#endif