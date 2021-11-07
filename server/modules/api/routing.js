import * as path from 'path';
import { fileURLToPath } from 'url';
import { binServices } from '../binary-services.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname,"../..");

export let routing = function () {
  const TEMP_DIR=path.resolve(PROJECT_ROOT,"temp");
  const OUT_DIR=path.resolve(PROJECT_ROOT,"temp");
  const ASSETS_DIR=path.resolve(PROJECT_ROOT,"assets");

  function randomPuzzle(req,res){
   let corporaBrickFilePath = `${ASSETS_DIR}/corpora/ef-5000.brk`;
   binServices.generatePuzzle({"brick_filepath":corporaBrickFilePath})
   .then( jsonPuzzle => res.send(jsonPuzzle) )
   .catch(() => {
    res.status(500);
    res.send("Sorry, an error has occured.")
   });
  }

  function puzzleFromBook(req, res) {
    binServices.generatePuzzle({"input_stream":req})
      .then(jsonPuzzle => res.send(jsonPuzzle))
      .catch(() => {
        res.status(500);
        res.send("Sorry, an error has occured.")
      });
  }

  return {
    puzzleFromBook,
    randomPuzzle
  };

}();
