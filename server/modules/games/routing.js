import * as path from 'path';
import { fileURLToPath } from 'url';
import md5 from 'md5'
import { Transform } from 'stream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

export let routing = function () {

  function fromFile(req, res) {
    //replaceAll is not implemented in this version of nodejs
    let text = req.files.text_file.data.toString().replace(/`/g,'\\`');
    let checksum = md5(text);

    res.render('games/puzzle-from-text/index.ntl', { vars: { text, checksum } });
  }

  function fromString(req, res) {
    //replaceAll is not implemented in this version of nodejs
    let text = req.body.text.replace(/`/g,'\\`');
    let checksum = md5(text);

    res.render('games/puzzle-from-text/index.ntl', { vars: { text, checksum } });
  }

  return {
    fromFile,
    fromString
  };

}();