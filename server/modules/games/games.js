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

games.use("/week-puzzles", express.static(`${GAMES_DIR}/week-puzzles`));
games.get('/week-puzzles', (req, res) => {
  res.sendFile(path.resolve(GAMES_DIR, "week-puzzles/index.html"));
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
