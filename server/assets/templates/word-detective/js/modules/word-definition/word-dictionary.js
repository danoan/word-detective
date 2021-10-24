export function collins() {

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
      .then( (response) => response.text())
      .then( (html_response) => new Promise(function (resolve, reject) {
        let word_definition = extract(html_response);

        if (word_definition) {
          resolve({
            word,
            "definition": word_definition
          });
        } else {
          reject(new Error("Word not in collins dictionary"));
        }
      }));
  }

  return { get };
}