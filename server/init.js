import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs'

import * as path from 'path';
import { fileURLToPath } from 'url';

import { middlewares } from './modules/middlewares.js';
import { api } from './modules/api/api.js'
import { games } from './modules/games/games.js'
import { errors } from './modules/errors/errors.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname);

const hostname = '0.0.0.0';
const port = 4958;

const app = express();

//Configure views directory and render function
app.engine('ntl', function (filepath, options, callback) {
    fs.readFile(filepath, function (err, content) {
        if (err) return callback(err);
        var rendered = content.toString();

        for (let el in options.vars) {
            rendered = rendered.replace(new RegExp(`#${el}#`,'g'), options.vars[el]);
        }

        return callback(null, rendered);
    });
});
app.set('views', './assets/views')
app.set('view engine', 'ntl');

//Handle binary post requests
app.use(fileUpload({
    createParentPath: true
}));

//Handle json post requests
app.use(express.json());

//Handle default form post requests
app.use(express.urlencoded({
    extended: true,
    limit: "2Mb"
})); //To populate req.body with submitted form data.

//Configure CORS
app.use(middlewares.setUpAccessControlHeader);

//Make general css folder accessible
app.use("/assets/css",express.static(`${PROJECT_ROOT}/assets/css`));
app.use("/assets/js",express.static(`${PROJECT_ROOT}/assets/js`));
app.use("/assets/fonts",express.static(`${PROJECT_ROOT}/assets/fonts`));

//Set paths to routers (sub-apps)
app.use('/games', games);
app.use('/api', api);
app.use('/error',errors);

//Start the server
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
