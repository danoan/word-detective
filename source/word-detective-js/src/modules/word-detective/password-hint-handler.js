export function password_hint_mode_factory(hints_map) {
  return function (gui) {
    let current_word = null;
    let hints = [];
    let current_index = 0;
    let max_revealed = 0;
    let panel = null;
    let touch_start_x = 0;

    function ensure_panel() {
      if (panel) return;

      panel = document.createElement('div');
      panel.className = 'password-hints-panel hidden';

      let prev_btn = document.createElement('button');
      prev_btn.className = 'password-hint-nav password-hint-prev';
      prev_btn.textContent = '\u2039';
      prev_btn.addEventListener('click', show_prev);

      let content = document.createElement('div');
      content.className = 'password-hint-content';

      let hint_word = document.createElement('span');
      hint_word.className = 'password-hint-word';

      let counter = document.createElement('span');
      counter.className = 'password-hint-counter';

      content.appendChild(hint_word);
      content.appendChild(counter);

      let next_btn = document.createElement('button');
      next_btn.className = 'password-hint-nav password-hint-next';
      next_btn.textContent = '\u203A';
      next_btn.addEventListener('click', show_next);

      panel.appendChild(prev_btn);
      panel.appendChild(content);
      panel.appendChild(next_btn);

      panel.addEventListener('touchstart', on_touch_start, { passive: true });
      panel.addEventListener('touchend', on_touch_end, { passive: true });

      let display_text = document.getElementById('display-text');
      display_text.parentNode.insertBefore(panel, display_text);
    }

    function on_touch_start(e) {
      touch_start_x = e.changedTouches[0].clientX;
    }

    function on_touch_end(e) {
      let delta = e.changedTouches[0].clientX - touch_start_x;
      if (Math.abs(delta) > 50) {
        if (delta < 0) {
          show_next();
        } else {
          show_prev();
        }
      }
    }

    function show_next() {
      if (current_index < hints.length - 1) {
        current_index++;
        if (current_index > max_revealed) {
          max_revealed = current_index;
        }
        render();
      }
    }

    function show_prev() {
      if (current_index > 0) {
        current_index--;
        render();
      }
    }

    function render() {
      if (!panel) return;
      let hint_word = panel.querySelector('.password-hint-word');
      let counter = panel.querySelector('.password-hint-counter');
      let prev_btn = panel.querySelector('.password-hint-prev');
      let next_btn = panel.querySelector('.password-hint-next');

      if (hints.length === 0) {
        hint_word.textContent = '---';
        counter.textContent = '';
        prev_btn.style.visibility = 'hidden';
        next_btn.style.visibility = 'hidden';
        return;
      }

      hint_word.textContent = hints[current_index];
      counter.textContent = (current_index + 1) + '/' + hints.length;
      prev_btn.style.visibility = current_index > 0 ? 'visible' : 'hidden';
      next_btn.style.visibility = current_index < hints.length - 1 ? 'visible' : 'hidden';
    }

    function init(word) {
      ensure_panel();
      current_word = word;
      current_index = 0;
      max_revealed = 0;

      if (word && hints_map[word]) {
        hints = hints_map[word];
      } else {
        hints = [];
      }

      panel.classList.remove('hidden');
      render();
      gui.set_display_value('');
    }

    function click_letter(letter) {
      let current_text = gui.get_display_value();
      if (current_text.length <= 30) {
        current_text += letter;
      }
      gui.set_display_value(current_text);
    }

    function erase_letter() {
      let current_text = gui.get_display_value();
      if (current_text.length >= 1) {
        gui.set_display_value(current_text.substring(0, current_text.length - 1));
      } else {
        gui.set_display_value('');
      }
    }

    function get_user_input_word() {
      return gui.get_display_value();
    }

    function reset() {
      if (panel) {
        panel.classList.add('hidden');
      }
    }

    return {
      init,
      click_letter,
      erase_letter,
      get_user_input_word,
      reset
    };
  };
}
