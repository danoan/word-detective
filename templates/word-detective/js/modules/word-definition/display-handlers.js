export function select_word_handler(gui){
  const CSS_CLASS_WORD_SELECTED = 'word-selected';
  const CSS_CLASS_WORD_UNSELECTED = 'word-unselected';

  function show_word_list(list_words, select_word_fn) {
    for (let word of list_words) {
      let li_item = gui.add_to_word_list( word,select_word_fn );
      unselect(li_item);
    }

    gui.display_word_list();
  }

  function is_selected(li_element){
    return li_element.classList.contains(CSS_CLASS_WORD_SELECTED);
  }

  function unselect(li_element){
    li_element.classList.remove(CSS_CLASS_WORD_SELECTED);
    li_element.classList.add(CSS_CLASS_WORD_UNSELECTED);
  }

  function select(li_element){
    li_element.classList.remove(CSS_CLASS_WORD_UNSELECTED);
    li_element.classList.add(CSS_CLASS_WORD_SELECTED);
  }

  return {
    show_word_list,
    is_selected,
    unselect,
    select
  };
}