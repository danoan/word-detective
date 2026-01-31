export function word_control_handler() {
  function dict_of_repeated_letters(word) {
    let dict = {};
    for (let c of word) {
      if (c in dict) {
        dict[c] += 1;
      } else {
        dict[c] = 0;
      }
    }

    return dict;
  }

  function get_difficulty(word) {
    let length = word.length;
    let number_repeated_letters = 0;

    let dict = dict_of_repeated_letters(word);
    for (let c in dict) {
      number_repeated_letters += dict[c];
    }

    if (length === 4 && number_repeated_letters === 0) {
      return 'super-easy';
    } else if (length === 4 && number_repeated_letters > 0) {
      return 'easy';
    } else if (length === 5 && number_repeated_letters === 0) {
      return 'easy';
    } else if (length === 5 && number_repeated_letters === 1) {
      return 'average';
    } else if (length === 6 && number_repeated_letters === 0) {
      return 'easy';
    } else if (length === 6 && number_repeated_letters === 1) {
      return 'average';
    } else if (length === 6 && number_repeated_letters > 1) {
      return 'quite-difficult';
    } else if (length === 7 && number_repeated_letters === 0) {
      return 'quite-difficult';
    } else if (length === 7 && number_repeated_letters === 1) {
      return 'difficult';
    } else if (length === 7 && number_repeated_letters === 2) {
      return 'difficult';
    } else if (length === 7 && number_repeated_letters > 2) {
      return 'super-difficult';
    } else if (number_repeated_letters >= 3) {
      return 'super-difficult';
    } else {
      return 'quite-difficult';
    }
  }

  return {
    get_difficulty
  };
}

export function data_control_handler(){
  let missing_words = [];
  let words_found = [];
  let words_revealed = new Set();

  function add_found_word(word) {
    words_found.push(word);
    missing_words.splice(missing_words.indexOf(word), 1);
  }

  function add_missing_word(word) {
    missing_words.push(word);
  }

  function is_it_missing_word(input_word){
    for (let word of missing_words) {
      if (word === input_word) {
        return true;
      }
    }
    return false;
  }

  function mark_as_revealed(word) {
    words_revealed.add(word);
  }

  function is_revealed(word) {
    return words_revealed.has(word);
  }

  return {
    missing_words,
    words_found,
    words_revealed,
    add_found_word,
    add_missing_word,
    is_it_missing_word,
    mark_as_revealed,
    is_revealed
  };
}