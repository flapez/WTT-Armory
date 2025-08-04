"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestAPI = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
class QuestAPI {
    instanceManager;
    preSptLoad(Instance) {
        this.instanceManager = Instance;
    }
    postDBLoad() {
        this.importQuestSideConfig();
        const questsBasePath = node_path_1.default.join(this.instanceManager.dbPath, 'Quests');
        this.loadAllTraderQuests(questsBasePath);
    }
    loadAllTraderQuests(basePath) {
        const traderDirs = node_fs_1.default.readdirSync(basePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        for (const traderId of traderDirs) {
            this.loadQuestsFromDirectory(traderId);
        }
    }
    loadQuestsFromDirectory(traderId) {
        const traderBasePath = node_path_1.default.join(this.instanceManager.dbPath, 'Quests', traderId);
        const jsonQuestFiles = this.loadJsonFiles(node_path_1.default.join(traderBasePath));
        const jsonQuestAssortFiles = this.loadJsonFiles(node_path_1.default.join(traderBasePath, 'questAssort'));
        const jsonImageFiles = this.loadImagePaths(node_path_1.default.join(traderBasePath, 'images'));
        this.importQuestData(jsonQuestFiles, traderId);
        this.importQuestAssortData(jsonQuestAssortFiles, traderId);
        this.importLocaleData(traderId);
        this.importImageData(jsonImageFiles, traderId);
    }
    loadJsonFiles(directoryPath) {
        if (!this.directoryExists(directoryPath)) {
            return [];
        }
        const jsonData = [];
        const files = this.readDirectorySafe(directoryPath);
        for (const file of files) {
            const filePath = node_path_1.default.join(directoryPath, file);
            if (!this.isValidFile(filePath))
                continue;
            try {
                const content = node_fs_1.default.readFileSync(filePath, 'utf-8');
                jsonData.push(JSON.parse(content));
                this.logDebug(`Loaded JSON file: ${filePath}`, "green");
            }
            catch (error) {
                console.error(`Error parsing JSON from file ${filePath}: ${error}`, "red");
            }
        }
        return jsonData;
    }
    loadImagePaths(directoryPath) {
        if (!this.directoryExists(directoryPath)) {
            return [];
        }
        const imagePaths = [];
        const files = this.readDirectorySafe(directoryPath);
        for (const file of files) {
            const filePath = node_path_1.default.join(directoryPath, file);
            if (this.isValidFile(filePath)) {
                imagePaths.push(filePath);
                this.logDebug(`Found image file: ${filePath}`, "green");
            }
        }
        return imagePaths;
    }
    directoryExists(path) {
        if (!node_fs_1.default.existsSync(path)) {
            this.logDebug(`Directory not found: ${path}`, "red");
            return false;
        }
        return true;
    }
    readDirectorySafe(path) {
        try {
            return node_fs_1.default.readdirSync(path);
        }
        catch (error) {
            console.error(`Error reading directory ${path}: ${error}`);
            return [];
        }
    }
    isValidFile(filePath) {
        try {
            return node_fs_1.default.lstatSync(filePath).isFile();
        }
        catch (error) {
            console.error(`Error checking file ${filePath}: ${error}`);
            return false;
        }
    }
    logDebug(message, color) {
        if (this.instanceManager.debug) {
            this.instanceManager.colorLog(message, color ?? "green");
        }
    }
    importQuestZones(questZones, trader) {
        let zones = 0;
        for (const zone of questZones) {
            if (this.instanceManager.debug) {
                console.log(zone);
            }
            // biome-ignore lint/complexity/useLiteralKeys: <explanation>
            this.instanceManager.database.globals["QuestZones"].push(zone);
            zones++;
        }
        this.logDebug(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${zones} quest zones.`, LogTextColor_1.LogTextColor.GREEN);
    }
    importQuestData(jsonQuestFiles, trader) {
        if (Object.keys(jsonQuestFiles).length < 1) {
            this.logDebug(`[${this.instanceManager.modName}] QuestAPI:  ${trader} No quest files.`, LogTextColor_1.LogTextColor.RED);
            return;
        }
        this.logDebug(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loading ${Object.keys(jsonQuestFiles).length} quest files.`, LogTextColor_1.LogTextColor.GREEN);
        let questCount = 0;
        for (const file of jsonQuestFiles) {
            for (const quest in file) {
                this.instanceManager.database.templates.quests[quest] = file[quest];
                questCount++;
            }
        }
        this.logDebug(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${questCount} tasks.`, LogTextColor_1.LogTextColor.GREEN);
    }
    importQuestAssortData(jsonQuestAssortFiles, trader) {
        if (Object.keys(jsonQuestAssortFiles).length < 1) {
            this.logDebug(`[${this.instanceManager.modName}] QuestAPI:  ${trader} No quest files.`, LogTextColor_1.LogTextColor.RED);
            return;
        }
        this.logDebug(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loading ${Object.keys(jsonQuestAssortFiles).length} quest assort files.`, LogTextColor_1.LogTextColor.GREEN);
        let questAssortCount = 0;
        if (!this.instanceManager.database.traders[trader].questassort) {
            this.instanceManager.database.traders[trader].questassort = {};
        }
        for (const questAssorts of jsonQuestAssortFiles) {
            for (const questAssortKey in questAssorts) {
                const section = questAssorts[questAssortKey];
                if (!this.instanceManager.database.traders[trader].questassort[questAssortKey]) {
                    this.instanceManager.database.traders[trader].questassort[questAssortKey] = {};
                }
                Object.assign(this.instanceManager.database.traders[trader].questassort[questAssortKey], section);
                questAssortCount += Object.keys(section).length;
            }
        }
        this.logDebug(`[${this.instanceManager.modName}] QuestAPI: ${trader} Imported ${questAssortCount} quests into the database.`, LogTextColor_1.LogTextColor.GREEN);
    }
    importQuestSideConfig() {
        const questConfig = this.instanceManager.configServer.getConfig(ConfigTypes_1.ConfigTypes.QUEST);
        const questSideFile = node_fs_1.default.readFileSync(this.instanceManager.dbPath.concat("/Quests/QuestSideData.json"), "utf-8");
        const questSideJson = JSON.parse(questSideFile);
        this.logDebug(`[${this.instanceManager.modName}] QuestAPI:  ${questSideJson["UsecOnly"]}`, LogTextColor_1.LogTextColor.BLUE);
        for (const entry of questSideJson["UsecOnly"]) {
            questConfig.usecOnlyQuests.push(entry);
        }
        for (const entry of questSideJson["BearOnly"]) {
            questConfig.bearOnlyQuests.push(entry);
        }
    }
    importLocaleData(trader) {
        const localesDir = node_path_1.default.join(this.instanceManager.dbPath, 'Quests', trader, 'locales');
        // Validate directory exists
        if (!node_fs_1.default.existsSync(localesDir) || !node_fs_1.default.lstatSync(localesDir).isDirectory()) {
            this.logDebug(`[${this.instanceManager.modName}] QuestAPI: ${trader} No quest locale directory found.`, LogTextColor_1.LogTextColor.RED);
            return;
        }
        const localeFiles = node_fs_1.default.readdirSync(localesDir).filter(file => file.endsWith('.json'));
        if (localeFiles.length === 0) {
            this.logDebug(`[${this.instanceManager.modName}] QuestAPI: ${trader} No locale files found.`, LogTextColor_1.LogTextColor.RED);
            return;
        }
        this.logDebug(`[${this.instanceManager.modName}] QuestAPI: ${trader} Loading ${localeFiles.length} locale files.`, LogTextColor_1.LogTextColor.GREEN);
        let localeCount = 0;
        const customLocales = {};
        let fallback = {};
        // Step 1: Load all custom locales into dictionary
        for (const file of localeFiles) {
            const localeCode = node_path_1.default.basename(file, ".json");
            const filePath = node_path_1.default.join(localesDir, file);
            try {
                const data = JSON.parse(node_fs_1.default.readFileSync(filePath, "utf-8"));
                customLocales[localeCode] = data;
                // Store English as fallback
                if (localeCode === "en") {
                    fallback = data;
                }
            }
            catch (err) {
                console.error(`Failed to parse ${filePath}:`, err);
            }
        }
        // Ensure we have a fallback
        if (Object.keys(fallback).length === 0 && customLocales["en"]) {
            fallback = customLocales["en"];
        }
        // Step 2: Apply to database locales
        const globalLocales = this.instanceManager.database.locales.global;
        for (const localeCode of Object.keys(globalLocales)) {
            const localeData = globalLocales[localeCode];
            const customData = customLocales[localeCode] || fallback;
            for (const [key, value] of Object.entries(customData)) {
                // Only add if not already present to prevent duplicates
                if (!localeData[key]) {
                    localeData[key] = value;
                    localeCount++;
                }
                else if (this.instanceManager.debug) {
                    this.logDebug(`Skipping duplicate key: ${key} for locale ${localeCode}`, LogTextColor_1.LogTextColor.YELLOW);
                }
            }
        }
        this.logDebug(`[${this.instanceManager.modName}] QuestAPI: ${trader} Added ${localeCount} locale entries.`, LogTextColor_1.LogTextColor.GREEN);
    }
    importImageData(jsonImageFiles, trader) {
        let imageCount = 0;
        for (const imagePath of jsonImageFiles) {
            this.instanceManager.imageRouter.addRoute(`/files/quest/icon/${node_path_1.default.basename(imagePath, node_path_1.default.extname(imagePath))}`, imagePath);
            imageCount++;
        }
        this.logDebug(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${imageCount} images.`, LogTextColor_1.LogTextColor.GREEN);
    }
}
exports.QuestAPI = QuestAPI;
//# sourceMappingURL=QuestAPI.js.map