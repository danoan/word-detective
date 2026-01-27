import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, mkdir, rm, copyFile, rename, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { binServices } from '../binary-services.js';

const p_execFile = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_PATH = path.resolve(PROJECT_ROOT, "assets/config/active-corpora.json");

const LANGUAGE_MAP = {
    en: 'english',
    it: 'italian',
    fr: 'french',
    pt: 'portuguese'
};

const LANGUAGE_NAMES = {
    en: 'English',
    it: 'Italian',
    fr: 'French',
    pt: 'Portuguese'
};

const LANGUAGE_CODES = {
    english: 'en',
    italian: 'it',
    french: 'fr',
    portuguese: 'pt'
};

function parseWordSourceList(listResult) {
    if (!listResult.Success || !listResult.Message) {
        return [];
    }

    const entries = listResult.Message.split('\n\n').filter(entry => entry.trim());
    return entries.map(entry => {
        const lines = entry.split('\n');
        const source = {};
        for (const line of lines) {
            const colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
                const key = line.substring(0, colonIdx).trim();
                const value = line.substring(colonIdx + 1).trim();
                source[key] = value;
            }
        }
        return source;
    }).filter(source => source.name);
}

async function loadActiveConfig() {
    try {
        const data = await readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return {
            en: { wordSource: "en-5K" },
            it: { wordSource: "it-7K" },
            fr: { wordSource: "fr-5K" },
            pt: { wordSource: "pt-5K" }
        };
    }
}

