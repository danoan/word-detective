#! /usr/bin/env python3

import argparse
import io
import json
import logging
import os
import shutil
import subprocess
import sys
import time
import traceback

import jinja2
import toml

logger = logging.getLogger(__name__)

JINJA_ENV = jinja2.Environment(loader=jinja2.PackageLoader("word_source_manager", "assets/templates"))
CONFIGURATION_FILE = os.path.expanduser("/.config/word_source_manager/config.toml")


############# Decorators #############
def unexpected_error_wrapper(func):
    def wrapper(*args, **kwargs):
        try:
            func(*args, **kwargs)
        except Exception:
            exc_type, exc_value, exc_traceback = sys.exc_info()

            f = io.StringIO()
            traceback.print_tb(exc_traceback, file=f)

            print(prepare_json_response(f.getvalue()))
            exit(1)

    return wrapper


############# Helpers #############
def prepare_json_response(message, success=False):
    e = {"Success": success, "Message": message}

    return json.dumps(e)


def export_brick(export_brick_app_filepath, language, word_source_filepath, brick_output_filepath):
    export_brick_args = [export_brick_app_filepath, "-l", language, "-i", word_source_filepath, brick_output_filepath]

    p = subprocess.run(export_brick_args)
    if p.returncode != 0:
        print(prepare_json_response("Error during brick generation. Aborting"))
        exit(1)


def find_word_source_by_name(list_of_word_sources, name):
    for d in list_of_word_sources:
        if d["name"] == name:
            return d


def save_configuration_file(configuration_file):
    with open(CONFIGURATION_FILE, "w") as f:
        toml.dump(configuration_file, f)


def load_configuration_file():
    if not os.path.exists(CONFIGURATION_FILE):
        print(f"Configuration file {CONFIGURATION_FILE} could not be found. One is being created.")
        word_sources_folder = input("Enter the folder where word sources will be stored: ")
        export_brick_app_filepath = input("Enter the path og the export-brick application: ")
        create_default_configuration_file(CONFIGURATION_FILE, word_sources_folder, export_brick_app_filepath)

    return toml.load(CONFIGURATION_FILE)


def create_default_configuration_file(configuration_filepath, word_sources_folder, export_brick_app_filepath):
    os.makedirs(os.path.dirname(configuration_filepath), exist_ok=True)
    template = JINJA_ENV.get_template("config.toml.tpl")

    with open(configuration_filepath, "w") as f:
        f.write(
            template.render(
                word_sources_folder=word_sources_folder, export_brick_app_filepath=export_brick_app_filepath
            )
        )


############# Actions #############


@unexpected_error_wrapper
def action_process_requested_words(args):
    configuration_file = load_configuration_file()
    d = find_word_source_by_name(configuration_file["word_sources"], args.word_source_name)

    file_str = io.StringIO()
    requested_words = toml.load(d["requested-words-filepath"])
    valid_words = []
    total = len(requested_words["words"])
    for i, word in enumerate(requested_words["words"]):
        word_check_args = [
            d["word-check-app-filepath"],
            "real-word",
            word,
            "B1QwiDkvO5KYG5tzPVSR3jvOvscROpfvn9wkeDg9p2RuRCydSr6NwACmJLx0bV3E",
        ]

        p = subprocess.run(word_check_args, encoding="utf-8", capture_output=True)
        if p.returncode != 0:
            print(prepare_json_response(f"Error while checking word '{word}'. Aborting."))
            exit(1)

        json_text_response = p.stdout
        json_object = json.loads(json_text_response)

        if json_object["Status"]:
            file_str.write(f"Word '{word}' included as a valid word.\n")
            valid_words.append(word)
        else:
            file_str.write(f"Word '{word}' was checked and it does not seem to exist. Not adding in the word source.\n")

        sys.stderr.write(json.dumps({"type": "progress", "word": word, "valid": bool(json_object["Status"]), "index": i, "total": total}) + "\n")
        sys.stderr.flush()

    with open(d["text-filepath"], "a") as f:
        for word in valid_words:
            f.write(f"{word}\n")

    added_requested_words_filepath = d.get(
        "added-requested-words-filepath",
        os.path.join(os.path.dirname(d["text-filepath"]), "added_requested_words.txt"),
    )
    with open(added_requested_words_filepath, "a") as f:
        for word in valid_words:
            f.write(f"{word}\n")

    if "added-requested-words-filepath" not in d:
        d["added-requested-words-filepath"] = added_requested_words_filepath

    export_brick(
        configuration_file["config"]["export-brick-app"], d["language"], d["text-filepath"], d["brick-filepath"]
    )

    d["modification-time"] = time.asctime(time.localtime())
    save_configuration_file(configuration_file)

    with open(d["requested-words-filepath"], "w") as f:
        toml.dump({"words": []}, f)

    print(prepare_json_response(f"Requested words were processed. Here is the report:\n\n{file_str.getvalue()}", True))


