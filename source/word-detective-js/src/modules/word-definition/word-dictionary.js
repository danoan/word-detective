export function chatgpt(languageCode) {
  function get(word) {
    return fetch(`/api/${languageCode}/definition-chatgpt/${word}`)
      .then(response => response.json())
      .then(jsonResponse => new Promise((resolve, reject) => {
        if (jsonResponse.definition) {
          resolve({
            word: jsonResponse.word,
            definition: jsonResponse.definition
          });
        } else {
          reject(new Error("ChatGPT dictionary failed"));
        }
      }));
  }
  return { get };
}

export function collins() {
  const fallback = chatgpt("en");

  function extract(collins_html) {
    //Removing new line characters
    let res = collins_html.replaceAll(/\n/g, '');

    //Include new line characters after every div element
    res = res.replaceAll(/<\/div>/g, '</div>/\n');

    //Look for the div definition
    let reg = /<div class="def">.*<\/div>/;
    let x = reg.exec(res);

    if (x.length === 0) {
      // console.log("Error while processing div definition");
      return '';
    } else {
      //Remove html elements
      let definition = x[0].replaceAll(/<.*?>/g, '');
      return definition;
    }
  }

  function get(word) {
    return fetch(`https://www.collinsdictionary.com/dictionary/english/${word}`)
      .then((response) => response.text())
      .then((html_response) => {
        let word_definition = extract(html_response);

        if (word_definition) {
          return {
            word,
            "definition": word_definition
          };
        }
        // Fallback to ChatGPT
        return fallback.get(word);
      })
      .catch(() => fallback.get(word));
  }

  return { get };
}

export function corriere() {
  const fallback = chatgpt("it");

  function get(word) {
    return fetch(`/api/it/definition/${word}`)
      .then((response) => response.text())
      .then((text_response) => {
        if (text_response && text_response.trim()) {
          return {
            word,
            "definition": text_response
          };
        }
        // Fallback to ChatGPT
        return fallback.get(word);
      })
      .catch(() => fallback.get(word));
  }

  return { get };
}