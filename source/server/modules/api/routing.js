import * as path from 'path';

import { Stream } from 'stream';
import { fileURLToPath } from 'url';
import { readFile, appendFile } from 'fs/promises';
import { binServices } from '../binary-services.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_PATH = path.resolve(PROJECT_ROOT, "assets/config/active-corpora.json");

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

  async function loadActiveConfig() {
    try {
      const data = await readFile(CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {
        "en": { "wordSource": "en-5K" },
        "it": { "wordSource": "it-7K" },
        "fr": { "wordSource": "fr-5K" },
        "pt": { "wordSource": "pt-5K" }
      };
    }
  }

  function parseWordSourceList(listResult) {
    // The word-source-manager returns JSON: {"Success": true, "Message": "..."}
    // The actual list is inside the Message field
    let messageContent = listResult;

    try {
      const jsonResponse = JSON.parse(listResult);
      if (jsonResponse.Message) {
        messageContent = jsonResponse.Message;
      }
    } catch (e) {
      // If not JSON, use as-is (backward compatibility)
    }

    const entries = messageContent.trim().split('\n\n');
    const sources = [];

    for (const entry of entries) {
      if (!entry.trim()) continue;

      const lines = entry.trim().split('\n');
      const source = {};

      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();

        if (key === 'name') source.name = value;
        else if (key === 'language') source.language = value;
        else if (key === 'text-filepath') source.textFilepath = value;
        else if (key === 'brick-filepath') source.brickFilepath = value;
      }

      if (source.name) {
        sources.push(source);
      }
    }

    return sources;
  }

  async function randomPuzzle(req, res) {
    let languageCode = req.params["language"];

    try {
      const activeConfig = await loadActiveConfig();
      const activeSourceName = activeConfig[languageCode]?.wordSource;

      if (!activeSourceName) {
        console.error(`[randomPuzzle] No active corpus configured for language: ${languageCode}`);
        return res.redirect("/error/500");
      }

      const listResult = await binServices.wordSourceManagerList();
      const sources = parseWordSourceList(listResult);
      const source = sources.find(s => s.name === activeSourceName);

      if (!source || !source.brickFilepath) {
        console.error(`[randomPuzzle] Corpus "${activeSourceName}" not found or missing brick file`);
        return res.redirect("/error/500");
      }

      const jsonPuzzle = await binServices.generatePuzzle({
        "brick_filepath": source.brickFilepath,
        "language": languageFromLanguageCode(languageCode)
      });

      res.send(jsonPuzzle);
    } catch (error) {
      console.error("[randomPuzzle] Error:", error);
      res.redirect("/error/500");
    }
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

    try {
      const activeConfig = await loadActiveConfig();
      const word_source_name = activeConfig[languageCode]?.wordSource;

      if (!word_source_name) {
        console.error(`[requestWord] No active corpus configured for language: ${languageCode}`);
        return res.redirect('/error/500');
      }

      let json_text_response = await binServices.requestWord(word_source_name, word);
      res.send(json_text_response);
    } catch (err) {
      console.error("[requestWord] Error:", err);
      res.redirect('/error/500');
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

  async function flagWord(req, res) {
    let languageCode = req.params["language"];
    let word = req.params["word"];

    try {
      const activeConfig = await loadActiveConfig();
      const activeSourceName = activeConfig[languageCode]?.wordSource;

      if (!activeSourceName) {
        console.error(`[flagWord] No active corpus configured for language: ${languageCode}`);
        return res.status(500).json({ Success: false, Message: "No active corpus configured." });
      }

      const listResult = await binServices.wordSourceManagerList();
      const sources = parseWordSourceList(listResult);
      const source = sources.find(s => s.name === activeSourceName);

      if (!source || !source.textFilepath) {
        console.error(`[flagWord] Corpus "${activeSourceName}" not found`);
        return res.status(500).json({ Success: false, Message: "Corpus not found." });
      }

      const flaggedWordsPath = path.join(path.dirname(source.textFilepath), 'flagged_words.txt');
      await appendFile(flaggedWordsPath, word + '\n');

      res.json({ Success: true, Message: `Word "${word}" flagged.` });
    } catch (err) {
      console.error("[flagWord] Error:", err);
      res.status(500).json({ Success: false, Message: "Failed to flag word." });
    }
  }

  return {
    puzzleFromFile,
    puzzleFromString,
    randomPuzzle,
    wordDefinition,
    requestWord,
    chatgptWordDefinition,
    flagWord
  };

}();
