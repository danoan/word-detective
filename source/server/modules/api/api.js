import express from 'express';
import { routing } from './routing.js'

export let api = express.Router();

api.get('/:language/random-puzzle', (req, res) => {
    routing.randomPuzzle(req, res);
});

api.post('/:language/puzzle-from-file', (req, res) => {
    routing.puzzleFromFile(req, res);
});

api.post('/:language/puzzle-from-string', (req, res) => {
    routing.puzzleFromString(req, res);
});

api.get('/:language/definition/:word', (req, res) => {
    routing.wordDefinition(req, res);
});

api.get('/:language/request-word/:word', (req, res) => {
    routing.requestWord(req, res);
});
