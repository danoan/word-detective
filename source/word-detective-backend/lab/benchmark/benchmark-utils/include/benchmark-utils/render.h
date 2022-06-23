// Standard libraries
#include <string>
#include <ostream>

// External libraries
#include "nlohmann/json.hpp"
#include "inja/inja.hpp"

// Project includes
#include "Experiment.h"

namespace Benchmark {
using json = nlohmann::json;

std::ostream& operator<<(std::ostream& ostream, const Benchmark& benchmark);
json render_test_case(const TestCase&);
json render_scenario(const Scenario&);
json render_experiment(const Experiment&);
json render_benchmark(const Benchmark&);

void render_markdown(const Benchmark& benchmark,
                     const std::string& template_filepath,
                     const std::string& output_filepath);
}  // namespace Benchmark