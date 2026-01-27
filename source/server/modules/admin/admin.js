import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { routing } from './routing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

export let admin = express.Router();

// Dashboard
admin.get('/', (req, res) => {
    routing.dashboard(req, res);
});

// API endpoint for corpora list
admin.get('/api/corpora', (req, res) => {
    routing.apiCorpora(req, res);
});

// Upload new corpus
admin.post('/upload', (req, res) => {
    routing.upload(req, res);
});

// Download corpus file
admin.get('/download/:name', (req, res) => {
    routing.download(req, res);
});

// Remove corpus
admin.post('/remove/:name', (req, res) => {
    routing.remove(req, res);
});

// Activate corpus for language
admin.post('/activate/:language/:name', (req, res) => {
    routing.activate(req, res);
});

// Regenerate week puzzles
admin.post('/regenerate-week-puzzles', (req, res) => {
    routing.regenerateWeekPuzzles(req, res);
});

// View words in a corpus
admin.get('/corpus/:name/words', (req, res) => {
    routing.viewWords(req, res);
});

// Create new corpus from selected words
admin.post('/corpus/create-from-selection', (req, res) => {
    routing.createFromSelection(req, res);
});

// Serve admin static assets
admin.use('/css', express.static(path.resolve(PROJECT_ROOT, 'assets/views/admin/css')));
