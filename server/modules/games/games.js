import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname,"../../");
const GAMES_DIR = path.resolve(PROJECT_ROOT,"games");

export let games = express.Router();

games.use("/random-puzzle", express.static(`${GAMES_DIR}/random-puzzle`));
games.get('/random-puzzle', (req, res) => {
  console.info(GAMES_DIR);
  res.sendFile(path.resolve(GAMES_DIR,"random-puzzle/index.html"));
});

games.use("/puzzle-of-day", express.static(`${GAMES_DIR}/puzzle-of-day`));
games.get('/puzzle-of-day', (req, res) => {
  console.info(GAMES_DIR);
  res.sendFile(path.resolve(GAMES_DIR,"puzzle-of-day/index.html"));
});
