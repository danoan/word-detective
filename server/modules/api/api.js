import express from 'express';
import { routing } from './routing.js'

export let api = express.Router();

api.get('/random-puzzle', (req,res) => {
    routing.randomPuzzle(req,res);
});

api.get('/puzzle-from-text', (req, res) => {
    routing.puzzleFromText(req,res);
});

api.get('/puzzle-from-url', (req, res) => {
    routing.puzzleFromURL(req,res);
});
