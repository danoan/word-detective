#! /usr/bin/env python3

import argparse
import subprocess
import time
import shutil
import toml
import json
import jinja2
import os
import sys
import logging
import traceback
import io

logger = logging.getLogger(__name__)

JINJA_ENV = jinja2.Environment(loader=jinja2.PackageLoader("dictionary_manager","assets/templates"))
CONFIGURATION_FILE= os.path.expanduser("/.config/dictionary_manager/config.toml")

############# Decorators #############
def unexpected_error_wrapper(func):
  def wrapper(*args,**kwargs):
    try:
      func(*args,**kwargs)
    except Exception as e:
      exc_type, exc_value, exc_traceback = sys.exc_info()

      f = io.StringIO()
      traceback.print_tb(exc_traceback,file=f)

      print( prepare_json_response(f.getvalue()) )
      exit(1)
  return wrapper

############# Helpers #############
def prepare_json_response(message,success=False):
  e = {
      "Success":success,
      "Message":message
      }

  return json.dumps(e)

def export_brick(export_brick_app_filepath,language,dictionary_filepath,brick_output_filepath):
  export_brick_args = [
    export_brick_app_filepath,
    "-l",
    language,
    "-i",
    dictionary_filepath,
    brick_output_filepath
  ]

  p = subprocess.run(export_brick_args)
  if p.returncode!= 0:
    print( prepare_json_response("Error during brick generation. Aborting") )
    exit(1)

def find_dictionary_by_name(list_of_dictionaries,name):
  for d in list_of_dictionaries:
    if d["name"] == name:
      return d

def save_configuration_file(configuration_file):
  with open(CONFIGURATION_FILE,"w") as f:
    toml.dump(configuration_file, f)


def load_configuration_file():
  if not os.path.exists(CONFIGURATION_FILE):
    print(f"Configuration file {CONFIGURATION_FILE} could not be found. One is being created.")
    dictionaries_folder = input("Enter the folder where dictionaries will be stored: ")
    export_brick_app_filepath = input("Enter the path og the export-brick application: ")
    create_default_configuration_file(CONFIGURATION_FILE,dictionaries_folder,export_brick_app_filepath)

  return toml.load(CONFIGURATION_FILE)

def create_default_configuration_file(configuration_filepath,dictionaries_folder,export_brick_app_filepath):
  default_configuration_file = os.path.join(os.path.dirname(__file__),"assets","config.toml")

  os.makedirs(os.path.dirname(configuration_filepath),exist_ok=True)
  template = JINJA_ENV.get_template("config.toml.tpl")

  with open(configuration_filepath,"w") as f:
    f.write(template.render(dictionaries_folder=dictionaries_folder,export_brick_app_filepath=export_brick_app_filepath))


############# Actions #############

@unexpected_error_wrapper
def action_process_requested_words(args):
  configuration_file = load_configuration_file()
  d = find_dictionary_by_name(configuration_file["dictionaries"], args.dictionary_name)

  file_str = io.StringIO()
  requested_words = toml.load( d["requested-words-filepath"] )
  valid_words = []
  for word in requested_words["words"]:
    word_check_args = [
      d["word-check-app-filepath"],
      "real-word",
      word,
      "B1QwiDkvO5KYG5tzPVSR3jvOvscROpfvn9wkeDg9p2RuRCydSr6NwACmJLx0bV3E"
    ]

    p = subprocess.run(word_check_args,encoding="utf-8",capture_output=True)
    if p.returncode!=0:
      print(prepare_json_response(f"Error while checking word '{word}'. Aborting."))
      exit(1)

    json_text_response = p.stdout
    json_object = json.loads(json_text_response)

    if json_object["Status"] == True:
      file_str.write(f"Word '{word}' included as a valid word.\n")
      valid_words.append(word)
    else:
      file_str.write(f"Word '{word}' was checked and it does not seem to exist. Not adding in the dictionary.\n")


  with open(d["text-filepath"],"a") as f:
    for word in valid_words:
      f.write(f"{word}\n")

  export_brick(configuration_file["config"]["export-brick-app"], d["language"], d["text-filepath"], d["brick-filepath"])

  d["modification-time"] = time.asctime(time.localtime())
  save_configuration_file(configuration_file)

  with open(d["requested-words-filepath"],"w") as f:
    toml.dump({"words":[]}, f)

  print(prepare_json_response(f"Requested words were processed. Here is the report:\n\n{file_str.getvalue()}",True))


@unexpected_error_wrapper
def action_request_word(args):
  configuration_file = load_configuration_file()
  d = find_dictionary_by_name(configuration_file["dictionaries"], args.dictionary_name)

  if d is None:
    print( prepare_json_response(f"Dictionary '{args.dictionary_name}' was not found. Aborting") )
    exit(1)

  requested_words = toml.load( d["requested-words-filepath"] )

  if len(args.word)<=3:
    print(prepare_json_response(f"The word '{args.word}' is too short. We accept requests of words with length greater than 3."))
    exit(0)

  for word in requested_words["words"]:
    if word == args.word:
      print(prepare_json_response(f"The word '{word}' was requested already."))
      exit(0)

  requested_words["words"].append(args.word)
  with open(d["requested-words-filepath"],"w") as f:
    toml.dump(requested_words, f)

  print(prepare_json_response(f"Word: {args.word} was requested.",True))


