'use strict';

import { data_control_handler, word_control_handler } from "./control-handlers.js";
import {
  messages_display_handler,
  hint_mode_display_handler,
  normal_mode_display_handler
} from "./display-handlers.js";

let default_config = {
  "callbacks": {
    "init": null,
    "click_letter": null,
    "erase_letter": null,
    "check_word": null,
    "hint": null,
    "end": null
  }
};

export function create_WORD_DETECTIVE_api(gui, messages_json, config) {
  if(config===null){
    config = default_config;
  }

  let messages = setup_messages(messages_json);
  let callbacks = config.callbacks;
  let display_handlers = {
    "normal_mode": normal_mode_display_handler(gui),
    "hint_mode": hint_mode_display_handler(gui),
    "messages": messages_display_handler(gui, messages)
  };
  let control_handlers = {
    "word": word_control_handler(),
    "data": data_control_handler()
  };

  function add_found_word(word){
    control_handlers.data.add_found_word(word);
    gui.add_to_word_list(word);
  }

  function add_missing_word(word){
    control_handlers.data.add_missing_word(word);
  }


  function pack_callback_params() {
    return {
      add_missing_word,
      add_found_word,
      get_words_found: () => [...control_handlers.data.words_found],
      get_missing_words: () => [...control_handlers.data.missing_words]
    };
  }

  let current_mode_handler = display_handlers.normal_mode;

  function init() {
    callbacks.init(pack_callback_params());
    display_handlers.messages.update_missing_words_count(control_handlers.data.missing_words.length);
  }

  function click_letter(...args) {
    current_mode_handler.click_letter(...args);
    click_letter.unblock();

    if (callbacks.click_letter !== null){
      callbacks.click_letter(pack_callback_params());
    }
  }

  function erase_letter(...args) {
    current_mode_handler.erase_letter(...args);
    erase_letter.unblock();

    if (callbacks.erase_letter !== null){
      callbacks.erase_letter(pack_callback_params());
    }
  }

  function hint() {
    if (current_mode_handler === display_handlers.normal_mode) {
      current_mode_handler = display_handlers.hint_mode;
    } else {
      current_mode_handler = display_handlers.normal_mode;
    }
    current_mode_handler.init(control_handlers.data.missing_words[0]);
    hint.unblock();

    if (callbacks.hint !== null){
      callbacks.hint(pack_callback_params());
    }
  }

  function check_word() {
    let input_word = gui.get_display_value();
    let is_missing_word = control_handlers.data.is_it_missing_word(input_word);

    if (is_missing_word) {
      add_found_word(input_word);
      current_mode_handler = display_handlers.normal_mode;

      display_handlers.messages.valid_word_message(control_handlers.word.get_difficulty(input_word));
      display_handlers.messages.update_missing_words_count(control_handlers.data.missing_words.length);

    } else if (input_word.length <= 3) {
      display_handlers.messages.word_too_short_message();
    } else if (control_handlers.data.words_found.find( (element) => element === input_word)) {
      display_handlers.messages.word_found_already_message();
    } else {
      display_handlers.messages.word_not_in_dictionary_message();
    }

    if (callbacks.check_word !== null) {
      callbacks.check_word(pack_callback_params(), is_missing_word);
    }

    setTimeout(() => {
      current_mode_handler.init(control_handlers.data.missing_words[0]);
      gui.clear_status_value();
      check_word.unblock();

      if (control_handlers.data.missing_words.length === 0) {
        callbacks.end(pack_callback_params());
      }
    }, 1500);
  }

  init();

  return {
    click_letter: block_decorator(click_letter),
    erase_letter: block_decorator(erase_letter),
    check_word: block_decorator(check_word),
    hint: block_decorator(hint)
  };

}

let block_decorator = (function () {
  let flag_block = false;

  function unblock() {
    flag_block = false;
  }

  return function (fn) {
    fn.unblock = unblock;
    return function () {
      if (flag_block){
        return;
      }
      flag_block = true;
      fn.apply(this, arguments);
    }
  }
})();

function setup_messages(messages_json) {
  function get_random_item(list) {
    let max_index = list.length - 1;
    let index = Math.trunc(Math.random() * max_index);
    return list[index];
  };

  function super_difficult_word_message() {
    return `${get_random_item(messages_json.author_prefix_message)} \
    ${get_random_item(messages_json.authors)} \
    ${get_random_item(messages_json.author_suffix_message)}
    `
  }

  messages_json.super_easy_word_message = get_random_item(messages_json.super_easy_word_message);
  messages_json.easy_word_message = get_random_item(messages_json.easy_word_message);
  messages_json.average_difficult_word_message = get_random_item(messages_json.average_difficult_word_message);
  messages_json.quite_difficult_word_message = get_random_item(messages_json.quite_difficult_word_message);
  messages_json.difficult_word_message = get_random_item(messages_json.difficult_word_message);
  messages_json.super_difficult_word_message = super_difficult_word_message;

  return messages_json;
}
