import { cookie_manager, config, main } from "/assets/js/word-detective-min.js";
import { NoPuzzleGenerated, MissingResource, setDefaultConfiguration, DateGen } from "/assets/js/game-util.js"

export async function setupWordDetective(reset_cookie=false,text='',text_checksum=''){
  setDefaultConfiguration(config);

  config.onload = function () {
    let div_hexagons = document.getElementById("container-hexagons");
    while (div_hexagons.childElementCount > 0) div_hexagons.removeChild(div_hexagons.childNodes[0]);
  };

  let next_year = DateGen.generate(DateGen.DateFormula.OneYearFromNow);

  config.words_found_cookie_id = `puzzle_from_text_${text_checksum}_words_found`;
  config.iso_expiration_date = next_year.toISOString();

  config.load_assets = () => load_assets(reset_cookie,text,text_checksum);

  try{
    return await main();
  }catch(err){
    config.fatal_error_handler(err);
  }
}

async function load_assets(reset_cookie,text,text_checksum) {
  let cm = cookie_manager(`puzzle_from_text_${text_checksum}_puzzle`, config.iso_expiration_date);
  let cm_words_found = cookie_manager(config.words_found_cookie_id, config.iso_expiration_date);

  let assets = {
    "messages": null,
    "puzzle": null
  };

  let messages_json_location = "/assets/js/english_messages.json";

  try {
    let response = await fetch(messages_json_location);
    assets.messages = await response.json();
  } catch (err) {
    throw new MissingResource("Messages file could not be loaded.", err);
  }

  try {
    if (reset_cookie || cm.get() === '') {
      assets.puzzle = await getPuzzle(text);

      cm_words_found.set('');
      cm.set(JSON.stringify(assets.puzzle));
    } else {
      assets.puzzle = JSON.parse(cm.get());
    }
  } catch (err) {
    throw new MissingResource("Puzzle could not be loaded.", err);
  }

  return assets;
}

function getPuzzle(text) {
  const formData = new FormData();
  formData.append('text_file', new Blob([text]));

  return fetch('/api/puzzle-from-file', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: formData // body data type must match "Content-Type" header
  })
    .then(response => response.json())
    .then(puzzleJson => new Promise(function (resolve, error) {
      if ('puzzle' in puzzleJson) {
        resolve(puzzleJson.puzzle);
      } else {
        error(new NoPuzzleGenerated("The input text is too short and there is no puzzle inside. Try with a longer text."));
      }
    }));
}
