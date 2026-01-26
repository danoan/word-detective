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