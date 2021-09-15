import { slider_display_handler } from "./display-handlers.js";

let default_config = {
  "callbacks": {
    "init": null,
    "pre_slide_left": null,
    "slide_left": null,
    "pre_slide_right": null,
    "slide_right": null
  }
};

export function slider(gui, config) {
  if (config === null) {
    config = default_config;
  }

  let display_handler = slider_display_handler(gui);
  let slides_containers = display_handler.get_slides_containers();
  let index_show_element = 0;

  init_slider();

  function init_slider() {
    for (let slide of slides_containers) {
      display_handler.set_html_element_as_slide(slide);
      display_handler.hide_slide(slide);
    }

    display_handler.transition_left_to_right(slides_containers[0]);
    update_button_visibility();

    if (gui.next_button !== null) {
      gui.next_button.onclick = slide_left;
    }

    if (gui.previous_button !== null) {
      gui.previous_button.onclick = slide_right;
    }

    if (config.callbacks.init) {
      config.callbacks.init();
    }
  }


  function update_button_visibility() {
    if (index_show_element === 0) {
      display_handler.hide_button(gui.previous_button);
    } else {
      display_handler.show_button(gui.previous_button);
    }

    if (index_show_element === slides_containers.length - 1) {
      display_handler.hide_button(gui.next_button);
    } else {
      display_handler.show_button(gui.next_button);
    }
  }

  function slide_left() {
    if (config.callbacks.pre_slide_left) {
      config.callbacks.pre_slide_left(index_show_element);
    }

    let next_index = index_show_element + 1;
    if (next_index >= slides_containers.length) return;

    let current_element = slides_containers[index_show_element];
    let next_element = slides_containers[next_index];

    let is_next_slide_the_last = next_index === slides_containers.length - 1;
    if (config.callbacks.slide_left) {
      config.callbacks.slide_left(next_element, is_next_slide_the_last);
    }

    display_handler.transition_right_to_left(current_element);
    display_handler.transition_left_to_right(next_element);

    index_show_element = next_index;
    update_button_visibility();
  }

  function slide_right() {
    if (config.callbacks.pre_slide_right){
      config.callbacks.pre_slide_right(index_show_element);
    }

    let next_index = index_show_element - 1;
    if (next_index < 0) return;

    let current_element = slides_containers[index_show_element];
    let previous_element = slides_containers[next_index];

    let is_previous_slide_the_first = next_index === 0;
    if (config.callbacks.slide_right){
      config.callbacks.slide_right(previous_element, is_previous_slide_the_first);
    }

    display_handler.transition_left_to_right(current_element);
    display_handler.transition_right_to_left(previous_element);

    index_show_element = next_index;
    update_button_visibility();
  }

  function set_next_slide_number(slide_number) {
    let current_element = slides_containers[index_show_element];
    display_handler.transition_right_to_left(current_element);

    index_show_element = slide_number;
  }

  return {
    slide_left,
    slide_right,
    set_next_slide_number
  };

}