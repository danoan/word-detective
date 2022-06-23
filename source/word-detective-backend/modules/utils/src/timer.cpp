#include "word-detective/utils/timer.h"

namespace WordDetective::Utils {

void Timer::start() {
  start_time = std::chrono::steady_clock::now();
}

void Timer::end(std::ostream& os) {
  end_time = std::chrono::steady_clock::now();

  milliseconds_last_diff = std::chrono::duration_cast<std::chrono::milliseconds>(end_time-start_time).count();
  seconds_last_diff = static_cast<int64_t>(std::floor(milliseconds_last_diff/1000));

  os << seconds_last_diff << "s " << (milliseconds_last_diff - seconds_last_diff*1000) << "ms ";
}
}  // namespace WordDetective::Utils