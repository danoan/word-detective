export function word_flag(language) {

  let popup = null;
  let current_li = null;

  function create_popup() {
    popup = document.createElement('div');
    popup.className = 'flag-popup';
    popup.style.display = 'none';

    let text = document.createElement('span');
    text.className = 'flag-popup-text';
    text.textContent = 'Report word?';

    let btn = document.createElement('button');
    btn.className = 'flag-popup-btn';
    btn.textContent = 'Flag';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      flag_current_word();
    });

    popup.appendChild(text);
    popup.appendChild(btn);
    document.body.appendChild(popup);

    document.addEventListener('click', function () {
      hide_popup();
    });
  }

  function show_popup(word, li) {
    if (li.classList.contains('word-flagged')) {
      return;
    }

    if (!popup) {
      create_popup();
    }

    current_li = li;
    popup.dataset.word = word;

    let rect = li.getBoundingClientRect();
    popup.style.display = 'flex';
    popup.style.left = rect.left + 'px';
    popup.style.top = (rect.bottom + 4) + 'px';
  }

  function hide_popup() {
    if (popup) {
      popup.style.display = 'none';
      current_li = null;
    }
  }

  function flag_current_word() {
    let word = popup.dataset.word;
    let li = current_li;

    hide_popup();

    if (li) {
      li.classList.add('word-flagged');
    }

    fetch(`/api/${language}/flag-word/${encodeURIComponent(word)}`, {
      method: 'POST'
    })
    .then(function (response) { return response.json(); })
    .then(function (json_response) {
      console.log('[word-flag]', json_response);
    })
    .catch(function (error) {
      console.error('[word-flag] Error:', error);
    });
  }

  return {
    show_popup
  };
}
