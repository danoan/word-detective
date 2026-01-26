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
  }else if(languageCode==="fr"){
    return "french";
  }else if(languageCode==="pt"){
    return "portuguese";
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
    }else if(languageCode=='it'){
      corporaBrickFilePath = `${PROJECT_ROOT}/word-sources-folder/italian/it-7K/it-7K.brk`;
    }else if(languageCode=='fr'){
      corporaBrickFilePath = `${PROJECT_ROOT}/word-sources-folder/french/fr-5K/fr-5K.brk`;
    }else if(languageCode=='pt'){
      corporaBrickFilePath = `${PROJECT_ROOT}/word-sources-folder/portuguese/pt-5K/pt-5K.brk`;
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
      }else if(languageCode=='fr'){
        definition = await binServices.chatgptDictionary(word, languageCode);
      }else if(languageCode=='pt'){
        definition = await binServices.chatgptDictionary(word, languageCode);
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
    }else if(languageCode=='it'){
      word_source_name = `it-7K`;
    }else if(languageCode=='fr'){
      word_source_name = `fr-5K`;
    }else if(languageCode=='pt'){
      word_source_name = `pt-5K`;
    }

    try {
      let json_text_response = await binServices.requestWord(word_source_name,word);
      res.send(json_text_response);
    }catch (err){
      res.redirect('/error/500')
    }
  }

  async function chatgptWordDefinition(req, res) {
    let languageCode = req.params["language"];
    let word = req.params["word"];

    try {
      let definition = await binServices.chatgptDictionary(word, languageCode);
      res.send(definition);
    } catch {
      res.status(500).json({ error: "ChatGPT dictionary failed" });
    }
  }

  return {
    puzzleFromFile,
    puzzleFromString,
    randomPuzzle,
    wordDefinition,
    requestWord,
    chatgptWordDefinition
  };

}();
