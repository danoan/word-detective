export function slider_display_handler(gui) {
  const SLIDE_CLASS = 'slide';
  const SLIDE_HIDDEN_RIGHT_CLASS = 'slide-hidden-right';
  const SLIDE_HIDDEN_LEFT_CLASS = 'slide-hidden-left';
  const SLIDE_VISIBLE_CLASS = 'slide-show';
  const VISIBLE_BUTTON_CLASS = 'visible-button';
  const HIDDEN_BUTTON_CLASS = 'hidden-button';

  let slides_containers = [];

  for (let element of gui.slider_container.children) {
    if (element.classList.contains(SLIDE_CLASS)) {
      slides_containers.push(element);
    }
  }


  function set_html_element_as_slide(html_element) {
    html_element.classList.add(SLIDE_CLASS);
  }

  function hide_slide(html_element) {
    html_element.classList.add(SLIDE_HIDDEN_RIGHT_CLASS);
  }

  function transition_left_to_right(slide) {
    toogle_class(slide, SLIDE_HIDDEN_RIGHT_CLASS, SLIDE_VISIBLE_CLASS);
  }

  function transition_right_to_left(slide) {
    toogle_class(slide, SLIDE_VISIBLE_CLASS, SLIDE_HIDDEN_LEFT_CLASS);
  }

  function toogle_class(element, class_remove, class_add) {
    element.classList.remove(class_remove);
    element.classList.add(class_add);
  }

  function hide_button(button_element) {
    if (button_element !== null) {
      toogle_class(button_element, VISIBLE_BUTTON_CLASS, HIDDEN_BUTTON_CLASS);
    }
  }

  function show_button(button_element) {
    if (button_element !== null) {
      toogle_class(button_element, HIDDEN_BUTTON_CLASS, VISIBLE_BUTTON_CLASS);
    }
  }

  return {
    get_slides_containers: () => slides_containers,
    set_html_element_as_slide,
    hide_slide,
    transition_left_to_right,
    transition_right_to_left,
    hide_button,
    show_button
  };

}