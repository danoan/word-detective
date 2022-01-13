import express from 'express';
import * as path from 'path';
import fs from 'fs'
import { fileURLToPath } from 'url';
import { routing } from './routing.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const GAMES_DIR = path.resolve(PROJECT_ROOT, "games");
const ASSETS_DIR = path.resolve(PROJECT_ROOT, "assets");
const LANGUAGES=["en","it","pt"];

export let games = express.Router();

function notAvailableLanguageRedirection(res){
  res.redirect("/error/language-not-available");
}

function render(req,res,path_to_ntl){
  let language = req.params["language"];
  let path_to_interface_messages = `messages/${language}/interface.json` ;
  fs.readFile(path.resolve(ASSETS_DIR, path_to_interface_messages), function(err,data){
    if(err) console.info(err);
    let interface_messages = JSON.parse(data);

    let vars = { "vars": interface_messages };
    res.render(path.resolve(GAMES_DIR, path_to_ntl),vars);
  });
}

function check_language_and_go(language,go_function,error_function){
  if(!LANGUAGES.includes(language)){
    error_function();
  }else{
    go_function();
  }
}

games.get('/:language/random-puzzle', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,"random-puzzle/index.ntl"),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.use("/:language/random-puzzle", express.static(`${GAMES_DIR}/random-puzzle`));

games.get('/:language/puzzle-of-day', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,"puzzle-of-day/index.ntl"),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.use("/:language/puzzle-of-day", express.static(`${GAMES_DIR}/puzzle-of-day`));

games.get('/:language/week-puzzles', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>res.sendFile(path.resolve(GAMES_DIR, "week-puzzles/index.html")),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.get('/:language/week-puzzles/:weekDay', (req, res) => {
  let language = req.params["language"];
  let weekDay = req.params["weekDay"];
  check_language_and_go(
    language,
    ()=>render(req,res,`week-puzzles/${language}/${weekDay}/index.ntl`),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.use("/week-puzzles", express.static(`${GAMES_DIR}/week-puzzles`));
games.use("/:language/week-puzzles/:weekDay", (req,res,next) => {
  let language = req.params["language"];
  let weekDay = req.params["weekDay"];
  express.static(`${GAMES_DIR}/week-puzzles/${language}/${weekDay}`)(req,res,next);
});
games.use("/:language/week-puzzles", express.static(`${GAMES_DIR}/week-puzzles`));


games.use("/puzzle-from-text", express.static(`${GAMES_DIR}/puzzle-from-text`));
games.get('/puzzle-from-text', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,"puzzle-from-text/upload.ntl"),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.use("/:language/puzzle-from-text", express.static(`${GAMES_DIR}/puzzle-from-text`));

games.get('/:language/puzzle-from-text/upload', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,"puzzle-from-text/upload.ntl"),
    ()=>notAvailableLanguageRedirection(res)
  );
});

games.post('/:language/puzzle-from-text/from-file', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>routing.fromFile(req,res),
    ()=>notAvailableLanguageRedirection(res)
  );
});

games.post('/:language/puzzle-from-text/from-string', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>routing.fromString(req,res),
    ()=>notAvailableLanguageRedirection(res)
  );
});

games.get('/', (req, res) => {
  res.redirect("/games/en");
});
games.get('/:language', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,"menu/menu.ntl")
  );
});
games.use('/',express.static(`${GAMES_DIR}/menu`));
