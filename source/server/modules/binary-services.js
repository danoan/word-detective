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

        try {
            console.info("[italian-dictionary] Fetching from Corriere for word:", word);
            const result = await p_execFile('python3', [italian_dictonary_path, word]);
            console.info("[italian-dictionary][stdout]:", result.stdout);
            console.error("[italian-dictionary][stderr]:", result.stderr);

            const definition = result.stdout.trim();
            if (definition) {
                console.info("[italian-dictionary] Found definition from Corriere");
                return JSON.stringify({ word, definition });
            }

            // Fallback to ChatGPT
            console.info("[italian-dictionary] Corriere extraction failed, falling back to ChatGPT");
            return await chatgptDictionary(word, 'it');
        } catch (error) {
            console.error("[italian-dictionary] Error fetching from Corriere:", error.message);
            // Fallback to ChatGPT
            return await chatgptDictionary(word, 'it');
        }
    }

    async function wordSourceManagerList() {
        const result = await p_execFile('word-source-manager', ['list']);
        console.info("[word-source-manager][list][stdout]:", result.stdout);
        console.error("[word-source-manager][list][stderr]:", result.stderr);
        return JSON.parse(result.stdout);
    }

    async function wordSourceManagerAdd(name, language, wordCheckApp, corpusPath) {
        const result = await p_execFile('word-source-manager', ['add', name, language, wordCheckApp, corpusPath]);
        console.info("[word-source-manager][add][stdout]:", result.stdout);
        console.error("[word-source-manager][add][stderr]:", result.stderr);
        return JSON.parse(result.stdout);
    }

    async function wordSourceManagerRemove(name) {
        const result = await p_execFile('word-source-manager', ['remove', name]);
        console.info("[word-source-manager][remove][stdout]:", result.stdout);
        console.error("[word-source-manager][remove][stderr]:", result.stderr);
        return JSON.parse(result.stdout);
    }

    async function requestWord(word_source_name,word){
        return p_execFile("word-source-manager", ["request-word", word, word_source_name])
        .then(result => new Promise(function(resolve){
            console.info("[word-source-manager][request-word][stdout]:",result.stdout);
            console.info("[word-source-manager][request-word][stdout]:",result.stderr);

            resolve(result.stdout);
        }))
        .catch( error => {
            throw error;
        });
    }

    async function chatgptDictionary(word, languageCode) {
        let chatgpt_dictionary_path = path.resolve(BIN_DIR, 'chatgpt_dictionary.py');
        let wd = p_execFile('python3', [chatgpt_dictionary_path, "definition", "--lang", languageCode, word]);

        return wd.then(result => new Promise(function(resolve) {
            console.info("[chatgpt-dictionary][stdout]:", result.stdout);
            console.error("[chatgpt-dictionary][stderr]:", result.stderr);

            // Normalize from { Status, Definitions: [...] } to { word, definition }
            const parsed = JSON.parse(result.stdout);
            const definition = parsed.Definitions?.[0] || '';
            resolve(JSON.stringify({ word, definition }));
        }))
        .catch(error => {
            throw error;
        });
    }

    async function englishDictionary(word) {
        function extractDefinition(collinsHtml) {
            // Remove newline characters
            let res = collinsHtml.replaceAll(/\n/g, '');
            // Include newline characters after every div element
            res = res.replaceAll(/<\/div>/g, '</div>\n');
            // Look for the div definition
            let reg = /<div class="def">.*?<\/div>/;
            let match = reg.exec(res);

            if (!match || match.length === 0) {
                return null;
            }
            // Remove html elements
            let definition = match[0].replaceAll(/<.*?>/g, '');
            return definition;
        }

        try {
            console.info("[english-dictionary] Fetching from Collins for word:", word);
            const response = await fetch(`https://www.collinsdictionary.com/dictionary/english/${word}`);
            const html = await response.text();
            const definition = extractDefinition(html);

            if (definition) {
                console.info("[english-dictionary] Found definition from Collins");
                return JSON.stringify({ word, definition });
            }

            // Fallback to ChatGPT
            console.info("[english-dictionary] Collins extraction failed, falling back to ChatGPT");
            return await chatgptDictionary(word, 'en');
        } catch (error) {
            console.error("[english-dictionary] Error fetching from Collins:", error.message);
            // Fallback to ChatGPT
            return await chatgptDictionary(word, 'en');
        }
    }

      return {
          exportBrick,
          generatePuzzle,
          writeToTextFile,
          italianDictionary,
          requestWord,
          chatgptDictionary,
          englishDictionary,
          wordSourceManagerList,
          wordSourceManagerAdd,
          wordSourceManagerRemove
      };

}();
