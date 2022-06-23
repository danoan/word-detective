#ifndef BENCHMARK_UTILS_EXPERIMENT_H
#define BENCHMARK_UTILS_EXPERIMENT_H

#include <string>
#include <unordered_map>

namespace Benchmark {
struct TestCase {
  std::string label;
  std::string executionTime;
};

class Scenario {
 public:
  using TestCaseIterator =
      std::unordered_map<std::string, TestCase>::const_iterator;

 private:
  std::unordered_map<std::string, TestCase> m_test_cases;

 public:
  std::string name;

 public:
  Scenario(){};
  Scenario(const std::string& name) : name(name) {}

  Scenario& add_test_case(TestCase test_case) {
    m_test_cases[test_case.label] = test_case;
    return *this;
  }

  TestCase& operator[](const std::string& test_case_label) {
    return m_test_cases[test_case_label];
  }

  const TestCase& operator[](const std::string& test_case_label) const {
    return m_test_cases.at(test_case_label);
  }

  // TODO: Make return an iterator to values instead of key,value pair
  TestCaseIterator begin() const { return m_test_cases.begin(); }
  TestCaseIterator end() const { return m_test_cases.end(); }
};

class Experiment {
 public:
  using ScenarioIterator =
      std::unordered_map<std::string, Scenario>::const_iterator;

 private:
  std::unordered_map<std::string, Scenario> m_scenarios;

 public:
  std::string name;

 public:
  Experiment() {}
  Experiment(const std::string& name) : name(name){};

  Scenario& add_scenario(Scenario scenario) {
    m_scenarios[scenario.name] = scenario;
    return m_scenarios[scenario.name];
  }

  Scenario& operator[](const std::string& scenario_name) {
    return m_scenarios[scenario_name];
  }

  const Scenario& operator[](const std::string& scenario_name) const {
    return m_scenarios.at(scenario_name);
  }

  ScenarioIterator begin() const { return m_scenarios.begin(); }
  ScenarioIterator end() const { return m_scenarios.end(); }
};

class Benchmark {
 public:
  using ExperimentIterator =
      std::unordered_map<std::string, Experiment>::const_iterator;

 private:
  std::unordered_map<std::string, Experiment> m_experiments;

 public:
  std::string title;

 public:
  Benchmark(const std::string& title) : title(title) {}

  Experiment& add_experiment(const Experiment& experiment) {
    m_experiments[experiment.name] = experiment;
    return m_experiments[experiment.name];
  }

  Experiment& operator[](const std::string& experiment_name) {
    return m_experiments[experiment_name];
  }

  const Experiment& operator[](const std::string& experiment_name) const {
    return m_experiments.at(experiment_name);
  }

  ExperimentIterator begin() const { return m_experiments.begin(); }
  ExperimentIterator end() const { return m_experiments.end(); }
};

}  // namespace Benchmark

#endif