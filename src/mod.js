"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
const WTTInstanceManager_1 = require("./WTTInstanceManager");
const CustomItemService_1 = require("./CustomItemService");
const CustomAssortSchemeService_1 = require("./CustomAssortSchemeService");
const QuestAPI_1 = require("./QuestAPI");
const CustomLootspawnService_1 = require("./CustomLootspawnService");
const CustomBotLoadoutService_1 = require("./CustomBotLoadoutService");
const WTTBot_1 = require("./ChatBot/WTTBot");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
class WTTArmory {
    instanceManager = new WTTInstanceManager_1.WTTInstanceManager();
    version;
    modName = "WTTArmory";
    customItemService = new CustomItemService_1.CustomItemService();
    customAssortSchemeService = new CustomAssortSchemeService_1.CustomAssortSchemeService();
    questAPI = new QuestAPI_1.QuestAPI();
    customLootspawnService = new CustomLootspawnService_1.CustomLootspawnService();
    customBotLoadoutService = new CustomBotLoadoutService_1.CustomBotLoadoutService();
    debug = false;
    // Anything that needs done on preSptLoad, place here.
    preSptLoad(container) {
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
        container.register("WTTBot", WTTBot_1.WTTBot);
        const wttBot = container.resolve("WTTBot");
        // Hook up to friend route to send welcome gift
        this.instanceManager.staticRouter.registerStaticRouter("WTTBotWelcomeGiftPeeking", [
            {
                url: "/client/friend/list",
                action: async (url, info, sessionId, output) => {
                    const profile = this.instanceManager.profileHelper.getProfileByPmcId(sessionId);
                    if (profile["WTT"] == null) {
                        profile["WTT"] = {};
                        profile["WTT"]["HasReceivedWelcomeGift"] = false;
                        wttBot.sendWelcomeGift(sessionId, this.instanceManager); // use the resolved bot here
                        profile["WTT"]["HasReceivedWelcomeGift"] = true;
                    }
                    else {
                        if (!profile["WTT"]["HasReceivedWelcomeGift"]) {
                            wttBot.sendWelcomeGift(sessionId, this.instanceManager); // use the resolved bot here
                            profile["WTT"]["HasReceivedWelcomeGift"] = true;
                        }
                    }
                    return output;
                }
            }
        ], "spt");
    }
    // Anything that needs done on postDBLoad, place here.
    postDBLoad(container) {
        this.instanceManager.postDBLoad(container);
        const myChatBot = container.resolve("WTTBot");
        const myChatBotId = myChatBot.getChatBot()._id;
        const myChatBotNickname = myChatBot.getChatBot().Info.Nickname;
        container.resolve("DialogueController").registerChatBot(myChatBot);
        const locales = this.instanceManager.database.locales.global;
        for (const locale of Object.keys(locales)) {
            locales[locale][`${myChatBotId} Nickname`] = myChatBotNickname;
        }
        const coreConfig = container.resolve("ConfigServer").getConfig(ConfigTypes_1.ConfigTypes.CORE);
        const myChatBotInfo = myChatBot.getChatBot();
        coreConfig.features.chatbotFeatures.ids[myChatBotInfo.Info.Nickname] = myChatBotInfo._id;
        coreConfig.features.chatbotFeatures.enabledBots[myChatBotInfo._id] = true;
        this.customItemService.postDBLoad();
        this.customAssortSchemeService.postDBLoad();
        this.questAPI.postDBLoad();
        this.customLootspawnService.postDBLoad();
        this.customBotLoadoutService.postDBLoad();
        this.instanceManager.colorLog(`[${this.modName}] Database: Loading complete.`, LogTextColor_1.LogTextColor.GREEN);
    }
    getVersionFromJson() {
        const packageJsonPath = node_path_1.default.join(__dirname, "../package.json");
        node_fs_1.default.readFile(packageJsonPath, "utf-8", (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return;
            }
            const jsonData = JSON.parse(data);
            this.version = jsonData.version;
        });
    }
    displayCreditBanner() {
        this.instanceManager.colorLog(`[${this.modName}] A Compendium of Weapon Mods made by the WTT Team & friends`, "green");
    }
}
module.exports = { mod: new WTTArmory() };
//# sourceMappingURL=mod.js.map