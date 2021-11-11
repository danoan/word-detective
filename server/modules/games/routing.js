import * as path from 'path';
import { fileURLToPath } from 'url';
import md5 from 'md5'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

export let routing = function () {

  function fromFile(req, res) {
    let text = req.files.text_file.data.toString();
    let checksum = md5(text);

    res.render('index.ntl', { vars: { text, checksum } });
  }

  function fromString(req, res) {
    let text = req.body.text;
    let checksum = md5(text);

    res.render('index.ntl', { vars: { text, checksum } });
  }

  return {
    fromFile,
    fromString
  };

}();