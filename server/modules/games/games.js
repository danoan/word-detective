import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { routing } from './routing.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const GAMES_DIR = path.resolve(PROJECT_ROOT, "games");

export let games = express.Router();

games.use("/random-puzzle", express.static(`${GAMES_DIR}/random-puzzle`));
games.get('/random-puzzle', (req, res) => {
  res.sendFile(path.resolve(GAMES_DIR, "random-puzzle/index.html"));
});

games.use("/puzzle-of-day", express.static(`${GAMES_DIR}/puzzle-of-day`));
games.get('/puzzle-of-day', (req, res) => {
  res.sendFile(path.resolve(GAMES_DIR, "puzzle-of-day/index.html"));
});

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
    ()=>res.sendFile(path.resolve(GAMES_DIR, `week-puzzles/${language}/${weekDay}/index.html`)),
    ()=>notAvailableLanguageRedirection(res)
  );
});
games.use("/week-puzzles", express.static(`${GAMES_DIR}/week-puzzles`));
games.use("/:language/week-puzzles/:weekDay", (req,res,next) => {
  let language = req.params["language"];
  let weekDay = req.params["weekDay"];
  express.static(`${GAMES_DIR}/week-puzzles/${language}/${weekDay}`)(req,res,next);
});


games.use("/puzzle-from-text", express.static(`${GAMES_DIR}/puzzle-from-text`));
games.get('/puzzle-from-text', (req, res) => {
  res.sendFile(path.resolve(GAMES_DIR, "puzzle-from-text/upload.html"));
});

games.get('/puzzle-from-text/upload', (req, res) => {
  res.sendFile(path.resolve(GAMES_DIR, "puzzle-from-text/upload.html"));
});

games.post('/puzzle-from-text/from-file', (req, res) => {
  routing.fromFile(req,res);
});

games.post('/puzzle-from-text/from-string', (req, res) => {
  routing.fromString(req,res);
});

games.use('/',express.static(`${GAMES_DIR}/menu`));
games.get('/', (req, res) => {
  res.sendFile(path.resolve(GAMES_DIR, "menu/menu.html"));
});
