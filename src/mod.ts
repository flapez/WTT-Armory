/* eslint-disable @typescript-eslint/naming-convention */

import fs, { truncate } from "node:fs";
import path from "node:path";
import type { DependencyContainer } from "tsyringe";
import type { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import type { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { WTTInstanceManager } from "./WTTInstanceManager";
import { CustomItemService } from "./CustomItemService";
import { CustomAssortSchemeService } from "./CustomAssortSchemeService";
import { QuestAPI } from "./QuestAPI";
import { CustomLootspawnService } from "./CustomLootspawnService";
import { CustomBotLoadoutService } from "./CustomBotLoadoutService";
import { WTTBot } from "./ChatBot/WTTBot";
import { DialogueController } from "@spt/controllers/DialogueController";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ICoreConfig } from "@spt/models/spt/config/ICoreConfig";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";

class WTTArmory
implements IPreSptLoadMod, IPostDBLoadMod
{
    private instanceManager: WTTInstanceManager = new WTTInstanceManager();
    private version: string;
    private modName = "WTTArmory";
    private customItemService: CustomItemService = new CustomItemService();
    private customAssortSchemeService: CustomAssortSchemeService = new CustomAssortSchemeService();
    private questAPI: QuestAPI = new QuestAPI();
    private customLootspawnService: CustomLootspawnService = new CustomLootspawnService();
    private customBotLoadoutService: CustomBotLoadoutService = new CustomBotLoadoutService();
    debug = false;

    // Anything that needs done on preSptLoad, place here.
    public preSptLoad(container: DependencyContainer): void 
    {
        this.instanceManager.preSptLoad(container, this.modName);
        this.instanceManager.debug = this.debug;
    
        this.getVersionFromJson();
        this.displayCreditBanner();
    
        this.customItemService.preSptLoad(this.instanceManager);
        this.customAssortSchemeService.preSptLoad(this.instanceManager);
        this.questAPI.preSptLoad(this.instanceManager);
        this.customLootspawnService.preSptLoad(this.instanceManager);
        this.customBotLoadoutService.preSptLoad(this.instanceManager);
    
        // Register and resolve WTTBot early
        container.register<WTTBot>("WTTBot", WTTBot);
        const wttBot = container.resolve<WTTBot>("WTTBot");
    
        // Hook up to friend route to send welcome gift
        this.instanceManager.staticRouter.registerStaticRouter(
            "WTTBotWelcomeGiftPeeking",
            [
                {
                    url: "/client/friend/list",
                    action: async (url, info, sessionId, output) =>
                    {
                        const profile = this.instanceManager.profileHelper.getProfileByPmcId(sessionId);
                        if (profile["WTT"] == null)
                        {
                            profile["WTT"] = {};
                            profile["WTT"]["HasReceivedWelcomeGift"] = false;
                            wttBot.sendWelcomeGift(sessionId, this.instanceManager); // use the resolved bot here
                            profile["WTT"]["HasReceivedWelcomeGift"] = true;
                        }
                        else
                        {
                            if (!profile["WTT"]["HasReceivedWelcomeGift"])
                            {
                                wttBot.sendWelcomeGift(sessionId, this.instanceManager); // use the resolved bot here
                                profile["WTT"]["HasReceivedWelcomeGift"] = true;
                            }
                        }
                        return output;
                    }
                }
            ],
            "spt"
        );
    }
    

    // Anything that needs done on postDBLoad, place here.
    public postDBLoad(container: DependencyContainer): void 
    {
        this.instanceManager.postDBLoad(container);
    
        const myChatBot = container.resolve<WTTBot>("WTTBot");
        const myChatBotId = myChatBot.getChatBot()._id;
        const myChatBotNickname = myChatBot.getChatBot().Info.Nickname;
        container.resolve<DialogueController>("DialogueController").registerChatBot(myChatBot);

        const locales = this.instanceManager.database.locales.global;

        for (const locale of Object.keys(locales))
        {
            locales[locale][`${myChatBotId} Nickname`] = myChatBotNickname;
        }
        
        const coreConfig = container.resolve<ConfigServer>("ConfigServer").getConfig<ICoreConfig>(ConfigTypes.CORE);
        const myChatBotInfo = myChatBot.getChatBot();
        coreConfig.features.chatbotFeatures.ids[myChatBotInfo.Info.Nickname] = myChatBotInfo._id;
        coreConfig.features.chatbotFeatures.enabledBots[myChatBotInfo._id] = true;
    
        this.customItemService.postDBLoad();
        this.customAssortSchemeService.postDBLoad();
        this.questAPI.postDBLoad();
        this.customLootspawnService.postDBLoad();
        this.customBotLoadoutService.postDBLoad();
    
        this.instanceManager.colorLog(
            `[${this.modName}] Database: Loading complete.`,
            LogTextColor.GREEN
        );
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
        this.instanceManager.colorLog
        (`[${this.modName}] A Compendium of Weapon Mods made by the WTT Team & friends`, "green");
    }
}

module.exports = { mod: new WTTArmory() };
