# Benchmark: Word Frequency Data Structure



## Experiment: jekyll-x100.txt

  |Scenarios/Test Cases|  query |  traversal |  building |
  |--------------------|  ---|  ---|  ---|
   | trie |  0s 417ms  |  0s 0ms  |  1s 281ms  |
   | list |  0s 418ms  |  0s 0ms  |  4s 331ms  |
   | unordered_map |  0s 419ms  |  0s 0ms  |  0s 975ms  |




## Experiment: jekyll.txt

  |Scenarios/Test Cases|  query |  traversal |  building |
  |--------------------|  ---|  ---|  ---|
   | trie |  0s 415ms  |  0s 0ms  |  0s 16ms  |
   | list |  0s 415ms  |  0s 0ms  |  0s 21ms  |
   | unordered_map |  0s 413ms  |  0s 0ms  |  0s 13ms  |




## Memory consumption

|  trie |  list |  unordered_map |
|  ---|  ---|  ---|
|  1 |  6 |  6 |
