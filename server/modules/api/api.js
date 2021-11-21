import express from 'express';
import { routing } from './routing.js'

export let api = express.Router();

api.get('/random-puzzle', (req, res) => {
    routing.randomPuzzle(req, res);
});

api.post('/puzzle-from-file', (req, res) => {
    routing.puzzleFromFile(req, res);
});

api.post('/puzzle-from-string', (req, res) => {
    routing.puzzleFromString(req, res);
});
