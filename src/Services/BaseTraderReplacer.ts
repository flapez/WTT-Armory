/* eslint-disable @typescript-eslint/naming-convention */
import type { WTTInstanceManager } from "../WTTInstanceManager";
import { traderIDs } from "../references/configConsts";
import * as fs from "node:fs";
import path from "node:path";
import type { ITrader } from "@spt/models/eft/common/tables/ITrader";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

export class BaseTraderReplacer 
{
    private instanceManager: WTTInstanceManager;

    public preSptLoad(instanceManager: WTTInstanceManager): void 
    {
        this.instanceManager = instanceManager;
    }

    public postDBLoad(): void 
    {
        this.instanceManager.logger.log(
            "Starting BaseTraderReplacer postDBLoad",
            LogTextColor.GREEN
        );

        const traderReplacementDir = path.join(
            __dirname,
            "../../db/BaseTraderReplacer"
        );

        if (!fs.existsSync(traderReplacementDir)) 
        {
            this.instanceManager.logger.log(
                "ERROR: Trader replacement directory does not exist.",
                LogTextColor.RED
            );
            return;
        }

        try 
        {
            const traderNames = fs.readdirSync(traderReplacementDir);

            for (const traderName of traderNames) 
            {
                this.instanceManager.logger.log(
                    `Replacing trader properties for ${traderName}:`,
                    LogTextColor.GREEN
                );

                const traderId = traderIDs[traderName.toUpperCase()];
                if (!traderId) 
                {
                    this.instanceManager.logger.log(
                        `Trader ${traderName} not found in trader IDs.`,
                        LogTextColor.RED
                    );
                    continue;
                }

                const trader: ITrader = this.instanceManager.database.traders[traderId];
                if (!trader) 
                {
                    this.instanceManager.logger.log(
                        `Trader ${traderId} not found in database.`,
                        LogTextColor.RED
                    );
                    continue;
                }

                const baseTraderDb: any = this.instanceManager.importerUtil.loadAsync(
                    path.join(__dirname, "../../db/BaseTraderReplacer/")
                );
                const traderData: any = baseTraderDb[traderName];

                const changedProperties = [];

                if (traderData) 
                {
                    if (this.instanceManager.debug) 
                    {
                        this.instanceManager.logger.log(
                            `Found trader data ${traderData}:`,
                            LogTextColor.GREEN
                        );
                    }

                    if (traderData.assort) 
                    {
                        if (this.instanceManager.debug) 
                        {
                            this.instanceManager.logger.log(
                                `Replacing assort for trader ${traderId}: ${traderData.assort}`,
                                LogTextColor.GREEN
                            );
                        }
                        trader.assort = traderData.assort;
                        changedProperties.push("assort");
                    }
                    if (traderData.dialogue) 
                    {
                        if (this.instanceManager.debug) 
                        {
                            this.instanceManager.logger.log(
                                `Replacing dialogue for trader ${traderId}: ${traderData.dialogue}`,
                                LogTextColor.GREEN
                            );
                        }
                        trader.dialogue = traderData.dialogue;
                        changedProperties.push("dialogue");
                    }
                    if (traderData.questassort) 
                    {
                        if (this.instanceManager.debug) 
                        {
                            this.instanceManager.logger.log(
                                `Replacing quest assort for trader ${traderId}: ${traderData.questassort}`,
                                LogTextColor.GREEN
                            );
                        }
                        trader.questassort = traderData.questassort;
                        changedProperties.push("questassort");
                    }
                    if (traderData.suits) 
                    {
                        if (this.instanceManager.debug) 
                        {
                            this.instanceManager.logger.log(
                                `Replacing suits for trader ${traderId}: ${traderData.suits}`,
                                LogTextColor.GREEN
                            );
                        }
                        trader.suits = traderData.suits;
                        if (traderData.usecsuits) 
                        {
                            if (this.instanceManager.debug) 
                            {
                                this.instanceManager.logger.log(
                                    `Adding USEC suits for trader ${traderId}: ${traderData.usecsuits}`,
                                    LogTextColor.GREEN
                                );
                            }
                            trader.suits = { ...trader.suits, ...traderData.usecsuits };
                            changedProperties.push("usecsuits");
                        }
                        if (traderData.bearsuits) 
                        {
                            if (this.instanceManager.debug) 
                            {
                                this.instanceManager.logger.log(
                                    `Adding BEAR suits for trader ${traderId}: ${traderData.bearsuits}`,
                                    LogTextColor.GREEN
                                );
                            }
                            trader.suits = { ...trader.suits, ...traderData.bearsuits };
                            changedProperties.push("bearsuits");
                        }
                    }
                }

                if (changedProperties.length > 0) 
                {
                    this.instanceManager.logger.log(
                        `Replaced properties for trader ${traderId}: ${changedProperties.join(
                            ", "
                        )}`,
                        LogTextColor.GREEN
                    );
                }
                else 
                {
                    this.instanceManager.logger.log(
                        `No properties were replaced for trader ${traderId}.`,
                        LogTextColor.GREEN
                    );
                }
            }
        }
        catch (error) 
        {
            console.log("Error loading trader files:", error);
        }
    }
}
