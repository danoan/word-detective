import * as _cookie_manager  from "./modules/cookie-manager.js";
import { create_WORD_DETECTIVE_api } from "./modules/word-detective/word-detective.js";

import { word_definition } from "./modules/word-definition/word-definition.js";
import { slider } from "./modules/slider/slider.js";

function gui_slider() {
  function html_objects() {
    const SLIDER_CONTAINER_ID = 'evidence-list';
    const NEXT_BUTTON_ELEMENT_ID = 'slide-next-button';

    return {
      slider_container: document.getElementById('evidence-list'),
      next_button_element: document.getElementById('slide-next-button')
    };
  }

  let gui = html_objects();

  return {
    "slider_container": gui.slider_container,
    "next_button": gui.next_button_element,
    "previous_button": null
  };

}

function gui_word_definition() {

  function html_objects() {
    const WORD_LIST_ID = 'evidence-list-words';
    const WORD_LIST_CONTAINER_ID = 'evidence-list';
    const OVERLAY_ID = 'evidence-list-overlay';

    return {
      word_list: document.getElementById(WORD_LIST_ID),
      word_list_container: document.getElementById(WORD_LIST_CONTAINER_ID),
      overlay: document.getElementById(OVERLAY_ID)
    };
  }

  let gui = html_objects();

  function display_word_list() {
    gui.word_list_container.style.display = "block";
    gui.overlay.style.display = "block";
  }

  function hide_word_list() {
    gui.word_list_container.style.display = "none";
    gui.overlay.style.display = "none";
  }

  function add_to_word_list(word, onclick) {
    let item = document.createElement("li");
    item.onclick = function () { onclick(item); };
    item.innerHTML = word;
    gui.word_list.append(item);
    return item;
  }

  return {
    display_word_list,
    hide_word_list,
    add_to_word_list
  };
}

function gui_WORD_DETECTIVE_api() {

  function html_objects() {

    const DISPLAY_TEXT_ID = 'display-text';
    const BOTTOM_STATUS_ID = 'bottom-status';
    const WORD_LIST_ID = 'words-list';
    const MISSING_WORDS_ID = 'missing-words';

    let html_obj = {
      display: document.getElementById(DISPLAY_TEXT_ID),
      status: document.getElementById(BOTTOM_STATUS_ID),
      word_list: document.getElementById(WORD_LIST_ID),
      missing_words: document.getElementById(MISSING_WORDS_ID)
    };

    return html_obj;
  }

  let gui = html_objects();

  function set_display_value(value) {
    gui.display.innerHTML = value;
  }

  function get_display_value() {
    return gui.display.innerHTML;
  }

  function clear_display_value() {
    gui.display.innerHTML = '';
  }

  function set_status_value(value) {
    gui.status.innerHTML = value;
  }

  function get_status_value(value) {
    return gui.status.innerHTML;
  }

  function clear_status_value() {
    gui.status.innerHTML = '';
  }

  function set_missing_words_value(value) {
    gui.missing_words.innerHTML = value;
  }

  function get_missing_words_value(value) {
    return gui.missing_words.innerHTML;
  }

  function clear_missing_words_value() {
    gui.missing_words.innerHTML = '';
  }

  function add_to_word_list(word) {
    let li = document.createElement('li');
    li.append(word);
    gui.word_list.appendChild(li);
  }

  function clear_word_list() {
    while (gui.word_list.childElementCount > 0) gui.word_list.removeChild(gui.word_list.childNodes[0]);
  }

  function reset(){
    clear_word_list();
  }

  return {
    set_display_value,
    get_display_value,
    clear_display_value,
    set_status_value,
    get_status_value,
    clear_status_value,
    set_missing_words_value,
    get_missing_words_value,
    clear_missing_words_value,
    add_to_word_list,
    clear_word_list,
    reset
  };
}

function set_puzzle_cookie(words_found_cookie_id, iso_expiration_date) {
  return cookie_manager(words_found_cookie_id, iso_expiration_date);
}

export let config = {
  "words_found_cookie_id": "",
  "iso_expiration_date": "",
  "onload": null,
  "load_assets": null,
  "default_error_handler": (error) => alert(error),
  "fatal_error_handler": null
};

export let cookie_manager = _cookie_manager.cookie_manager;

export function main(is_in_test_mode = false) {
  let puzzle_cookie = set_puzzle_cookie(config.words_found_cookie_id, config.iso_expiration_date);
  let WD = word_definition(gui_word_definition());
  let SD = configure_slider();

  if (config.onload !== null) {
    config.onload();
  }

  return config.load_assets()
    .then((assets) => new Promise(function (resolve) {
      let config = configure_WORD_DETECTIVE_(assets);
      let control = create_WORD_DETECTIVE_api(gui_WORD_DETECTIVE_api(), assets.messages, config);

      if (is_in_test_mode) {
        control.ephemeral = {
          gui_slider,
          gui_word_definition,
          gui_WORD_DETECTIVE_api
        };
      }

      resolve(control);

    }));

  function configure_slider() {
    let config = { "callbacks": {} };

    config.callbacks.pre_slide_left = function (current_slide_number) {
      if (current_slide_number === 0) {
        let num_slides = 5;
        SD.set_next_slide_number(num_slides - WD.num_selected_words() - 2);
      }
    };
    config.callbacks.slide_left = create_slide_left_callback();

    return slider(gui_slider(), config);
  }

  function create_slide_left_callback() {
    let word_index = 0;
    return function (slide_element, is_final_slide) {
      if (!is_final_slide) {
        let list_words = WD.get_selected_words();
        let word = list_words[word_index++];

        WD.get_word_definition(word).then(
          function (meaning_response) {
            slide_element.children[0].innerHTML = meaning_response.word;
            slide_element.children[1].innerHTML = meaning_response.definition;
          },
          function (error) { config.default_error_handler(error); }
        );
      }
    }
  }

  function configure_WORD_DETECTIVE_(assets) {
    let config = { "callbacks": {} };
    config.callbacks.check_word = save_found_words_in_cookie;
    config.callbacks.init = (control_members) => init_puzzle(assets.puzzle, control_members);
    config.callbacks.end = display_word_list;

    return config;
  }

  function init_puzzle(puzzle, control_members) {
    render_puzzle_letters(puzzle);

    for (let word of puzzle.words) {
      control_members.add_missing_word(word);
    }

    load_found_words_from_cookie(control_members);
  }

  function render_puzzle_letters(puzzle) {
    //TODO: Think about replacing this by a template strategy instead
    let i = 1;
    for (let letter of puzzle.letters) {
      let div_root = document.createElement("div");
      let div_kid = document.createElement("div");

      div_root.className = `hexagon hexagon-pos-${i}`;
      div_root.onclick = () => control.click_letter(letter);

      div_kid.className = "letter-hex";
      div_kid.innerHTML = letter;

      div_root.appendChild(div_kid);

      document.getElementById("container-hexagons").appendChild(div_root);
      i += 1;
    }
  }

  function load_found_words_from_cookie(control_members) {
    let str_words_found = puzzle_cookie.get();

    let _words_found = str_words_found.split(',');
    _words_found.forEach((word) => {
      if (word.length > 0) {
        control_members.add_found_word(word);
      }
    });
  }

  function save_found_words_in_cookie(control_members) {
    let words_found_cookie = '';

    control_members.get_words_found().forEach((word) => {
      if (word.length > 0) {
        words_found_cookie += word + ',';
      }
    });

    puzzle_cookie.set(words_found_cookie);
  }

  function display_word_list(control_members) {
    WD.display_word_list(control_members.get_words_found());
  }
}
