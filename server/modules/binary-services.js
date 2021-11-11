import * as path from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises'
import { promisify } from 'util';
import { execFile } from 'child_process';
import { createReadStream } from 'fs';

const p_execFile = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));


export let binServices = function(){
    let BIN_DIR = path.resolve(__dirname,"../bin");

    function exportBrick(inputFilepath, outputFilepath) {
        const exportBrickApp = `${BIN_DIR}/export-brick`;

        console.info("[export-brick][inputFilepath]:",inputFilepath);
        console.info("[export-brick][inputFilepath]:",outputFilepath);

        return p_execFile(exportBrickApp, [inputFilepath, outputFilepath])
            .then(result => {
                console.info("[export-brick][stdout]:",result.stdout);
                console.error("[export-brick][stderr]:",result.stderr);
            })
            .catch( () => {
                return new Error("Error during export-brick execution.");
            });
      }

    function generatePuzzle({input_stream=null,brick_filepath='',num_letters=7,min_words=5,mode='random'}) {
        const wordDetectiveApp = `${BIN_DIR}/word-detective`;

        let wd;
        if(input_stream!==null){
            wd = p_execFile(wordDetectiveApp, [`-l${num_letters}`, `-w${min_words}`, `-m${mode}`]);
            input_stream.pipe(wd.child.stdin);
        }else{
            wd = p_execFile(wordDetectiveApp, [`-l${num_letters}`, `-w${min_words}`, `-m${mode}`,`-b${brick_filepath}`]);
        }

        return wd.then(result => new Promise(function(resolve) {
            console.info("[generate-puzzle][stdout]:",result.stdout);
            console.error("[generate-puzzle][stderr]:",result.stderr);

            resolve(result.stdout);
        }))
        .catch( () => {
            return new Error("Error during generate-puzzle execution.");
        });

    }

    function writeToTextFile(text, outputFilepath) {
        return writeFile(outputFilepath, text)
            .then(() => {
                console.info("[write-to-text-file]:","writing succeeded!");
            })
            .catch( () => {
                return new Error("Error during write-to-text-file execution.");
            });
    }

      return {
          exportBrick,
          generatePuzzle,
          writeToTextFile
      };

}();
