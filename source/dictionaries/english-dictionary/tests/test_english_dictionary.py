#! /usr/bin/env python3

import unittest
import os

import english_dictionary.english_dictionary as ED

TEST_FOLDER = os.path.dirname(__file__)

class TestParseDefinitions(unittest.TestCase):
  def setUp(self):
    MOCK_ENTRY_XML_RESPONSE = os.path.join(TEST_FOLDER,"examples","get-entry.xml")

    self.xml_response = None
    with open(MOCK_ENTRY_XML_RESPONSE) as f:
      self.xml_response = f.read()

    if self.xml_response is None:
      print("Could not set up mock xml response. Aborting tests.")
      exit(1)

  def test_parse_definitions(self):
    list_of_definitions = ED.parse_definitions(self.xml_response)
    assert( len(list_of_definitions)==6)
    assert( list_of_definitions[0]=="a metal disc or piece used as money" )


class TestParseEntry(unittest.TestCase):
  def setUp(self):
    MOCK_BEST_MATCHING_XML_RESPONSE = os.path.join(TEST_FOLDER,"examples","get-best-matching.xml")

    self.xml_response = None
    with open(MOCK_BEST_MATCHING_XML_RESPONSE) as f:
      self.xml_response = f.read()

    if self.xml_response is None:
      print("Could not set up mock xml response. Aborting tests.")
      exit(1)

  def test_parse_entry_id(self):
    entry_id = ED.parse_entry_id(self.xml_response)
    assert(entry_id=="coin_1")