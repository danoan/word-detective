import * as path from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises'
import { promisify } from 'util';
import { execFile } from 'child_process';

const p_execFile = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));


export let binServices = function(){
    let BIN_DIR = path.resolve(__dirname,"../bin");

    function exportBrick(language,inputFilepath, outputFilepath) {
        const exportBrickApp = `${BIN_DIR}/export-brick`;

        console.info("[export-brick][inputFilepath]:",inputFilepath);
        console.info("[export-brick][inputFilepath]:",outputFilepath);

        return p_execFile(exportBrickApp, [`-l${language}`,`-i${inputFilepath}`, outputFilepath])
            .then(result => {
                console.info("[export-brick][stdout]:",result.stdout);
                console.error("[export-brick][stderr]:",result.stderr);
            })
            .catch( error => {
                throw error;
                // return new Error("Error during export-brick execution.");
            });
      }

    function generatePuzzle({input_stream=null,brick_filepath='',language='english',num_letters=7,min_words=5,mode='random'}) {
        const wordDetectiveApp = `${BIN_DIR}/word-detective`;

        let wd;
        if(input_stream!==null){
            wd = p_execFile(wordDetectiveApp, [`-L${language}`,`-l${num_letters}`, `-w${min_words}`, `-m${mode}`]);
            input_stream.pipe(wd.child.stdin);
        }else{
            wd = p_execFile(wordDetectiveApp, [`-L${language}`,`-l${num_letters}`, `-w${min_words}`, `-m${mode}`,`-b${brick_filepath}`]);
        }

        return wd.then(result => new Promise(function(resolve) {
            console.info("[generate-puzzle][stdout]:",result.stdout);
            console.error("[generate-puzzle][stderr]:",result.stderr);

            resolve(result.stdout);
        }))
        .catch( error => {
            throw error;
            // throw new Error("Error during generate-puzzle execution.");
        });

    }

    function writeToTextFile(text, outputFilepath) {
        return writeFile(outputFilepath, text)
            .then(() => {
                console.info("[write-to-text-file]:","writing succeeded!");
            })
            .catch( error => {
                throw error;
                // return new Error("Error during write-to-text-file execution.");
            });
    }

    async function italianDictionary(word){
        let italian_dictonary_path = path.resolve(BIN_DIR,'italian_dictionary.py');
        let wd = p_execFile('python3', [italian_dictonary_path,word]);

        return wd.then(result => new Promise(function(resolve){
            console.info("[italian-dictionary][stdout]:",result.stdout);
            console.error("[italian-dictionary][stderr]:",result.stderr);

            resolve(result.stdout);
        }))
        .catch( error => {
            throw error;
        });
    }

    async function requestWord(dictionary_name,word){
        return p_execFile("dictionary-manager", ["request-word", word, dictionary_name])
        .then(result => new Promise(function(resolve){
            console.info("[dictionary-manager][request-word][stdout]:",result.stdout);
            console.info("[dictionary-manager][request-word][stdout]:",result.stderr);

            resolve(result.stdout);
        }))
        .catch( error => {
            throw error;
        });
    }

      return {
          exportBrick,
          generatePuzzle,
          writeToTextFile,
          italianDictionary,
          requestWord
      };

}();