@unexpected_error_wrapper
def action_list(args):
  f = io.StringIO()
  configuration_file = load_configuration_file()
  if not "dictionaries" in configuration_file:
    f.write("The list of dictionaries is empty.\n")
  else:
    for d in configuration_file["dictionaries"]:
      for key,value in d.items():
        f.write(f"{key}: {value}\n")
      f.write("\n")

  print(prepare_json_response(f.getvalue(),True))


@unexpected_error_wrapper
def action_remove(args):
  configuration_file = load_configuration_file()
  if "dictionaries" not in configuration_file:
    configuration_file["dictionaries"] = []

  dictionary_exists = False
  for d in configuration_file["dictionaries"]:
    if d["name"] == args.name:
      dictionary_exists = True
      configuration_file["dictionaries"].remove(d)

      os.remove(d["text-filepath"])
      os.remove(d["brick-filepath"])
      os.remove(d["requested-words-filepath"])
      os.removedirs(os.path.dirname(d["text-filepath"]),)

      save_configuration_file(configuration_file)
      break

  if not dictionary_exists:
    print( prepare_json_response(f"There is no dictionary named '{args.name}'. Aborting") )
    exit(1)

  print(prepare_json_response(f"Dictionary: {args.name} was removed.",True))

@unexpected_error_wrapper
def action_add(args):
  configuration_file = load_configuration_file()
  if "dictionaries" not in configuration_file:
    configuration_file["dictionaries"] = []

  for d in configuration_file["dictionaries"]:
    if d["name"] == args.name:
      print(prepare_json_response(f"A dictionary with the name '{args.name}' exists already. Please, choose a different name."))
      exit(0)

  dictionary_folder = os.path.join(configuration_file["config"]["dictionaries-folder"],args.language,args.name)
  dictionary_text_filepath = os.path.join(dictionary_folder,f"{args.name}.txt")
  brick_filepath = os.path.join(dictionary_folder,f"{args.name}.brk")
  requested_words_filepath = os.path.join(dictionary_folder,"requested_words.toml")

  os.makedirs(dictionary_folder,exist_ok=True)
  shutil.copyfile(args.dictionary_filepath, dictionary_text_filepath)
  requested_words_template = JINJA_ENV.get_template("requested_words.toml.tpl")

  with open(requested_words_filepath,"w") as f:
    f.write(requested_words_template.render())

  export_brick(configuration_file["config"]["export-brick-app"], args.language, args.dictionary_filepath, brick_filepath)

  creation_time = time.asctime(time.localtime())
  dictionary_dict = {
      "name": args.name,
      "language": args.language,
      "text-filepath": dictionary_text_filepath,
      "brick-filepath": brick_filepath,
      "word-check-app-filepath": args.word_check_app_filepath,
      "requested-words-filepath": requested_words_filepath,
      "creation-time": creation_time,
      "modification-time": creation_time
    }

  configuration_file["dictionaries"].append(dictionary_dict)
  save_configuration_file(configuration_file)

  print(prepare_json_response(f"Dictionary: {args.name} was added.",True))

############# Parser #############

def create_parser():
  parser = argparse.ArgumentParser(description="Add words in the dictionary")

  subparsers = parser.add_subparsers()

  # add dictionary
  add_parser = subparsers.add_parser("add")
  add_parser.add_argument("name",help="Name of the new dictionary")
  add_parser.add_argument("language",help="Language of the dictionary.")
  add_parser.add_argument("word_check_app_filepath",help="An application that checks if a given word exists.")
  add_parser.add_argument("dictionary_filepath",help="Text file with the list of words in the dictionary. One word per line.")
  add_parser.set_defaults(func=action_add)

  # remove dictionary
  remove_parser = subparsers.add_parser("remove")
  remove_parser.add_argument("name",help="Name of the dictionary to remove.")
  remove_parser.set_defaults(func=action_remove)

  # list
  list_parser = subparsers.add_parser("list")
  list_parser.set_defaults(func=action_list)

  # request word
  parser_request = subparsers.add_parser("request-word")
  parser_request.add_argument("word")
  parser_request.add_argument("dictionary_name")
  parser_request.set_defaults(func=action_request_word)

  # process requested words
  parser_process = subparsers.add_parser("process-requested-words")
  parser_process.add_argument("dictionary_name")
  parser_process.set_defaults(func=action_process_requested_words)

  return parser

def main():
  parser = create_parser()
  args = parser.parse_args()

  if 'func' in args:
    args.func(args)
  else:
    parser.print_help()

if __name__ == '__main__':
  main()
