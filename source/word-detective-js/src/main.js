import * as _cookie_manager  from "./modules/cookie-manager.js";
import { create_WORD_DETECTIVE_api } from "./modules/word-detective/word-detective.js";

import { word_definition } from "./modules/word-definition/word-definition.js";
import { slider } from "./modules/slider/slider.js";
import { word_request } from "./modules/word-request/word-request.js";

function gui_request_word() {
  const SHOW_NOTIFICATION_BAR_ANIMATION_NAME = 'show-notification-bar';
  const HIDE_NOTIFICATION_BAR_ANIMATION_NAME = 'hide-notification-bar';

  function html_objects() {
    const REQUESTED_WORD_ID = 'requested-word';
    const REQUEST_WORD_CONTAINER_ID = 'container-request-word';
    const NOTIFICATION_BAR_CONTAINER_ID = 'container-notification-bar';
    const REQUEST_WORD_SUCCESS_MESSAGE_ID = 'container-request-word-success-message';

    return {
      requested_word : document.getElementById(REQUESTED_WORD_ID),
      request_word_container : document.getElementById(REQUEST_WORD_CONTAINER_ID),
      notification_bar : document.getElementById(NOTIFICATION_BAR_CONTAINER_ID),
      success_message: document.getElementById(REQUEST_WORD_SUCCESS_MESSAGE_ID)
    };
  }

  let gui = html_objects();

  function show_request_word_bar(word) {
    gui.requested_word.innerHTML = word;
    gui.notification_bar.style.animationName = SHOW_NOTIFICATION_BAR_ANIMATION_NAME;
    gui.notification_bar.style.animationDuration = "1s";
    gui.notification_bar.style.animationFillMode = "forwards";
  }

  function hide_request_word_bar() {
    gui.notification_bar.style.animationName = HIDE_NOTIFICATION_BAR_ANIMATION_NAME;
    gui.notification_bar.style.animationDuration = "1s";
    gui.notification_bar.style.animationFillMode = "forwards";
  }

  function success_message_mode() {
    gui.notification_bar.style.display = "block";
    gui.success_message.style.display = "block";
    gui.request_word_container.style.display = "none";
  }

  function request_word_mode() {
    gui.notification_bar.style.display = "block";
    gui.success_message.style.display = "none";
    gui.request_word_container.style.display = "block";
  }

  return {
    show_request_word_bar,
    hide_request_word_bar,
    success_message_mode,
    request_word_mode,
    'requested_word':gui.requested_word
  };

}

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

  function set_display_value(value,color=null) {
    clear_display_value();
    append_display_value(value,color);
  }

  function append_display_value(value,color=null) {
    let span_color = document.createElement('span');
    if(color){
      span_color.style.color = color;
    }
    span_color.innerHTML = value;
    gui.display.appendChild(span_color);
  }

  function get_display_value() {
    if (gui.display.childElementCount >0) {
      return gui.display.children[0].innerHTML;
    }
    return "";
  }

  function clear_display_value() {
    while(gui.display.childElementCount>0) gui.display.removeChild(gui.display.children[0]);
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
    li.style.animationName="new-word";
    li.style.animationDuration="0.5s";

    if(gui.word_list.childNodes.length>0){
      gui.word_list.insertBefore(li,gui.word_list.childNodes[0]);
    }else{
      gui.word_list.append(li);
    }

  }

  function clear_word_list() {
    while (gui.word_list.childElementCount > 0) gui.word_list.removeChild(gui.word_list.childNodes[0]);
  }

  function reset(){
    clear_word_list();
  }

  return {
    set_display_value,
    append_display_value,
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
  "fatal_error_handler": null,
  "language":"en",
  "enable_word_request":true
};

export let cookie_manager = _cookie_manager.cookie_manager;

export function main(is_in_test_mode = false) {
  let puzzle_cookie = set_puzzle_cookie(config.words_found_cookie_id, config.iso_expiration_date);
  let WD = configure_word_definition();
  let SD = configure_slider();
  let WR = null;
  if (config.enable_word_request){
    WR=configure_word_request();
  }

  if (config.onload !== null) {
    config.onload();
  }

  return config.load_assets()
    .then((assets) => new Promise(function (resolve) {
      let control = configure_WORD_DETECTIVE(assets);

      if (is_in_test_mode) {
        control.ephemeral = {
          gui_slider,
          gui_word_definition,
          gui_WORD_DETECTIVE_api
        };
      }

      resolve(control);

    }));

  function configure_word_definition() {
    return word_definition(config.language,gui_word_definition());
  }

  function configure_slider() {
    let slider_config = { "callbacks": {} };

    slider_config.callbacks.pre_slide_left = function (current_slide_number) {
      if (current_slide_number === 0) {
        let num_slides = 5;
        SD.set_next_slide_number(num_slides - WD.num_selected_words() - 2);
      }
    };
    slider_config.callbacks.slide_left = create_slide_left_callback();

    return slider(gui_slider(), slider_config);

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
  }

  function configure_word_request() {
    return word_request(config.language,gui_request_word());
  }

  function configure_WORD_DETECTIVE(assets) {
    let word_detective_config = { "callbacks": {} };
    word_detective_config.callbacks.check_word = check_word_callback;
    word_detective_config.callbacks.init = (init_callback_parameters) => init_puzzle(assets.puzzle, init_callback_parameters);
    word_detective_config.callbacks.end = display_word_list;

    return create_WORD_DETECTIVE_api(gui_WORD_DETECTIVE_api(), assets.messages, word_detective_config);

    function check_word_callback(check_word_callback_parameters) {
      save_found_words_in_cookie(check_word_callback_parameters.get_words_found);

      if(check_word_callback_parameters.callback_status === check_word_callback_parameters.callback_status_values.UNRECOGNIZED_WORD ){
        if (WR !== null) {
          WR.request_word(check_word_callback_parameters.word);
        }
      }
    }

    function save_found_words_in_cookie(get_words_found_function) {
      let words_found_cookie = '';

      get_words_found_function().forEach((word) => {
        if (word.length > 0) {
          words_found_cookie += word + ',';
        }
      });

      puzzle_cookie.set(words_found_cookie);
    }

    function init_puzzle(puzzle, control_members) {
      render_puzzle_letters(puzzle);

      for (let word of puzzle.words) {
        control_members.add_missing_word(word);
      }

      load_found_words_from_cookie(control_members);
    }

    function display_word_list(control_members) {
      WD.display_word_list(control_members.get_words_found());
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
  }

}
