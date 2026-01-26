import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';
import { createReadStream } from 'fs';
import { binServices } from '../binary-services.js';

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
                groupedSources[lang] = {
                    name: LANGUAGE_NAMES[lang],
                    sources: wordSources.filter(s => s.language === lang),
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
                groupedSources[lang] = {
                    name: LANGUAGE_NAMES[lang],
                    sources: wordSources.filter(s => s.language === lang),
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

    return {
        dashboard,
        apiCorpora,
        upload,
        download,
        remove,
        activate,
        loadActiveConfig,
        parseWordSourceList
    };

}();
