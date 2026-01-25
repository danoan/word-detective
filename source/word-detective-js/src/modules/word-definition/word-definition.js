import { corriere,collins,chatgpt } from "./word-dictionary.js";
import { select_word_handler } from "./display-handlers.js";

export function word_definition(language,gui) {
  let display_handler = select_word_handler(gui);
  let selected_words = { length: 0 };

  let dictionary;
  if(language==="it"){
    dictionary = corriere();
  }else if(language==="fr"){
    dictionary = chatgpt("fr");
  }else if(language==="pt"){
    dictionary = chatgpt("pt");
  }else{
    dictionary = collins();
  }


  function display_word_list(list_words) {
    display_handler.show_word_list(list_words, select_word);
  }

  function select_word(li_element) {
    if (display_handler.is_selected(li_element)) {
      display_handler.unselect(li_element);
      delete selected_words[li_element.innerHTML];
      selected_words.length--;
    } else {
      if (selected_words.length < 3) {
        display_handler.select(li_element);

        selected_words[li_element.innerHTML] = true;
        selected_words.length++;
      }
    }
  }

  function get_word_definition(word) {
    return dictionary.get(word);
  }

  function get_selected_words() {
    let list_words = [];
    for (let key in selected_words) {
      if (key !== "length") {
        list_words.push(key);
      }
    }
    return list_words;
  }

  function num_selected_words() {
    return selected_words.length;
  }


  return {
    display_word_list,
    select_word,
    get_word_definition,
    get_selected_words,
    num_selected_words
  };

}