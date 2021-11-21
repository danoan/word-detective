import * as path from 'path';

import { Stream } from 'stream';
import { fileURLToPath } from 'url';
import { binServices } from '../binary-services.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

export let routing = function () {
  const ASSETS_DIR = path.resolve(PROJECT_ROOT, "assets");

  function randomPuzzle(req, res) {
    let corporaBrickFilePath = `${ASSETS_DIR}/corpora/ef-5000.brk`;
    binServices.generatePuzzle({ "brick_filepath": corporaBrickFilePath })
      .then(jsonPuzzle => {
        res.send(jsonPuzzle);
      })
      .catch( error => {
        console.info(error);
        res.redirect("/error/500");
      });
  }

  function puzzleFromFile(req, res) {
    let input_stream = Stream.Readable.from(req.files.text_file.data.toString());
    binServices.generatePuzzle({ input_stream })
      .then(jsonPuzzle => res.send(jsonPuzzle))
      .catch( error => {
        console.info(error);
        res.redirect("/error/500");
      });
  }

  function puzzleFromString(req, res) {
    let input_stream = new Stream.Readable({ read() { } });
    input_stream.push(req.body.text);
    input_stream.push(null); //signal the end of the input.
    input_stream.on('error', function(error){
      console.info(error);
      res.redirect("/error/500");
    });

    binServices.generatePuzzle({ "input_stream": input_stream })
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
