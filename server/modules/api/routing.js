import * as fetch from 'node-fetch';
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
   binServices.generatePuzzle(corporaBrickFilePath)
   .then( jsonPuzzle => res.send(jsonPuzzle) )
   .catch(() => {
    res.status(500);
    res.send("Sorry, an error has occured.")
   });
  }

  function puzzleFromURL(req, res) {
    let textFilepath = `${TEMP_DIR}/book.txt`;
    let brickFilepath = `${OUT_DIR}/book-brick.txt`;

    fetch(req.query.url)
      .then(response => response.text())
      .then(text => binServices.writeToTextFile(text, textFilepath))
      .then(() => binServices.exportBrick(textFilepath, brickFilepath))
      .then(() => binServices.generatePuzzle(brickFilepath))
      .then(puzzle => res.send(puzzle))
      .catch(() => {
        res.status(500);
        res.send("Sorry, an error has occured.")
      });
  }

  function puzzleFromText(req,res) {
    let textFilepath = `${TEMP_DIR}/input.txt`;
    let brickFilepath = `${OUT_DIR}/brick.txt`;

    binServices.writeToTextFile(req.query.text, textFilepath)
      .then(() => binServices.exportBrick(textFilepath, brickFilepath))
      .then(() => binServices.generatePuzzle(brickFilepath))
      .then(puzzle => res.send(puzzle))
      .catch(() => {
        res.status(500);
        res.send("Sorry, an error has occured.")
      });
  }

  return {
    puzzleFromURL,
    puzzleFromText,
    randomPuzzle
  };

}();
