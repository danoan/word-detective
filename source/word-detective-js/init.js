import * as path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const port = 4958;

const app = express();

app.use('/', express.static(path.resolve(__dirname,'tests')));
app.use('/src', express.static(path.resolve(__dirname,'src')));

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
