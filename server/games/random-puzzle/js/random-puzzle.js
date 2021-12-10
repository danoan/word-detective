import { config, main } from "./main.js";
import { MissingResource,setDefaultConfiguration } from "/assets/js/game-util.js";

export async function  setupWordDetective(){
  setDefaultConfiguration(config);

  config.words_found_cookie_id = '';
  config.iso_expiration_date = '';

  config.load_assets = async function () {
    let assets = {
      "messages": null,
      "puzzle": null
    };

    let messages_json_location = "js/modules/word-detective/assets/english_messages.json";
    let puzzle_json_location = "/api/random-puzzle";

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

  try{
    return await main();
  }catch(err){
    config.fatal_error_handler(err);
  }

}
