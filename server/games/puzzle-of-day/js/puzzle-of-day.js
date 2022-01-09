import { cookie_manager, config, main } from "/assets/js/word-detective-min.js";
import { MissingResource, setDefaultConfiguration, DateGen,identifyPallete,updatePallete } from "/assets/js/game-util.js"

export async function setupWordDetective(){
  let language = identifyPallete();
  updatePallete(language);

  setDefaultConfiguration(config)

  let today = DateGen.generate(DateGen.DateFormula.TodayMidnight);
  let tomorrow = DateGen.generate(DateGen.DateFormula.TomorrowMidnight);

  config.words_found_cookie_id = `${today.toISOString()}_words_found`;
  config.iso_expiration_date = `${tomorrow.toISOString()}`;

  config.load_assets = async function () {
    let assets = {
      "messages": null,
      "puzzle": null
    };


    let messages_json_location = `/assets/messages/${language}/messages.json`;
    let puzzle_json_location = `/api/${language}/random-puzzle`;

    try {
      let response = await fetch(messages_json_location);
      assets.messages = await response.json();
    } catch (err) {
      throw new MissingResource("Messages file could not be loaded.", err);
    }

    try {
      let cm = cookie_manager(`${today.toISOString()}_puzzle`, config.iso_expiration_date);
      if (cm.get() !== '') {
        assets.puzzle = JSON.parse(cm.get());
      } else {
        let response = await fetch(puzzle_json_location);
        let puzzle_json = await response.json();
        assets.puzzle = puzzle_json.puzzle;
        cm.set(JSON.stringify(assets.puzzle));
      }
    } catch (err) {
      throw new MissingResource("Puzzle could not be loaded.",err);
    }

    return assets;
  };

  try{
    return await main();
  }catch(err){
    config.fatal_error_handler(err);
  }
}
