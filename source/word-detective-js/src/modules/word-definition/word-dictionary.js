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
  function get(word) {
    return fetch(`/api/en/definition/${word}`)
      .then(response => response.json())
      .then(jsonResponse => {
        if (jsonResponse.definition) {
          return {
            word: jsonResponse.word,
            definition: jsonResponse.definition
          };
        }
        throw new Error("No definition found");
      });
  }

  return { get };
}

export function corriere() {
  function get(word) {
    return fetch(`/api/it/definition/${word}`)
      .then(response => response.json())
      .then(jsonResponse => {
        if (jsonResponse.definition) {
          return {
            word: jsonResponse.word,
            definition: jsonResponse.definition
          };
        }
        throw new Error("No definition found");
      });
  }

  return { get };
}