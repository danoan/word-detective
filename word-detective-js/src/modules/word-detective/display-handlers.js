export function normal_mode_display_handler(gui) {
  let display_text = '';

  function init(){
    display_text = '';
    gui.set_display_value(display_text);
  }

  function erase_letter() {
    let current_text = display_text;

    if (current_text.length >= 1) {
      display_text = current_text.substring(0, current_text.length - 1);
    } else {
      display_text = '';
    }
    gui.set_display_value(display_text);
  }

  function click_letter(letter) {
    if (display_text.length <= 30) {
      display_text += letter;
    }
    gui.set_display_value(display_text);
  }

  function get_user_input_word(){
    return gui.get_display_value();
  }

  function reset(){}

  return {
    init,
    erase_letter,
    click_letter,
    get_user_input_word,
    reset
  };
}

function default_hint_mode(gui) {
  let word_chars_pos = [];
  let display_text = '';

  function replace_a_char(text, pos, new_char) {
    let replaced_text = text.substring(0, pos) + new_char;
    replaced_text += text.substring(pos + 1);
    return replaced_text;
  }

  function init(word){
    display_text = '';
    word_chars_pos = [];
    for (let i = 0; i < word.length; ++i) {
      if (i % 2 === 0) {
        display_text += word[i];
      } else {
        display_text += '_';
        word_chars_pos.push(i);
      }
    }
    gui.set_display_value(display_text);
  }

  function erase_letter() {
    let char_pos_list = word_chars_pos;
    for (let i = char_pos_list.length - 1; i >= 0; --i) {
      let pos = char_pos_list[i];
      if (pos < 0) {
        display_text = replace_a_char(display_text, -pos, '_');
        word_chars_pos[i] = -pos;
        break;
      }
    }
    gui.set_display_value(display_text);
  }

  function click_letter(letter) {
    let char_pos_list = word_chars_pos;
    for (let i = 0; i < char_pos_list.length; ++i) {
      let pos = char_pos_list[i];
      if (pos >= 0) {
        display_text = replace_a_char(display_text, pos, letter);
        word_chars_pos[i] = -pos;
        break;
      }
    }
    gui.set_display_value(display_text);
  }

  function get_user_input_word(){
    return display_text;
  }

  function reset(){}

  return {
    init,
    erase_letter,
    click_letter,
    get_user_input_word,
    reset
  };
}

export function hint_mode_display_handler(gui) {
  let hint_handlers = [default_hint_mode(gui)];
  let current_index = 0;

  function current_handler(){
    return hint_handlers[current_index];
  }

  function init(word){
    return current_handler().init(word);
  }

  function erase_letter(){
    return current_handler().erase_letter();
  }

  function click_letter(letter){
    return current_handler().click_letter(letter);
  }

  function get_user_input_word(){
    return current_handler().get_user_input_word();
  }

  function next_handler(){
    current_index = (current_index+1);
    if(current_index==hint_handlers.length){
      current_index=0;
      return false;
    }else{
      return true;
    }
  }

  function add_hint_handler(handler){
    hint_handlers.push(handler(gui));
  }

  function reset(){
    current_index=0;
  }

  return {
    init,
    erase_letter,
    click_letter,
    get_user_input_word,
    next_handler,
    add_hint_handler,
    reset
  };
}

export function messages_display_handler(gui,messages) {

  function update_missing_words_count(new_count) {
    gui.set_missing_words_value(`${messages.missing_words_prefix} ${new_count}`);
  }

  function valid_word_message(word_difficulty) {
    switch (word_difficulty) {
      case 'super-easy':
        gui.set_status_value(`${messages.super_easy_word_message}`);
        break;
      case 'easy':
        gui.set_status_value(`${messages.easy_word_message}`);
        break;
      case 'average':
        gui.set_status_value(`${messages.average_difficult_word_message}`);
        break;
      case 'quite-difficult':
        gui.set_status_value(`${messages.quite_difficult_word_message}`);
        break;
      case 'difficult':
        gui.set_status_value(`${messages.difficult_word_message}`);
        break;
      case 'super-difficult':
        gui.set_status_value(`${messages.super_difficult_word_message()}`);
        break;
      default:
        gui.set_status_value(`${messages.valid_word_message}`);
    }
  }

  function word_found_already_message() {
    gui.set_status_value(`${messages.word_found_already_message}`);
  }

  function word_too_short_message() {
    gui.set_status_value(`${messages.word_too_short_message}`);
  }

  function word_not_in_dictionary_message() {
    gui.set_status_value(`${messages.word_not_in_dictionary_message}`);
  }

  return{
    update_missing_words_count,
    valid_word_message,
    word_found_already_message,
    word_too_short_message,
    word_not_in_dictionary_message
  };

}
