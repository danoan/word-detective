import express from 'express';

import { middlewares } from './modules/middlewares.js';
import { api } from './modules/api/api.js'
import { games } from './modules/games/games.js'

const hostname = '0.0.0.0';
const port = 4958;

const app = express();

app.use(middlewares.setUpAccessControlHeader);

app.use('/games',games);
app.use('/api',api)


app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