@unexpected_error_wrapper
def action_request_word(args):
    configuration_file = load_configuration_file()
    d = find_word_source_by_name(configuration_file["word_sources"], args.word_source_name)

    if d is None:
        print(prepare_json_response(f"Word source '{args.word_source_name}' was not found. Aborting"))
        exit(1)

    requested_words = toml.load(d["requested-words-filepath"])

    if len(args.word) <= 3:
        print(
            prepare_json_response(
                f"The word '{args.word}' is too short. We accept requests of words with length greater than 3."
            )
        )
        exit(0)

    for word in requested_words["words"]:
        if word == args.word:
            print(prepare_json_response(f"The word '{word}' was requested already."))
            exit(0)

    requested_words["words"].append(args.word)
    with open(d["requested-words-filepath"], "w") as f:
        toml.dump(requested_words, f)

    print(prepare_json_response(f"Word: {args.word} was requested.", True))


@unexpected_error_wrapper
def action_list(args):
    f = io.StringIO()
    configuration_file = load_configuration_file()
    if "word_sources" not in configuration_file:
        f.write("The list of word sources is empty.\n")
    else:
        for d in configuration_file["word_sources"]:
            for key, value in d.items():
                f.write(f"{key}: {value}\n")
            f.write("\n")

    print(prepare_json_response(f.getvalue(), True))


@unexpected_error_wrapper
def action_remove(args):
    configuration_file = load_configuration_file()
    if "word_sources" not in configuration_file:
        configuration_file["word_sources"] = []

    word_source_exists = False
    for d in configuration_file["word_sources"]:
        if d["name"] == args.name:
            word_source_exists = True
            configuration_file["word_sources"].remove(d)

            os.remove(d["text-filepath"])
            os.remove(d["brick-filepath"])
            os.remove(d["requested-words-filepath"])
            added_path = d.get("added-requested-words-filepath")
            if added_path and os.path.exists(added_path):
                os.remove(added_path)
            os.removedirs(
                os.path.dirname(d["text-filepath"]),
            )

            save_configuration_file(configuration_file)
            break

    if not word_source_exists:
        print(prepare_json_response(f"There is no word source named '{args.name}'. Aborting"))
        exit(1)

    print(prepare_json_response(f"Word source: {args.name} was removed.", True))


@unexpected_error_wrapper
def action_add(args):
    configuration_file = load_configuration_file()
    if "word_sources" not in configuration_file:
        configuration_file["word_sources"] = []

    for d in configuration_file["word_sources"]:
        if d["name"] == args.name:
            print(
                prepare_json_response(
                    f"A word source with the name '{args.name}' exists already. Please, choose a different name."
                )
            )
            exit(0)

    word_source_folder = os.path.join(configuration_file["config"]["word-sources-folder"], args.language, args.name)
    word_source_text_filepath = os.path.join(word_source_folder, f"{args.name}.txt")
    brick_filepath = os.path.join(word_source_folder, f"{args.name}.brk")
    requested_words_filepath = os.path.join(word_source_folder, "requested_words.toml")
    added_requested_words_filepath = os.path.join(word_source_folder, "added_requested_words.txt")

    os.makedirs(word_source_folder, exist_ok=True)
    shutil.copyfile(args.word_source_filepath, word_source_text_filepath)
    requested_words_template = JINJA_ENV.get_template("requested_words.toml.tpl")

    with open(requested_words_filepath, "w") as f:
        f.write(requested_words_template.render())

    with open(added_requested_words_filepath, "w") as f:
        pass

    export_brick(
        configuration_file["config"]["export-brick-app"], args.language, args.word_source_filepath, brick_filepath
    )

    creation_time = time.asctime(time.localtime())
    word_source_dict = {
        "name": args.name,
        "language": args.language,
        "text-filepath": word_source_text_filepath,
        "brick-filepath": brick_filepath,
        "word-check-app-filepath": args.word_check_app_filepath,
        "requested-words-filepath": requested_words_filepath,
        "added-requested-words-filepath": added_requested_words_filepath,
        "creation-time": creation_time,
        "modification-time": creation_time,
    }

    configuration_file["word_sources"].append(word_source_dict)
    save_configuration_file(configuration_file)

    print(prepare_json_response(f"Word source: {args.name} was added.", True))


############# Parser #############


def create_parser():
    parser = argparse.ArgumentParser(description="Add words in the word source")

    subparsers = parser.add_subparsers()

    # add word source
    add_parser = subparsers.add_parser("add")
    add_parser.add_argument("name", help="Name of the new word source")
    add_parser.add_argument("language", help="Language of the word source.")
    add_parser.add_argument("word_check_app_filepath", help="An application that checks if a given word exists.")
    add_parser.add_argument(
        "word_source_filepath", help="Text file with the list of words in the word source. One word per line."
    )
    add_parser.set_defaults(func=action_add)

    # remove word source
    remove_parser = subparsers.add_parser("remove")
    remove_parser.add_argument("name", help="Name of the word source to remove.")
    remove_parser.set_defaults(func=action_remove)

    # list
    list_parser = subparsers.add_parser("list")
    list_parser.set_defaults(func=action_list)

    # request word
    parser_request = subparsers.add_parser("request-word")
    parser_request.add_argument("word")
    parser_request.add_argument("word_source_name")
    parser_request.set_defaults(func=action_request_word)

    # process requested words
    parser_process = subparsers.add_parser("process-requested-words")
    parser_process.add_argument("word_source_name")
    parser_process.set_defaults(func=action_process_requested_words)

    return parser


def main():
    parser = create_parser()
    args = parser.parse_args()

    if "func" in args:
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
