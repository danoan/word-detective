import express from 'express';
import { routing } from './routing.js'

export let api = express.Router();

api.get('/random-puzzle', (req,res) => {
    routing.randomPuzzle(req,res);
});

api.post('/puzzle-from-book', (req, res) => {
    routing.puzzleFromBook(req,res);
});
