"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestAPI = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
class QuestAPI {
    instanceManager;
    dbPath;
    /**
     * Call inside traders preSptLoad method.
     *
     * @param {ILogger} logger    Logger
     * @param {string}  mod       mod name
     * @return {void}
     */
    preSptLoad(Instance) {
        this.instanceManager = Instance;
    }
    postDBLoad() {
        this.importQuestSideConfig();
        const questsBasePath = path.join(this.instanceManager.dbPath, 'Quests');
        this.loadAllTraderQuests(questsBasePath);
    }
    loadAllTraderQuests(basePath) {
        const traderDirs = fs.readdirSync(basePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        for (const traderId of traderDirs) {
            this.loadQuestsFromDirectory(traderId);
        }
    }
    loadQuestsFromDirectory(traderId) {
        const traderBasePath = path.join(this.instanceManager.dbPath, 'Quests', traderId);
        const jsonQuestFiles = this.loadJsonFiles(path.join(traderBasePath));
        const jsonQuestAssortFiles = this.loadJsonFiles(path.join(traderBasePath, 'questAssort'));
        const jsonLocaleFiles = this.loadJsonFiles(path.join(traderBasePath, 'locales'));
        const jsonImageFiles = this.loadImagePaths(path.join(traderBasePath, 'images'));
        this.importQuestData(jsonQuestFiles, traderId);
        this.importQuestAssortData(jsonQuestAssortFiles, traderId);
        this.importLocaleData(jsonLocaleFiles, traderId);
        this.importImageData(jsonImageFiles, traderId);
    }
    loadJsonFiles(directoryPath) {
        if (!this.directoryExists(directoryPath)) {
            return [];
        }
        const jsonData = [];
        const files = this.readDirectorySafe(directoryPath);
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            if (!this.isValidFile(filePath))
                continue;
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                jsonData.push(JSON.parse(content));
                this.logDebug(`Loaded JSON file: ${filePath}`);
            }
            catch (error) {
                console.error(`Error parsing JSON from file ${filePath}: ${error}`);
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
            const filePath = path.join(directoryPath, file);
            if (this.isValidFile(filePath)) {
                imagePaths.push(filePath);
                this.logDebug(`Found image file: ${filePath}`);
            }
        }
        return imagePaths;
    }
    directoryExists(path) {
        if (!fs.existsSync(path)) {
            this.logDebug(`Directory not found: ${path}`);
            return false;
        }
        return true;
    }
    readDirectorySafe(path) {
        try {
            return fs.readdirSync(path);
        }
        catch (error) {
            console.error(`Error reading directory ${path}: ${error}`);
            return [];
        }
    }
    isValidFile(filePath) {
        try {
            return fs.lstatSync(filePath).isFile();
        }
        catch (error) {
            console.error(`Error checking file ${filePath}: ${error}`);
            return false;
        }
    }
    logDebug(message) {
        if (this.instanceManager.debug) {
            console.log(message);
        }
    }
    /**
     * Import quest zones.
     *
     * @param {QuestZone} questZones     Trader to load quests zones for.
     * @return {void}                    Returns nothing
     */
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
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${zones} quest zones.`, LogTextColor_1.LogTextColor.GREEN);
    }
    /**
     * Import Quest data from json files
     */
    importQuestData(jsonQuestFiles, trader) {
        if (Object.keys(jsonQuestFiles).length < 1) {
            this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} No quest files.`, LogTextColor_1.LogTextColor.RED);
            return;
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loading ${Object.keys(jsonQuestFiles).length} quest files.`, LogTextColor_1.LogTextColor.GREEN);
        // Import quest data to the database
        let questCount = 0;
        for (const file of jsonQuestFiles) {
            for (const quest in file) {
                this.instanceManager.database.templates.quests[quest] = file[quest];
                questCount++;
            }
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${questCount} tasks.`, LogTextColor_1.LogTextColor.GREEN);
    }
    importQuestAssortData(jsonQuestAssortFiles, trader) {
        if (Object.keys(jsonQuestAssortFiles).length < 1) {
            this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} No quest files.`, LogTextColor_1.LogTextColor.RED);
            return;
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loading ${Object.keys(jsonQuestAssortFiles).length} quest assort files.`, LogTextColor_1.LogTextColor.GREEN);
        let questAssortCount = 0;
        // Ensure questassort exists
        if (!this.instanceManager.database.traders[trader].questassort) {
            this.instanceManager.database.traders[trader].questassort = {};
        }
        for (const questAssorts of jsonQuestAssortFiles) {
            for (const questAssortKey in questAssorts) {
                const section = questAssorts[questAssortKey];
                // Initialize questassort sub-object if missing
                if (!this.instanceManager.database.traders[trader].questassort[questAssortKey]) {
                    this.instanceManager.database.traders[trader].questassort[questAssortKey] = {};
                }
                Object.assign(this.instanceManager.database.traders[trader].questassort[questAssortKey], section);
                questAssortCount += Object.keys(section).length;
            }
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI: ${trader} Imported ${questAssortCount} quests into the database.`, LogTextColor_1.LogTextColor.GREEN);
    }
    /**
     * Import Quest side data into the config server
     */
    importQuestSideConfig() {
        const questConfig = this.instanceManager.configServer.getConfig(ConfigTypes_1.ConfigTypes.QUEST);
        const questSideFile = fs.readFileSync(this.instanceManager.dbPath.concat("/Quests/QuestSideData.json"), "utf-8");
        const questSideJson = JSON.parse(questSideFile);
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${questSideJson["UsecOnly"]}`, LogTextColor_1.LogTextColor.BLUE);
        for (const entry of questSideJson["UsecOnly"]) {
            questConfig.usecOnlyQuests.push(entry);
        }
        for (const entry of questSideJson["BearOnly"]) {
            questConfig.bearOnlyQuests.push(entry);
        }
    }
    /**
     * Import locale data into the database
     */
    importLocaleData(jsonLocaleFiles, trader) {
        if (Object.keys(jsonLocaleFiles).length < 1) {
            this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} No quest locale files.`, LogTextColor_1.LogTextColor.RED);
            return;
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loading ${Object.keys(jsonLocaleFiles).length} locale files.`, LogTextColor_1.LogTextColor.GREEN);
        // Import quest locales to the database
        let localeCount = 0;
        for (const file of jsonLocaleFiles) {
            for (const locale in file) {
                this.instanceManager.database.locales.global["en"][locale] = file[locale];
                localeCount++;
            }
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${localeCount} locales.`, LogTextColor_1.LogTextColor.GREEN);
    }
    /**
     * Set up routes for image data
     */
    importImageData(jsonImageFiles, trader) {
        let imageCount = 0;
        for (const imagePath of jsonImageFiles) {
            this.instanceManager.imageRouter.addRoute(`/files/quest/icon/${path.basename(imagePath, path.extname(imagePath))}`, imagePath);
            imageCount++;
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${imageCount} images.`, LogTextColor_1.LogTextColor.GREEN);
    }
}
exports.QuestAPI = QuestAPI;
//# sourceMappingURL=QuestAPI.js.map