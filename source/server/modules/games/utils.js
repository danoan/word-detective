import * as path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const ASSETS_DIR = path.resolve(PROJECT_ROOT, "assets");
const LANGUAGES=["en","it","pt","fr"];

export function notAvailableLanguageRedirection(res){
  res.redirect("/error/language-not-available");
}

export function render(req,res,path_to_ntl,extra_vars={}){
  let language = req.params["language"];
  let path_to_interface_messages = `messages/${language}/interface.json` ;
  fs.readFile(path.resolve(ASSETS_DIR, path_to_interface_messages), function(err,data){
    if(err) console.info(err);
    let interface_messages = JSON.parse(data);

    let vars = { "vars": interface_messages };
    Object.assign(vars.vars,extra_vars);
    res.render(path_to_ntl,vars);
  });
}

export function check_language_and_go(language,go_function,error_function){
  if(!LANGUAGES.includes(language)){
    error_function();
  }else{
    go_function();
  }
}
