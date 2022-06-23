#include "benchmark-utils/render.h"

namespace Benchmark {
std::ostream& operator<<(std::ostream& ostream, const Benchmark& benchmark) {
  ostream << render_benchmark(benchmark);
  return ostream;
}

json render_test_case(const TestCase& test_case) {
  return json{{"Label", test_case.label},
              {"ExecutionTime", test_case.executionTime}};
}

json render_scenario(const Scenario& scenario) {
  json scenario_json{{"Name", scenario.name}, {"TestCases", json::array()}};

  for (auto test_case_pair : scenario) {
    scenario_json["TestCases"].push_back(
        render_test_case(test_case_pair.second));
  }
  return scenario_json;
}

json render_experiment(const Experiment& experiment) {
  json experiment_json{
      {"Name", experiment.name},
      {"Scenarios", json::array()},
  };

  for (auto scenario_pair : experiment) {
    experiment_json["Scenarios"].push_back(
        render_scenario(scenario_pair.second));
  }

  return experiment_json;
}

json render_benchmark(const Benchmark& benchmark) {
  json benchmark_json{{"Title", benchmark.title},
                      {"Experiments", json::array()}};

  for (auto experiment_pair : benchmark) {
    benchmark_json["Experiments"].push_back(
        render_experiment(experiment_pair.second));
  }

  return benchmark_json;
}

void render_markdown(const Benchmark& benchmark,
                     const std::string& template_filepath,
                     const std::string& output_filepath) {
  inja::Environment env;
  env.write(template_filepath, render_benchmark(benchmark), output_filepath);
}
}  // namespace Benchmark