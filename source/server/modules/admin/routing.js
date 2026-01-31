import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { binServices } from '../binary-services.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_PATH = path.resolve(PROJECT_ROOT, "assets/config/active-corpora.json");
const VIEWS_DIR = path.resolve(PROJECT_ROOT, "assets/views/admin");

const LANGUAGE_CODE_TO_NAME = {
    "en": "english",
    "it": "italian",
    "fr": "french",
    "pt": "portuguese"
};

const LANGUAGE_NAME_TO_CODE = {
    "english": "en",
    "italian": "it",
    "french": "fr",
    "portuguese": "pt"
};

const LANGUAGE_DISPLAY_NAMES = {
    "en": "English",
    "it": "Italian",
    "fr": "French",
    "pt": "Portuguese"
};

export let routing = function () {

    function languageCodeFromName(name) {
        return LANGUAGE_NAME_TO_CODE[name] || null;
    }

    function languageNameFromCode(code) {
        return LANGUAGE_CODE_TO_NAME[code] || null;
    }

    async function loadActiveConfig() {
        try {
            const data = await readFile(CONFIG_PATH, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return {
                "en": { "wordSource": "en-5K" },
                "it": { "wordSource": "it-7K" },
                "fr": { "wordSource": "fr-5K" },
                "pt": { "wordSource": "pt-5K" }
            };
        }
    }

    async function saveActiveConfig(config) {
        await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
    }

    function parseWordSourceList(listResult) {
        // The word-source-manager returns JSON: {"Success": true, "Message": "..."}
        // The actual list is inside the Message field
        let messageContent = listResult;

        try {
            const jsonResponse = JSON.parse(listResult);
            if (jsonResponse.Message) {
                messageContent = jsonResponse.Message;
            }
        } catch (e) {
            // If not JSON, use as-is (backward compatibility)
        }

        const entries = messageContent.trim().split('\n\n');
        const sources = [];

        for (const entry of entries) {
            if (!entry.trim()) continue;

            const lines = entry.trim().split('\n');
            const source = {};

            for (const line of lines) {
                const colonIndex = line.indexOf(':');
                if (colonIndex === -1) continue;

                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();

                if (key === 'name') source.name = value;
                else if (key === 'language') source.language = value;
                else if (key === 'text-filepath') source.textFilepath = value;
                else if (key === 'brick-filepath') source.brickFilepath = value;
                else if (key === 'added-requested-words-filepath') source.addedRequestedWordsFilepath = value;
            }

            if (source.name) {
                sources.push(source);
            }
        }

        return sources;
    }

    function groupCorporaByLanguage(sources, activeConfig) {
        const grouped = {
            en: { name: "English", corpora: [] },
            it: { name: "Italian", corpora: [] },
            fr: { name: "French", corpora: [] },
            pt: { name: "Portuguese", corpora: [] }
        };

        for (const source of sources) {
            const langCode = languageCodeFromName(source.language);
            if (langCode && grouped[langCode]) {
                const isActive = activeConfig[langCode]?.wordSource === source.name;
                grouped[langCode].corpora.push({
                    ...source,
                    isActive
                });
            }
        }

        return grouped;
    }

    async function dashboard(req, res) {
        try {
            const listResult = await binServices.wordSourceManagerList();
            const sources = parseWordSourceList(listResult);
            const activeConfig = await loadActiveConfig();
            const grouped = groupCorporaByLanguage(sources, activeConfig);

            res.render(path.resolve(VIEWS_DIR, "index.ntl"), {
                vars: {
                    corporaData: JSON.stringify(grouped)
                }
            });
        } catch (error) {
            console.error("[admin][dashboard] Error:", error);
            res.redirect("/error/500");
        }
    }

    async function apiCorpora(req, res) {
        try {
            const listResult = await binServices.wordSourceManagerList();
            const sources = parseWordSourceList(listResult);
            const activeConfig = await loadActiveConfig();
            const grouped = groupCorporaByLanguage(sources, activeConfig);

            res.json(grouped);
        } catch (error) {
            console.error("[admin][apiCorpora] Error:", error);
            res.status(500).json({ error: "Failed to fetch corpora" });
        }
    }

    function getWordCheckApp(language) {
        // Map language to word-check app name (matching init-server.sh)
        const wordCheckApps = {
            "english": "english-dictionary",
            "italian": "italian-dictionary",
            "french": "chatgpt-dictionary",
            "portuguese": "chatgpt-dictionary"
        };
        return wordCheckApps[language] || "chatgpt-dictionary";
    }

    async function upload(req, res) {
        if (!req.files || !req.files.corpus) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { name, language } = req.body;
        if (!name || !language) {
            return res.status(400).json({ error: "Name and language are required" });
        }

        const languageName = languageNameFromCode(language);
        if (!languageName) {
            return res.status(400).json({ error: "Invalid language" });
        }

        const tempPath = path.resolve(PROJECT_ROOT, `temp-corpus-${Date.now()}.txt`);

        try {
            await writeFile(tempPath, req.files.corpus.data);

            const wordCheckApp = getWordCheckApp(languageName);
            await binServices.wordSourceManagerAdd(name, languageName, wordCheckApp, tempPath);

            await unlink(tempPath);

            res.json({ success: true, message: `Corpus "${name}" added successfully` });
        } catch (error) {
            console.error("[admin][upload] Error:", error);
            try { await unlink(tempPath); } catch (e) { }
            res.status(500).json({ error: "Failed to add corpus" });
        }
    }

    async function download(req, res) {
        const { name } = req.params;

        try {
            const listResult = await binServices.wordSourceManagerList();
            const sources = parseWordSourceList(listResult);
            const source = sources.find(s => s.name === name);

            if (!source || !source.textFilepath) {
                return res.status(404).json({ error: "Corpus not found" });
            }

            res.setHeader('Content-Disposition', `attachment; filename="${name}.txt"`);
            res.setHeader('Content-Type', 'text/plain');

            const stream = createReadStream(source.textFilepath);
            stream.pipe(res);
        } catch (error) {
            console.error("[admin][download] Error:", error);
            res.status(500).json({ error: "Failed to download corpus" });
        }
    }

    async function remove(req, res) {
        const { name } = req.params;

        try {
            await binServices.wordSourceManagerRemove(name);
            res.json({ success: true, message: `Corpus "${name}" removed successfully` });
        } catch (error) {
            console.error("[admin][remove] Error:", error);
            res.status(500).json({ error: "Failed to remove corpus" });
        }
    }

    async function activate(req, res) {
        const { language, name } = req.params;

        if (!LANGUAGE_CODE_TO_NAME[language]) {
            return res.status(400).json({ error: "Invalid language" });
        }

        try {
            const config = await loadActiveConfig();
            config[language] = { wordSource: name };
            await saveActiveConfig(config);

            res.json({ success: true, message: `Corpus "${name}" activated for ${LANGUAGE_DISPLAY_NAMES[language]}` });
        } catch (error) {
            console.error("[admin][activate] Error:", error);
            res.status(500).json({ error: "Failed to activate corpus" });
        }
    }

    async function wordsPage(req, res) {
        const { name } = req.params;

        try {
            const listResult = await binServices.wordSourceManagerList();
            const sources = parseWordSourceList(listResult);
            const source = sources.find(s => s.name === name);

            if (!source || !source.textFilepath) {
                return res.status(404).json({ error: "Corpus not found" });
            }

            const content = await readFile(source.textFilepath, 'utf8');
            const words = content.trim().split('\n').filter(w => w.trim());

            let requestedWords = [];
            if (source.addedRequestedWordsFilepath) {
                try {
                    const reqContent = await readFile(source.addedRequestedWordsFilepath, 'utf8');
                    requestedWords = reqContent.trim().split('\n').filter(w => w.trim());
                } catch (e) {
                    // File doesn't exist yet — no requested words to show
                }
            }

            res.render(path.resolve(VIEWS_DIR, "words.ntl"), {
                vars: {
                    corpusName: name,
                    corpusLanguage: source.language,
                    wordsData: JSON.stringify(words),
                    requestedWordsData: JSON.stringify(requestedWords)
                }
            });
        } catch (error) {
            console.error("[admin][wordsPage] Error:", error);
            res.redirect("/error/500");
        }
    }

    async function createFromSelection(req, res) {
        const { name, language, words } = req.body;

        if (!name || !language || !words || !Array.isArray(words)) {
            return res.status(400).json({ error: "Name, language, and words array are required" });
        }

        const languageName = languageNameFromCode(language);
        if (!languageName) {
            return res.status(400).json({ error: "Invalid language" });
        }

        const tempPath = path.resolve(PROJECT_ROOT, `temp-selection-${Date.now()}.txt`);

        try {
            await writeFile(tempPath, words.join('\n'));

            const wordCheckApp = getWordCheckApp(languageName);
            await binServices.wordSourceManagerAdd(name, languageName, wordCheckApp, tempPath);

            await unlink(tempPath);

            res.json({ success: true, message: `Corpus "${name}" created successfully with ${words.length} words` });
        } catch (error) {
            console.error("[admin][createFromSelection] Error:", error);
            try { await unlink(tempPath); } catch (e) { }
            res.status(500).json({ error: "Failed to create corpus" });
        }
    }

    async function regenerateWeekPuzzles(req, res) {
        const results = [];
        const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const BIN_DIR = path.resolve(PROJECT_ROOT, "bin");
        const OUTPUT_FOLDER = path.resolve(PROJECT_ROOT, "games/week-puzzles");

        try {
            const listResult = await binServices.wordSourceManagerList();
            const sources = parseWordSourceList(listResult);
            const activeConfig = await loadActiveConfig();

            for (const langCode of ["en", "it", "fr", "pt"]) {
                const langResult = { language: langCode, status: "success", days: [] };

                try {
                    const activeSourceName = activeConfig[langCode]?.wordSource;
                    if (!activeSourceName) {
                        langResult.status = "error";
                        langResult.reason = "No active corpus configured";
                        results.push(langResult);
                        continue;
                    }

                    const source = sources.find(s => s.name === activeSourceName);
                    if (!source || !source.brickFilepath) {
                        langResult.status = "error";
                        langResult.reason = `Corpus "${activeSourceName}" not found or missing brick file`;
                        results.push(langResult);
                        continue;
                    }

                    const brickPath = source.brickFilepath;

                    for (const day of DAYS) {
                        const dayFolder = path.resolve(OUTPUT_FOLDER, langCode, day);
                        const assetsFolder = path.resolve(dayFolder, "assets");
                        const jsFolder = path.resolve(dayFolder, "js");
                        const jsonPuzzlePath = path.resolve(assetsFolder, "puzzle.json");

                        const { mkdir } = await import('fs/promises');
                        const { execSync } = await import('child_process');

                        await mkdir(assetsFolder, { recursive: true });
                        await mkdir(jsFolder, { recursive: true });

                        const wordDetectiveApp = `${BIN_DIR}/word-detective`;
                        execSync(`${wordDetectiveApp} -mrandom -l7 -o"${jsonPuzzlePath}" -b"${brickPath}"`);

                        const renderScript = `${BIN_DIR}/render-word-detective.py`;
                        const templatePath = `${OUTPUT_FOLDER}/templates/index-week-puzzles.ntl`;
                        execSync(`python3 "${renderScript}" "${templatePath}" "${jsonPuzzlePath}" "${dayFolder}" "${day}"`);

                        const { rename, copyFile } = await import('fs/promises');
                        await rename(path.resolve(dayFolder, "index.html"), path.resolve(dayFolder, "index.ntl"));
                        await copyFile(path.resolve(OUTPUT_FOLDER, "js/week-puzzles.js"), path.resolve(jsFolder, "week-puzzles.js"));

                        langResult.days.push(day);
                    }
                } catch (error) {
                    console.error(`[admin][regenerateWeekPuzzles] Error for ${langCode}:`, error);
                    langResult.status = "error";
                    langResult.reason = error.message;
                }

                results.push(langResult);
            }

            res.json({ success: true, results });
        } catch (error) {
            console.error("[admin][regenerateWeekPuzzles] Error:", error);
            res.status(500).json({ error: "Failed to regenerate week puzzles" });
        }
    }

    return {
        dashboard,
        apiCorpora,
        upload,
        download,
        remove,
        activate,
        wordsPage,
        createFromSelection,
        regenerateWeekPuzzles,
        loadActiveConfig,
        parseWordSourceList,
        languageNameFromCode,
        languageCodeFromName
    };

}();
