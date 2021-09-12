export function normal_mode_display_handler(gui) {
  function init(){
    gui.set_display_value('');
  }

  function erase_letter() {
    let current_text = gui.get_display_value();

    if (current_text.length >= 1) {
      gui.set_display_value(current_text.substring(0, current_text.length - 1));
    } else {
      gui.set_display_value('');
    }
  }

  function click_letter(letter) {
    let current_text = gui.get_display_value();

    if (current_text.length <= 30) {
      gui.set_display_value(current_text + letter);
    }
  }

  return {
    init,
    erase_letter,
    click_letter
  };
}

export function hint_mode_display_handler(gui) {
  let word_chars_pos = [];

  function replace_a_char(text, pos, new_char) {
    let replaced_text = text.substring(0, pos) + new_char;
    replaced_text += text.substring(pos + 1);
    return replaced_text;
  }

  function init(word){
    gui.set_display_value('');
    word_chars_pos = [];
    for (let i = 0; i < word.length; ++i) {
      if (i % 2 == 0) {
        gui.set_display_value( gui.get_display_value() + word[i] );
      } else {
        gui.set_display_value( gui.get_display_value() + '_' );
        word_chars_pos.push(i);
      }
    }
  }

  function erase_letter() {
    let char_pos_list = word_chars_pos;
    for (let i = char_pos_list.length - 1; i >= 0; --i) {
      let pos = char_pos_list[i];
      if (pos < 0) {
        let replaced_text = replace_a_char(gui.get_display_value(), -pos, '_');
        gui.set_display_value(replaced_text);
        word_chars_pos[i] = -pos;
        break;
      }
    }
  }

  function click_letter(letter) {
    let char_pos_list = word_chars_pos;
    for (let i = 0; i < char_pos_list.length; ++i) {
      let pos = char_pos_list[i];
      if (pos >= 0) {
        let replaced_text = replace_a_char(gui.get_display_value(), pos, letter);
        gui.set_display_value(replaced_text);
        word_chars_pos[i] = -pos;
        break;
      }
    }
  }

  return {
    init,
    erase_letter,
    click_letter
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
