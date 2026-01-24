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
      corporaBrickFilePath = `${PROJECT_ROOT}/word-sources-folder/english/en-5K/en-5K.brk`;
    }else if(languageCode='it'){
      corporaBrickFilePath = `${PROJECT_ROOT}/word-sources-folder/italian/it-1K/it-1K.brk`;
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

  async function wordDefinition(req,res){
    let languageCode = req.params["language"];
    let word = req.params["word"];
    let definition;

    try{
      if(languageCode=='en'){
        definition = await binServices.englishDictionary(word);
      }else if(languageCode=='it'){
        definition = await binServices.italianDictionary(word);
      }else{
        res.redirect('/error/500');
      }
    }catch{
      res.redirect('/error/500');
    }

    res.send(definition);
  }

  async function requestWord(req,res){
    let languageCode = req.params["language"];
    let word = req.params["word"];

    let word_source_name = null;
    if(languageCode=='en'){
      word_source_name = `en-5K`;
    }else if(languageCode='it'){
      word_source_name = `it-1K`;
    }

    try {
      let json_text_response = await binServices.requestWord(word_source_name,word);
      res.send(json_text_response);
    }catch (err){
      res.redirect('/error/500')
    }
  }

  return {
    puzzleFromFile,
    puzzleFromString,
    randomPuzzle,
    wordDefinition,
    requestWord
  };

}();
