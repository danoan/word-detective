import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs'

import { middlewares } from './modules/middlewares.js';
import { api } from './modules/api/api.js'
import { games } from './modules/games/games.js'

const hostname = '0.0.0.0';
const port = 4958;

const app = express();

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
app.set('views', './games/puzzle-from-text')
app.set('view engine', 'ntl');

app.use(fileUpload({
    createParentPath: true
}));
app.use(middlewares.setUpAccessControlHeader);
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
    limit: "2Mb"
})); //To populate req.body with submitted form data.

app.use('/games', games);
app.use('/api', api);


app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
