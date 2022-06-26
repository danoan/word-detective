#! /usr/bin/env python3

import argparse
import json
import sys

import requests
from bs4 import BeautifulSoup

API_FETCH_ADDRESS = "https://api.collinsdictionary.com/api/v1"

################ API Request ################
def get_best_matching(word,secret_key):
    headers = {"Host": "localhost", "Accept": "application/xml",
               "accessKey": secret_key}
    return requests.get(f"{API_FETCH_ADDRESS}/dictionaries/english/search/first/?q={word}&format=xml", headers=headers)


def get_entry(entry_id,secret_key):
    headers = {"Host": "localhost", "Accept": "application/xml",
               "accessKey": secret_key}
    return requests.get(f"{API_FETCH_ADDRESS}/dictionaries/english/entries/{entry_id}?format=html", headers=headers)


################ XML Parsers ################
def parse_entry_id(best_matching_xml_response):
  xml_parsed_response = BeautifulSoup(best_matching_xml_response,"xml")
  return xml_parsed_response.find("entryId").getText()


def parse_definitions(entry_xml_response):
    xml_parsed_response = BeautifulSoup(entry_xml_response, "xml")

    html_content = xml_parsed_response.find("entryContent").getText()
    html_parsed = BeautifulSoup(html_content, "html.parser")

    def is_definition(tag):
        return tag.name == "span" and tag.has_attr("class") and "def" in tag["class"]

    return [tag.getText() for tag in html_parsed.find_all(is_definition)]

################ Actions ################
def action_real_word(args):
  response = get_best_matching(args.word,args.secret_key)

  if response is not None and response.status_code == 200:
    entry_id = parse_entry_id(response.text)
    d = {
      "Status": True,
      "EntryId": entry_id
    }
  else:
    d = {
      "Status": False
    }

  return d

def action_definition(args):
  def construct_dict_response(list_of_definitions):
    if list_of_definitions is None:
      d = {
        "Status": False
      }
    else:
      d = {
        "Status": True,
        "Definitions": list_of_definitions
      }
    return d

  d = construct_dict_response(None)
  if args.word is not None:
    real_word_response = action_real_word(args)
    if real_word_response["Status"] == False:
      return d
    else:
      entry_id = real_word_response["EntryId"]
  else:
    entry_id = args.entry_id

  response = get_entry(entry_id,args.secret_key)
  if response is not None and response.status_code == 200:
    list_of_definitions = parse_definitions(response.text)
    d = construct_dict_response(list_of_definitions)

  return d

################ CLI Parsers ################
def create_parser():
  parser = argparse.ArgumentParser(description="Search english word definitions using the Collins API.")

  subparsers = parser.add_subparsers()
  real_word_parser = subparsers.add_parser("real-word",description="Check if a word really exists and get its entry_id")
  real_word_parser.add_argument("word",help="Word to search its definition.")
  real_word_parser.add_argument("secret_key", help="Collins API private user key.")
  real_word_parser.set_defaults(func=action_real_word)

  definition_parser = subparsers.add_parser("definition",description="Fetch the definition from entry_id or word")
  definition_parser.add_argument("--entry-id",help="Word to search its definition.")
  definition_parser.add_argument("--word",help="Word to search its definition.")
  definition_parser.add_argument("secret_key", help="Collins API private user key.")
  definition_parser.set_defaults(func=action_definition)

  return parser

def main():
    parser = create_parser()
    args = parser.parse_args()

    if 'func' in args:
      json.dump(args.func(args),sys.stdout)
    else:
      parser.print_help()


if __name__ == "__main__":
    main()
