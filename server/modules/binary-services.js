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

        console.info("Export brick");
        console.info(inputFilepath);
        console.info(outputFilepath);

        return p_execFile(exportBrickApp, [inputFilepath, outputFilepath])
            .then(result => {
                console.info("after brick");
                console.error(result.stderr);
                console.log(result.stdout);
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
            console.info("after puzzle");
            console.error(result.stderr);

            resolve(result.stdout);
        }))
        .catch( () => {
            console.log("Error generate puzzle");
            console.log(wd);
        });

    }

    function writeToTextFile(text, outputFilepath) {
        console.info("Write to text file");

        return writeFile(outputFilepath, text)
            .then(() => {
                console.info("after write");
            });
    }

      return {
          exportBrick,
          generatePuzzle,
          writeToTextFile
      };

}();
