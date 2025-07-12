/* eslint-disable @typescript-eslint/naming-convention */
import * as path from "node:path";
import * as fs from "node:fs";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { QuestZone } from "../references/configConsts";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import type { IQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import type { WTTInstanceManager } from "./WTTInstanceManager";

export class QuestAPI 
{
    private instanceManager: WTTInstanceManager;
    private dbPath: string;
    /**
     * Call inside traders preSptLoad method.
     * 
     * @param {ILogger} logger    Logger
     * @param {string}  mod       mod name
     * @return {void}             
     */
    public preSptLoad(Instance: WTTInstanceManager): void
    {
        this.instanceManager = Instance;
    }

    public postDBLoad(): void {
        this.importQuestSideConfig();
        const questsBasePath = path.join(this.instanceManager.dbPath, 'Quests');
        this.loadAllTraderQuests(questsBasePath);
    }
    
    private loadAllTraderQuests(basePath: string): void {
        const traderDirs = fs.readdirSync(basePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    
        for (const traderId of traderDirs) {
            this.loadQuestsFromDirectory(traderId);
        }
    }
    
    public loadQuestsFromDirectory(traderId: string): void {
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
    
    private loadJsonFiles(directoryPath: string): any[] {
        if (!this.directoryExists(directoryPath)) {
            return [];
        }
    
        const jsonData = [];
        const files = this.readDirectorySafe(directoryPath);
    
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            if (!this.isValidFile(filePath)) continue;
    
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                jsonData.push(JSON.parse(content));
                this.logDebug(`Loaded JSON file: ${filePath}`);
            } catch (error) {
                console.error(`Error parsing JSON from file ${filePath}: ${error}`);
            }
        }
        
        return jsonData;
    }
    
    private loadImagePaths(directoryPath: string): string[] {
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
    
    private directoryExists(path: string): boolean {
        if (!fs.existsSync(path)) {
            this.logDebug(`Directory not found: ${path}`);
            return false;
        }
        return true;
    }
    
    private readDirectorySafe(path: string): string[] {
        try {
            return fs.readdirSync(path);
        } catch (error) {
            console.error(`Error reading directory ${path}: ${error}`);
            return [];
        }
    }
    
    private isValidFile(filePath: string): boolean {
        try {
            return fs.lstatSync(filePath).isFile();
        } catch (error) {
            console.error(`Error checking file ${filePath}: ${error}`);
            return false;
        }
    }
    
    private logDebug(message: string): void {
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
    public importQuestZones(questZones: QuestZone[], trader: string): void 
    {
        let zones = 0;
        for (const zone of questZones)
        {
            if (this.instanceManager.debug)
            {
                console.log(zone);
            }
            // biome-ignore lint/complexity/useLiteralKeys: <explanation>
            this.instanceManager.database.globals["QuestZones"].push(zone);
            zones++;
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${zones} quest zones.`, LogTextColor.GREEN);
    }

    /**
     * Import Quest data from json files
     */
    private importQuestData(jsonQuestFiles: any[], trader: string): void
    {
        if (Object.keys(jsonQuestFiles).length < 1)
        {
            this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} No quest files.`, LogTextColor.RED); 
            return;
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loading ${Object.keys(jsonQuestFiles).length} quest files.`, LogTextColor.GREEN);
        
        // Import quest data to the database
        let questCount = 0;
        for (const file of jsonQuestFiles)
        {
            for (const quest in file)
            {
                this.instanceManager.database.templates.quests[quest] = file[quest];
                questCount++;
            }           
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${questCount} tasks.`, LogTextColor.GREEN);      
    }

    private importQuestAssortData(jsonQuestAssortFiles: any[], trader: string): void {
        if (Object.keys(jsonQuestAssortFiles).length < 1) {
            this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} No quest files.`, LogTextColor.RED);
            return;
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loading ${Object.keys(jsonQuestAssortFiles).length} quest assort files.`, LogTextColor.GREEN);
    
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
    
                Object.assign(
                    this.instanceManager.database.traders[trader].questassort[questAssortKey],
                    section
                );
    
                questAssortCount += Object.keys(section).length;
            }
        }
    
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI: ${trader} Imported ${questAssortCount} quests into the database.`, LogTextColor.GREEN);
    }

    /**
     * Import Quest side data into the config server
     */
    private importQuestSideConfig(): void 
    {
        const questConfig = this.instanceManager.configServer.getConfig<IQuestConfig>(ConfigTypes.QUEST)
        const questSideFile = fs.readFileSync(this.instanceManager.dbPath.concat("/Quests/QuestSideData.json"), "utf-8");
        const questSideJson = JSON.parse(questSideFile);

        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${questSideJson["UsecOnly"]}`, LogTextColor.BLUE);

        for (const entry of questSideJson["UsecOnly"])
        {
            questConfig.usecOnlyQuests.push(entry);
        }

        for (const entry of questSideJson["BearOnly"])
        {
            questConfig.bearOnlyQuests.push(entry);
        }
    }

    /**
     * Import locale data into the database
     */
    private importLocaleData(jsonLocaleFiles: any[], trader: string): void
    {
        if (Object.keys(jsonLocaleFiles).length < 1)
        {
            this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} No quest locale files.`, LogTextColor.RED); 
            return;
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loading ${Object.keys(jsonLocaleFiles).length} locale files.`, LogTextColor.GREEN);

        // Import quest locales to the database
        let localeCount = 0;
        for (const file of jsonLocaleFiles)
        {
            for (const locale in file)
            {
                this.instanceManager.database.locales.global["en"][locale] = file[locale]
                localeCount++;
            }           
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${localeCount} locales.`, LogTextColor.GREEN);
    }

    /**
     * Set up routes for image data
     */
    private importImageData(jsonImageFiles: any[], trader: string): void
    {
        let imageCount = 0;
        for (const imagePath of jsonImageFiles)
        {
            this.instanceManager.imageRouter.addRoute(`/files/quest/icon/${path.basename(imagePath, path.extname(imagePath))}`, imagePath);
            imageCount++;
        }
        this.instanceManager.logger.log(`[${this.instanceManager.modName}] QuestAPI:  ${trader} Loaded ${imageCount} images.`, LogTextColor.GREEN);
    }
}