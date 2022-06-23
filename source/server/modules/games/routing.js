import md5 from 'md5'
import { render } from './utils.js'

export let routing = function () {

  function fromFile(req, res) {
    //replaceAll is not implemented in this version of nodejs
    let text = req.files.text_file.data.toString().replace(/`/g,'\\`');
    let checksum = md5(text);

    render(req,res,"games/puzzle-from-text/index.ntl",{text,checksum})
  }

  function fromString(req, res) {
    //replaceAll is not implemented in this version of nodejs
    let text = req.body.text.replace(/`/g,'\\`');
    let checksum = md5(text);

    render(req,res,"games/puzzle-from-text/index.ntl",{text,checksum})
  }

  return {
    fromFile,
    fromString
  };

}();