import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { routing } from './routing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const VIEWS_DIR = path.resolve(PROJECT_ROOT, "assets/views/admin");

export let admin = express.Router();

// Dashboard page
admin.get('/', (req, res) => {
    routing.dashboard(req, res);
});

// API endpoints
admin.get('/api/corpora', (req, res) => {
    routing.apiCorpora(req, res);
});

// Upload new corpus
admin.post('/upload', (req, res) => {
    routing.upload(req, res);
});

// Download corpus text file
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

// Word viewer page
admin.get('/corpus/:name/words', (req, res) => {
    routing.wordsPage(req, res);
});

// Create corpus from word selection
admin.post('/corpus/create-from-selection', (req, res) => {
    routing.createFromSelection(req, res);
});

// Requested words page
admin.get('/corpus/:name/requested-words', (req, res) => {
    routing.requestedWordsPage(req, res);
});

// Process requested words (streaming)
admin.post('/corpus/:name/process-requested-words', (req, res) => {
    routing.processRequestedWords(req, res);
});

// Add words to corpus
admin.post('/corpus/:name/add-words', (req, res) => {
    routing.addWords(req, res);
});

// Handle flagged word action (remove/ignore)
admin.post('/corpus/:name/flagged-word-action', (req, res) => {
    routing.handleFlaggedWord(req, res);
});

// Regenerate week puzzles
admin.post('/regenerate-week-puzzles', (req, res) => {
    routing.regenerateWeekPuzzles(req, res);
});

// Serve admin CSS
admin.use('/css', express.static(`${VIEWS_DIR}/css`));
