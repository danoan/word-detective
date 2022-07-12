import { cookie_manager, config, main } from "/assets/js/word-detective-min.js";
import { MissingResource, setDefaultConfiguration, DateGen,identifyLanguage } from "/assets/js/game-util.js"

export async function setupWordDetective(puzzle_id,cookie_unique_id,expiration_date){
  let language = identifyLanguage();

  setDefaultConfiguration(config);

  config.words_found_cookie_id = `${puzzle_id}_${language}_words_found_${cookie_unique_id}`;
  config.iso_expiration_date = expiration_date;
  config.language = language;

  let flagImageName;
  if(language==="pt") {
    flagImageName = "brazil";
  }else if(language==="en") {
    flagImageName = "usa";
  }else if(language==="it") {
    flagImageName = "italy";
  }else {
    flagImageName = "usa";
  }
  document.getElementById("image-flag").style.backgroundImage = `url(/assets/icons/${flagImageName}.png)`;

  config.load_assets = async function () {
    let assets = {
      "messages": null,
      "puzzle": null
    };

    let messages_json_location = `/assets/messages/${language}/messages.json`;
    let puzzle_json_location = `assets/puzzle.json`;

    try {
      let response = await fetch(messages_json_location);
      assets.messages = await response.json();
    } catch (err) {
      throw new MissingResource("Messages file could not be loaded.", err);
    }

    try {
      let response = await fetch(puzzle_json_location);
      let puzzle_json = await response.json();
      assets.puzzle = puzzle_json.puzzle;
    } catch (err) {
      throw new MissingResource("Puzzle could not be loaded.", err);
    }

    return assets;
  };

  config.onload = function () {
    if (should_redirect_to_today_puzzle(language)) {
      window.location.href = `/games/${language}/week-puzzles/`;
    }
  };

  try{
    return await main();
  }catch(err){
    config.fatal_error_handler(err);
  }
}

function should_redirect_to_today_puzzle(language) {
  let ten_minutes_expire = DateGen.generate(DateGen.DateFormula.TenMinutesFromNow);

  let cm = cookie_manager(`${language}_recently_accessed`, ten_minutes_expire);

  if (cm.get() === '') {
    cm.set(`${language}_recently_visited`);
    return true;
  } else {
    return false;
  }
}
