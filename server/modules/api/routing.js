import * as path from 'path';

import { Stream } from 'stream';
import { fileURLToPath } from 'url';
import { binServices } from '../binary-services.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

function languageFromLanguageCode(languageCode){
  if(languageCode==="en"){
    return "english";
  }else if(languageCode==="it"){
    return "italian";
  }else{
    return "english";
  }
}

export let routing = function () {
  const ASSETS_DIR = path.resolve(PROJECT_ROOT, "assets");

  function randomPuzzle(req, res) {
    let languageCode = req.params["language"];

    let corporaBrickFilePath;
    if(languageCode=='en'){
      corporaBrickFilePath = `${ASSETS_DIR}/corpora/en.brk`;
    }else if(languageCode='it'){
      corporaBrickFilePath = `${ASSETS_DIR}/corpora/it.brk`;
    }

    binServices.generatePuzzle(
      {
        "brick_filepath": corporaBrickFilePath,
        "language": languageFromLanguageCode(languageCode)
      })
      .then(jsonPuzzle => {
        res.send(jsonPuzzle);
      })
      .catch( error => {
        console.info(error);
        res.redirect("/error/500");
      });
  }

  function puzzleFromFile(req, res) {
    let languageCode = req.params["language"];

    let input_stream = Stream.Readable.from(req.files.text_file.data.toString());
    binServices.generatePuzzle(
      {
        input_stream ,
        "language":languageFromLanguageCode(languageCode)
      })
      .then(jsonPuzzle => res.send(jsonPuzzle))
      .catch( error => {
        console.info(error);
        res.redirect("/error/500");
      });
  }

  function puzzleFromString(req, res) {
    let languageCode = req.params["language"];
    let input_stream = new Stream.Readable.from(req.body.text);

    input_stream.on('error', function(error){
      console.info(error);
      res.redirect("/error/500");
    });

    binServices.generatePuzzle(
      {
        "input_stream": input_stream,
        "language": languageFromLanguageCode(languageCode)
      })
      .then(jsonPuzzle => res.send(jsonPuzzle))
      .catch( error => {
        console.info(error);
        res.redirect("/error/500");
      });
  }

  return {
    puzzleFromFile,
    puzzleFromString,
    randomPuzzle
  };

}();
