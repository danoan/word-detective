export function word_request(language,gui) {

  function request_word(word) {

    gui.request_word_mode();
    gui.show_request_word_bar(word);
    gui.requested_word.onclick = request_word_internal;

    let click_event = false;

    setTimeout(() => {
      if(click_event===false) {
        gui.requested_word.onclick = null;
        gui.hide_request_word_bar();
      }
    }, 5000);

    function request_word_internal() {
      click_event = true;

      gui.requested_word.onclick = null;
      gui.success_message_mode();

      setTimeout(() => {
        gui.hide_request_word_bar();
      }, 1500);

      return fetch(`/api/${language}/request-word/${word}`)
      .then( (response) => response.json())
      .then( (json_response) => new Promise(function (resolve, reject) {
        console.log(json_response);
        if (json_response.Success===true) {
          resolve(json_response);
        } else {
          reject(new Error("The word could not be requested."));
        }
      }));
    }
  }

  return {
    request_word
  };
}
