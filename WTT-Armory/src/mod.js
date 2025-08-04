"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const WTTInstanceManager_1 = require("./Services/WTTInstanceManager");
const CustomItemService_1 = require("./Services/CustomItemService");
const CustomAssortSchemeService_1 = require("./Services/CustomAssortSchemeService");
const QuestAPI_1 = require("./Services/QuestAPI");
const CustomLootspawnService_1 = require("./Services/CustomLootspawnService");
const CustomBotLoadoutService_1 = require("./Services/CustomBotLoadoutService");
const WTTBot_1 = require("./ChatBot/WTTBot");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
class WTTArmory {
    instanceManager = new WTTInstanceManager_1.WTTInstanceManager();
    modName = "WTT-Armory";
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
        this.displayCreditBanner();
        this.customItemService.preSptLoad(this.instanceManager);
        this.customAssortSchemeService.preSptLoad(this.instanceManager);
        this.questAPI.preSptLoad(this.instanceManager);
        this.customLootspawnService.preSptLoad(this.instanceManager);
        this.customBotLoadoutService.preSptLoad(this.instanceManager);
        // Chatbot
        container.register("WTTBot", WTTBot_1.WTTBot);
        const wttBot = container.resolve("WTTBot");
        // Hook up to friend/list route to send welcome gift
        this.instanceManager.staticRouter.registerStaticRouter("WTTBotWelcomeGiftPeeking", [
            {
                url: "/client/friend/list",
                action: async (url, info, sessionId, output) => {
                    const profile = this.instanceManager.profileHelper.getProfileByPmcId(sessionId);
                    if (profile["WTT"] == null) {
                        profile["WTT"] = {};
                        profile["WTT"]["HasReceivedWelcomeGift"] = false;
                        wttBot.sendWelcomeGift(sessionId, this.instanceManager);
                        profile["WTT"]["HasReceivedWelcomeGift"] = true;
                    }
                    else {
                        if (!profile["WTT"]["HasReceivedWelcomeGift"]) {
                            wttBot.sendWelcomeGift(sessionId, this.instanceManager);
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
        // Chatbot
        const myChatBot = container.resolve("WTTBot");
        container.resolve("DialogueController").registerChatBot(myChatBot);
        const coreConfig = container.resolve("ConfigServer").getConfig(ConfigTypes_1.ConfigTypes.CORE);
        const myChatBotInfo = myChatBot.getChatBot();
        coreConfig.features.chatbotFeatures.ids[myChatBotInfo.Info.Nickname] = myChatBotInfo._id;
        coreConfig.features.chatbotFeatures.enabledBots[myChatBotInfo._id] = true;
        // Services
        this.customItemService.postDBLoad();
        this.customAssortSchemeService.postDBLoad();
        this.questAPI.postDBLoad();
        this.customLootspawnService.postDBLoad();
        this.customBotLoadoutService.postDBLoad();
        // Locales
        //this.handleLocales();
    }
    handleLocales() {
        const locales = this.instanceManager.database.locales.global;
        const WTTLocalesDir = node_path_1.default.join(__dirname, "..", "db", "locales");
        const WTTLocales = {};
        const WTTlocaleFiles = node_fs_1.default.readdirSync(WTTLocalesDir);
        for (const file of WTTlocaleFiles) {
            if (!file.endsWith(".json"))
                continue;
            const localeCode = node_path_1.default.basename(file, ".json");
            const filePath = node_path_1.default.join(WTTLocalesDir, file);
            try {
                const data = JSON.parse(node_fs_1.default.readFileSync(filePath, "utf-8"));
                WTTLocales[localeCode] = data;
            }
            catch (err) {
                console.warn(`Failed to parse ${file}:`, err);
            }
        }
        const fallback = WTTLocales["en"] ?? {};
        for (const locale of Object.keys(locales)) {
            const customLocale = WTTLocales[locale] ?? fallback;
            for (const [key, value] of Object.entries(customLocale)) {
                locales[locale][key] = value;
            }
        }
    }
    displayCreditBanner() {
        this.instanceManager.colorLog(`[${this.modName}] Forged by the creators of WTT & allies — arm yourself accordingly.`, "green");
    }
}
module.exports = { mod: new WTTArmory() };
//# sourceMappingURL=mod.js.map