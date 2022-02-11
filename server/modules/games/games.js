import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { routing } from './routing.js'
import { notAvailableLanguageRedirection, render, check_language_and_go} from './utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const GAMES_DIR = path.resolve(PROJECT_ROOT, "games");

export let games = express.Router();

/****Random puzzle****/
games.get('/:language/random-puzzle', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,path.resolve(GAMES_DIR, "random-puzzle/index.ntl")),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.use("/:language/random-puzzle", express.static(`${GAMES_DIR}/random-puzzle`));

/****Puzzle of the day****/
games.get('/:language/puzzle-of-day', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,path.resolve(GAMES_DIR, "puzzle-of-day/index.ntl")),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.use("/:language/puzzle-of-day", express.static(`${GAMES_DIR}/puzzle-of-day`));

/****Week Puzzles****/
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
    ()=>render(req,res,path.resolve(GAMES_DIR, `week-puzzles/${language}/${weekDay}/index.ntl`)),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.use("/:language/week-puzzles/:weekDay", (req,res,next) => {
  let language = req.params["language"];
  let weekDay = req.params["weekDay"];
  express.static(`${GAMES_DIR}/week-puzzles/${language}/${weekDay}`)(req,res,next);
});

/****Puzzle from text****/
games.use("/puzzle-from-text", express.static(`${GAMES_DIR}/puzzle-from-text`));
games.get('/puzzle-from-text', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,path.resolve(GAMES_DIR, "puzzle-from-text/upload.ntl")),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.use("/:language/puzzle-from-text", express.static(`${GAMES_DIR}/puzzle-from-text`));

games.get('/:language/puzzle-from-text/upload', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,path.resolve(GAMES_DIR, "puzzle-from-text/upload.ntl")),
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

/****Menu****/
games.get('/', (req, res) => {
  res.redirect("/games/en");
});
games.get('/:language', (req, res) => {
  let language = req.params["language"];
  check_language_and_go(
    language,
    ()=>render(req,res,path.resolve(GAMES_DIR, "menu/menu.ntl"))
  );
});
games.use('/',express.static(`${GAMES_DIR}/menu`));
