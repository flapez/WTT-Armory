/* eslint-disable @typescript-eslint/naming-convention */

import * as fs from "node:fs";
import * as path from "node:path";

import type { DependencyContainer } from "tsyringe";
import type { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import type { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import type { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

// WTT imports
import { WTTInstanceManager } from "./WTTInstanceManager";
import { CustomItemService } from "./Services/CustomItemService";
import { BaseTraderReplacer } from "./Services/BaseTraderReplacer";
import { CustomImageReplacer } from "./Services/CustomImageReplacer";




// Trader imports
import { TraderAPI } from "./Services/TraderAPI";
import { TraderQuestReplacer } from "./Traders/TraderQuestReplacer";

class WTTArmory
implements IPreSptLoadMod, IPostSptLoadMod, IPostDBLoadMod 
{
    private instanceManager: WTTInstanceManager = new WTTInstanceManager();
    private version: string;
    private modName = "WTT-Armory";

    // Initialize class objects here.
     private traderApi: TraderAPI = new TraderAPI();


    private customItemService: CustomItemService = new CustomItemService();
    private traderQuestReplacer: TraderQuestReplacer = new TraderQuestReplacer();
    private baseTraderReplacer: BaseTraderReplacer = new BaseTraderReplacer();
    private customImageReplacer: CustomImageReplacer = new CustomImageReplacer();
    //#endregion

    //#region DEV
    // Toggle to disable pathToTarkov for development purposes to regain access to all traders
    // Requires a new profile if you disable it to regain access to traders.
    debug = false;
    //#endregion

    // Anything that needs done on PreSptLoad, place here.
    public preSptLoad(container: DependencyContainer): void 
    {
        // Initialize the instance manager DO NOTHING ELSE BEFORE THIS
        this.instanceManager.preSptLoad(container, this.modName);
        this.instanceManager.debug = this.debug;
        // EVERYTHING AFTER HERE MUST USE THE INSTANCE

        this.getVersionFromJson();
        this.displayCreditBanner();



        // WTT Services
        this.customItemService.preSptLoad(this.instanceManager);
        this.customImageReplacer.preSptLoad(this.instanceManager);
        this.baseTraderReplacer.preSptLoad(this.instanceManager);

    }

    // Anything that needs done on postSptLoad, place here.
    public postSptLoad(): void 
    {}

    // Anything that needs done on postDBLoad, place here.
    postDBLoad(container: DependencyContainer): void 
    {
        // Initialize the instance manager DO NOTHING ELSE BEFORE THIS
        this.instanceManager.postDBLoad(container);
        // EVERYTHING AFTER HERE MUST USE THE INSTANCE
        this.customItemService.postDBLoad();
        this.baseTraderReplacer.postDBLoad();
        this.customImageReplacer.postDBLoad();
        this.traderQuestReplacer.postDBLoad(this.instanceManager);




        this.lateChanges();
        this.instanceManager.colorLog(
            `[${this.modName}] Database: Loading complete.`,
            LogTextColor.GREEN
        );
    }

    private lateChanges(): void 
    {
        this.instanceManager.database.globals.config.Aiming.RecoilCrank = true;
    }

    private getVersionFromJson(): void 
    {
        const packageJsonPath = path.join(__dirname, "../package.json");

        fs.readFile(packageJsonPath, "utf-8", (err, data) => 
        {
            if (err) 
            {
                console.error("Error reading file:", err);
                return;
            }

            const jsonData = JSON.parse(data);
            this.version = jsonData.version;
        });
    }

    private displayCreditBanner(): void 
    {
        this.instanceManager.colorLog(
            `[${this.modName}] A Compendium of Weapon Mods made by the WTT Team & friends`,
            LogTextColor.GREEN
        );
    }
}

module.exports = { mod: new WTTArmory() };
