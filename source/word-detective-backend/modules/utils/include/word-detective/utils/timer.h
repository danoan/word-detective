#ifndef WORD_DETECTIVE_UTILS_TIMER_H
#define WORD_DETECTIVE_UTILS_TIMER_H

#include <chrono>
#include <ostream>
#include <cmath>

namespace WordDetective::Utils {
struct Timer {
  std::chrono::time_point<std::chrono::steady_clock> start_time;
  std::chrono::time_point<std::chrono::steady_clock> end_time;
  int64_t milliseconds_last_diff;
  int64_t seconds_last_diff;

  void start();
  void end(std::ostream& os);
};

}  // namespace WordDetective::Utils

#endif  // WORD_DETECTIVE_UTILS_TIMER_H