async function saveActiveConfig(config) {
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

export let routing = function () {

    async function dashboard(req, res) {
        try {
            const listResult = await binServices.wordSourceManagerList();
            const wordSources = parseWordSourceList(listResult);
            const activeConfig = await loadActiveConfig();

            const groupedSources = {};
            for (const lang of Object.keys(LANGUAGE_NAMES)) {
                const fullLang = LANGUAGE_MAP[lang];
                groupedSources[lang] = {
                    name: LANGUAGE_NAMES[lang],
                    sources: wordSources.filter(s => s.language === fullLang),
                    active: activeConfig[lang]?.wordSource || null
                };
            }

            res.render('admin/index', {
                vars: {
                    corporaData: JSON.stringify(groupedSources)
                }
            });
        } catch (error) {
            console.error("[admin][dashboard] Error:", error);
            res.status(500).send("Error loading admin dashboard: " + error.message);
        }
    }

    async function apiCorpora(req, res) {
        try {
            const listResult = await binServices.wordSourceManagerList();
            const wordSources = parseWordSourceList(listResult);
            const activeConfig = await loadActiveConfig();

            const groupedSources = {};
            for (const lang of Object.keys(LANGUAGE_NAMES)) {
                const fullLang = LANGUAGE_MAP[lang];
                groupedSources[lang] = {
                    name: LANGUAGE_NAMES[lang],
                    sources: wordSources.filter(s => s.language === fullLang),
                    active: activeConfig[lang]?.wordSource || null
                };
            }

            res.json(groupedSources);
        } catch (error) {
            console.error("[admin][apiCorpora] Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async function upload(req, res) {
        try {
            if (!req.files || !req.files.corpus) {
                return res.status(400).send("No file uploaded");
            }

            const file = req.files.corpus;
            const name = req.body.name;
            const language = req.body.language;

            if (!name || !language) {
                return res.status(400).send("Name and language are required");
            }

            const fullLanguage = LANGUAGE_MAP[language];
            if (!fullLanguage) {
                return res.status(400).send("Invalid language code");
            }

            const tempPath = path.resolve(PROJECT_ROOT, `temp-${name}.txt`);
            await file.mv(tempPath);

            const wordCheckApp = path.resolve(PROJECT_ROOT, `bin/word-check-${fullLanguage}`);

            try {
                const result = await binServices.wordSourceManagerAdd(name, fullLanguage, wordCheckApp, tempPath);
                console.info("[admin][upload] Result:", result);
            } finally {
                try {
                    const { unlink } = await import('fs/promises');
                    await unlink(tempPath);
                } catch { }
            }

            res.redirect('/admin');
        } catch (error) {
            console.error("[admin][upload] Error:", error);
            res.status(500).send("Error uploading corpus: " + error.message);
        }
    }

    async function download(req, res) {
        try {
            const name = req.params.name;
            const listResult = await binServices.wordSourceManagerList();
            const wordSources = parseWordSourceList(listResult);

            const source = wordSources.find(s => s.name === name);
            if (!source || !source['text-filepath']) {
                return res.status(404).send("Corpus not found");
            }

            const filePath = source['text-filepath'];
            res.setHeader('Content-Disposition', `attachment; filename="${name}.txt"`);
            res.setHeader('Content-Type', 'text/plain');
            createReadStream(filePath).pipe(res);
        } catch (error) {
            console.error("[admin][download] Error:", error);
            res.status(500).send("Error downloading corpus: " + error.message);
        }
    }

    async function remove(req, res) {
        try {
            const name = req.params.name;
            const result = await binServices.wordSourceManagerRemove(name);
            console.info("[admin][remove] Result:", result);
            res.redirect('/admin');
        } catch (error) {
            console.error("[admin][remove] Error:", error);
            res.status(500).send("Error removing corpus: " + error.message);
        }
    }

    async function activate(req, res) {
        try {
            const language = req.params.language;
            const name = req.params.name;

            if (!LANGUAGE_NAMES[language]) {
                return res.status(400).send("Invalid language code");
            }

            const config = await loadActiveConfig();
            config[language] = { wordSource: name };
            await saveActiveConfig(config);

            res.redirect('/admin');
        } catch (error) {
            console.error("[admin][activate] Error:", error);
            res.status(500).send("Error activating corpus: " + error.message);
        }
    }

    async function viewWords(req, res) {
        try {
            const name = req.params.name;
            const listResult = await binServices.wordSourceManagerList();
            const wordSources = parseWordSourceList(listResult);

            const source = wordSources.find(s => s.name === name);
            if (!source || !source['text-filepath']) {
                return res.status(404).send("Corpus not found");
            }

            const filePath = source['text-filepath'];
            const content = await readFile(filePath, 'utf-8');
            const words = content.split('\n').filter(w => w.trim()).sort();

            res.render('admin/words', {
                vars: {
                    corpusName: name,
                    language: source.language,
                    words: JSON.stringify(words)
                }
            });
        } catch (error) {
            console.error("[admin][viewWords] Error:", error);
            res.status(500).send("Error loading words: " + error.message);
        }
    }

    async function createFromText(req, res) {
        try {
            const { name, language, text } = req.body;

            if (!name || !language || !text) {
                return res.status(400).send("Name, language, and text are required");
            }

            const fullLanguage = LANGUAGE_MAP[language];
            if (!fullLanguage) {
                return res.status(400).send("Invalid language code");
            }

            // Extract unique words, sorted alphabetically
            const words = text
                .toLowerCase()
                .replace(/[^a-zA-ZàâäéèêëïîôùûüÿœæçÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆÇáéíóúñüÁÉÍÓÚÑÜãõÃÕ\s]/g, ' ')
                .split(/\s+/)
                .map(w => w.trim())
                .filter(w => w.length > 0)
                .filter((w, i, arr) => arr.indexOf(w) === i)
                .sort();

            if (words.length === 0) {
                return res.status(400).send("No valid words found in text");
            }

            // Write words to temp file
            const tempPath = path.resolve(PROJECT_ROOT, `temp-${name}.txt`);
            await writeFile(tempPath, words.join('\n') + '\n');

            const wordCheckApp = path.resolve(PROJECT_ROOT, `bin/word-check-${fullLanguage}`);

            try {
                const result = await binServices.wordSourceManagerAdd(name, fullLanguage, wordCheckApp, tempPath);
                console.info("[admin][createFromText] Result:", result);
            } finally {
                try {
                    await unlink(tempPath);
                } catch { }
            }

            res.redirect('/admin');
        } catch (error) {
            console.error("[admin][createFromText] Error:", error);
            res.status(500).send("Error creating corpus: " + error.message);
        }
    }

    async function createFromSelection(req, res) {
        try {
            const { name, language, words } = req.body;

            if (!name || !language || !words || !Array.isArray(words)) {
                return res.status(400).send("Name, language, and words array are required");
            }

            const fullLanguage = LANGUAGE_MAP[LANGUAGE_CODES[language]] || language;
            if (!fullLanguage) {
                return res.status(400).send("Invalid language");
            }

            // Write selected words to temp file
            const tempPath = path.resolve(PROJECT_ROOT, `temp-${name}.txt`);
            await writeFile(tempPath, words.join('\n') + '\n');

            const wordCheckApp = path.resolve(PROJECT_ROOT, `bin/word-check-${fullLanguage}`);

            try {
                const result = await binServices.wordSourceManagerAdd(name, fullLanguage, wordCheckApp, tempPath);
                console.info("[admin][createFromSelection] Result:", result);
                res.json({ success: true, message: `Corpus '${name}' created with ${words.length} words` });
            } finally {
                try {
                    const { unlink } = await import('fs/promises');
                    await unlink(tempPath);
                } catch { }
            }
        } catch (error) {
            console.error("[admin][createFromSelection] Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    const WEEK_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const WEEK_PUZZLES_DIR = path.resolve(PROJECT_ROOT, 'games/week-puzzles');
    const BIN_DIR = path.resolve(PROJECT_ROOT, 'bin');

    async function regenerateWeekPuzzles(req, res) {
        try {
            const config = await loadActiveConfig();
            const listResult = await binServices.wordSourceManagerList();
            const wordSources = parseWordSourceList(listResult);

            const results = [];

            for (const langCode of Object.keys(LANGUAGE_MAP)) {
                const fullLang = LANGUAGE_MAP[langCode];
                const activeSourceName = config[langCode]?.wordSource;
                const source = wordSources.find(s => s.name === activeSourceName && s.language === fullLang);

                if (!source || !source['brick-filepath']) {
                    results.push({ language: langCode, status: 'skipped', reason: 'No active corpus found' });
                    continue;
                }

                const brickPath = source['brick-filepath'];
                console.info(`[regenerateWeekPuzzles] Generating for ${langCode} using ${brickPath}`);

                try {
                    for (const day of WEEK_DAYS) {
                        const outFolder = path.resolve(WEEK_PUZZLES_DIR, langCode, day);
                        const assetsFolder = path.resolve(outFolder, 'assets');
                        const jsFolder = path.resolve(outFolder, 'js');
                        const jsonPuzzlePath = path.resolve(assetsFolder, 'puzzle.json');

                        // Clean and create directories
                        await rm(outFolder, { recursive: true, force: true });
                        await mkdir(assetsFolder, { recursive: true });
                        await mkdir(jsFolder, { recursive: true });

                        // Generate puzzle JSON
                        const wordDetectiveApp = path.resolve(BIN_DIR, 'word-detective');
                        await p_execFile(wordDetectiveApp, [
                            '-mrandom', '-l7', `-o${jsonPuzzlePath}`, `-b${brickPath}`
                        ]);

                        // Render puzzle HTML
                        const renderScript = path.resolve(BIN_DIR, 'render-word-detective.py');
                        const templatePath = path.resolve(WEEK_PUZZLES_DIR, 'templates/index-week-puzzles.ntl');
                        await p_execFile('python3', [
                            renderScript, templatePath, jsonPuzzlePath, outFolder, day
                        ]);

                        // Rename index.html to index.ntl
                        await rename(
                            path.resolve(outFolder, 'index.html'),
                            path.resolve(outFolder, 'index.ntl')
                        );

                        // Copy JS file
                        await copyFile(
                            path.resolve(WEEK_PUZZLES_DIR, 'js/week-puzzles.js'),
                            path.resolve(jsFolder, 'week-puzzles.js')
                        );
                    }

                    results.push({ language: langCode, status: 'success', days: WEEK_DAYS.length });
                } catch (langError) {
                    console.error(`[regenerateWeekPuzzles] Error for ${langCode}:`, langError);
                    results.push({ language: langCode, status: 'error', reason: langError.message });
                }
            }

            res.json({ success: true, results });
        } catch (error) {
            console.error("[regenerateWeekPuzzles] Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    return {
        dashboard,
        apiCorpora,
        upload,
        download,
        remove,
        activate,
        viewWords,
        createFromText,
        createFromSelection,
        regenerateWeekPuzzles,
        loadActiveConfig,
        parseWordSourceList
    };

}();
