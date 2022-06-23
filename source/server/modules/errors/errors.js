import express from 'express';
import { routing } from './routing.js'

export let errors = express.Router();

errors.get('/500',(req,res) => {
  routing.genericError(req,res);
});

errors.get('/no-puzzle-generated',(req,res) => {
  routing.noPuzzleGenerated(req,res);
});

errors.get('/language-not-available',(req,res) => {
  routing.languageNotAvailable(req,res);
});


errors.post('/register-error',(req,res) => {
  console.info("[register-error]");
  console.info(req.body);
  res.sendStatus(200);
});
