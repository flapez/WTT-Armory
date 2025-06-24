/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-const */
import type { TraderController } from "@spt/controllers/TraderController";
import * as traderAssortConfig from "../../config/traderAssortConfig.json";
import type { WTTInstanceManager } from "../WTTInstanceManager";
import { generateItemID, getRandomNumberInRange } from "../Utils/random";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import path from "node:path";



export class TraderAssortService 
{
    private instanceManager: WTTInstanceManager;
    private configTraders;


    private traderLastRestock = {
        "5a7c2eca46aef81a7ca2145d": -827779200,
        "58330581ace78e27b8b10cee": -776799600,
        "5935c25fb3acc3127c3d8cd9": -873836400,
        "54cb57776803fa99248b456e": -1609377600,
        "54cb50c76803fa8b248b4571": 626572800,
        "5c0647fdd443bc2504c2d371": 167574000,
        "5ac3b934156ae10c4430e83c": 1000166400,
        "6617beeaa9cfa777ca915b7c": 3462323452,
        "Chemist": -1783200000,
        "Conductor": -1585267200,
        "Courier": -946771200,
        "Crow": -778291200,
        "GoblinKing": -608236800,
        "JunkDealer": -518832000,
        "Warden": -145272000,
        "Wolf": 166723200
    }

    private traderIDs = {
        mechanic: "5a7c2eca46aef81a7ca2145d",
        skier: "58330581ace78e27b8b10cee",
        peacekeeper: "5935c25fb3acc3127c3d8cd9",
        therapist: "54cb57776803fa99248b456e",
        prapor: "54cb50c76803fa8b248b4571",
        jaeger: "5c0647fdd443bc2504c2d371",
        ragman: "5ac3b934156ae10c4430e83c",
        chemist: "Chemist",
        conductor: "Conductor",
        courier: "Courier",
        crow: "Crow",
        goblin: "GoblinKing",
        junk_dealer: "JunkDealer",
        warden: "Warden",
        wolf: "Wolf"
    };

    private traderNames = {
        "5a7c2eca46aef81a7ca2145d": "mechanic",
        "58330581ace78e27b8b10cee": "skier",
        "5935c25fb3acc3127c3d8cd9": "peacekeeper",
        "54cb57776803fa99248b456e": "therapist",
        "54cb50c76803fa8b248b4571": "prapor",
        "5c0647fdd443bc2504c2d371": "jaeger",
        "5ac3b934156ae10c4430e83c": "ragman",
        "Chemist": "chemist",
        "Conductor": "conductor",
        "Courier": "courier",
        "Crow": "crow",
        "GoblinKing": "goblin",
        "JunkDealer": "junk_dealer",
        "Warden": "warden",
        "Wolf": "wolf"
    };

    private disabled_traders = {
        "6617beeaa9cfa777ca915b7c": "ref",
        ref: "6617beeaa9cfa777ca915b7c"
    }

    private currencyIDs = {
        roubles: "5449016a4bdc2d6f028b456f",
        euros: "569668774bdc2da2298b4568",
        dollars: "5696686a4bdc2da3298b456a"
    };

    public preSptLoad(instanceManager: WTTInstanceManager): void 
    {
        if (!traderAssortConfig.use_random_assort) 
        {
            return
        }
        this.instanceManager = instanceManager
        this.monkeyPatchTraderAssortHelper()
    }

    /**
     * Listen in for calls to TraderController.update then check if the vendor assortments have expired.
     */
    private monkeyPatchTraderAssortHelper(): void 
    {
        this.instanceManager.container.afterResolution("TraderController", (_, result: TraderController) => 
        {
            const originalMethod = result.update;
            result.update = (): boolean => 
            {
                const returnValue = originalMethod.apply(result);
                this.CheckIfExpired();
                return returnValue;
            }
        });
    }

    public postDBLoad(): void 
    {
        if (!traderAssortConfig.use_random_assort) 
        {
            return
        }
        this.instanceManager.logger.log(
            "Starting TraderAssortService postDBLoad",
            LogTextColor.GREEN
        );
        this.configTraders = this.instanceManager.configServer.getConfigByString("aki-trader");
        // this.tables = this.databaseServer.getTables();

        this.instanceManager.logger.log("starting to initialize", LogTextColor.YELLOW)
        this.InitialTradersSetup()

        this.instanceManager.logger.log(
            "Trade wisely, barter boldly, and remember: one mans's junk is another's treasure!",
            LogTextColor.GREEN
        );
    }

    /**
     * Setup the trader assorts at server start
     */
    private InitialTradersSetup(): void 
    {
        for (const traderName in this.traderIDs) 
        {
            if (Object.prototype.hasOwnProperty.call(this.traderIDs, traderName)) 
            {
                const traderTable = this.instanceManager.database.traders[this.traderIDs[traderName]];
                this.SetLastResupply(traderTable, traderName);
                this.UpdateAssort(traderTable, traderName);
            }
        }
    }


    /**
     *  Checks if the vendors assortments have expired If true refresh the vendor assortments 
     */
    private CheckIfExpired(): void 
    {
        Object.values(this.traderIDs).forEach(traderId => 
        {
            const traderTable = this.instanceManager.database.traders[traderId];
            const traderName = this.traderNames[traderId]
            const currentRestockTime = this.traderLastRestock[traderId]
            if (currentRestockTime < traderTable.base.nextResupply) 
            {
                this.UpdateAssort(traderTable, traderName)
                this.SetLastResupply(traderTable, traderName)

                this.instanceManager.traderAssortHelper.resetExpiredTrader(traderTable)
                traderTable.base.refreshTraderRagfairOffers = true;
                this.instanceManager.ragfairOfferGenerator.generateFleaOffersForTrader(traderTable.base._id);
                this.traderLastRestock[traderId] = traderTable.base.nextResupply
            }
        });
    }


    /**
     * Clears current trader assortment then goes through the categories to rebuild them.
     * Adds guaranteed, simple, and complex items
     * 
     * @param traderTable  - The Trader table to be updated
     * @param traderName - The readable name of the trader
     */
    private UpdateAssort(traderTable, traderName): void 
    {
        const trader = traderAssortConfig.trader_values[traderName]

        this.ClearAssorts(traderTable)
        this.instanceManager.logger.log("clearing assorts", LogTextColor.YELLOW)
        for (let loyalty_level = 1; loyalty_level < 5; loyalty_level++)
        {
            // Add guaranteed Items
            this.instanceManager.logger.log("adding guaranteed assorts", LogTextColor.YELLOW)
            this.AddGuaranteedAssorts(traderTable, traderName, loyalty_level);
            const ll_assorts = trader[`ll_${loyalty_level}`]

            if (ll_assorts.simpleAssorts)
            {
                Object.keys(ll_assorts.simpleAssorts).forEach(key => 
                {
                    // Add Simple Items
                    this.instanceManager.logger.log(`adding simple ${key} assorts for ${traderName}`, LogTextColor.YELLOW)
                    this.AddRandomSimpleAssorts(traderTable, traderName, loyalty_level, key, ll_assorts.simpleAssorts[key]);
                });
            }
    
            if (ll_assorts.complexAssorts)
            {
                Object.keys(ll_assorts.complexAssorts).forEach(key => 
                {
                    // Add Complex Items
                    this.instanceManager.logger.log(`adding complex ${key} assorts for ${traderName}`, LogTextColor.YELLOW)
                    this.AddRandomComplexAssorts(traderTable, traderName, loyalty_level, key, ll_assorts.complexAssorts[key]);
                });
            }

        }            
    }

    /**
     * Updates the record for trader resupply times
     * used for checking expired assortments
     * 
     * @param traderTable  - The Trader table pull the time from
     * @param traderName - The readable name of the trader
     */
    private SetLastResupply(traderTable, traderName): void 
    {
        this.traderLastRestock[traderName] = traderTable.base.nextResupply
    }

    /**
     * Clear the assortment table for the given trader table
     * 
     * @param traderTable  - The Trader table pull the time from
     * @param traderName - The readable name of the trader
     */
    private ClearAssorts(traderTable): void 
    {
        traderTable.assort.items = [];
    }

    /**
     * Add guaranteed assort items to trader tables
     * 
     * @param traderTable  - The Trader table pull the time from
     * @param traderName - The readable name of the trader
     */
    private AddGuaranteedAssorts(traderTable, traderName, loyalty_level): void 
    {
        const filePath = path.resolve(__dirname, `../../config/TraderAssorts/${traderName}/ll_${loyalty_level}/guaranteed.json`);
        const itemMasterList = require(filePath);
        // if the list is empty return early
        if (itemMasterList.length === 0) 
        {
            return 
        }

        const mul_min = traderAssortConfig.trader_values[traderName].cost_multipliers.mul_min;
        const mul_max = traderAssortConfig.trader_values[traderName].cost_multipliers.mul_max;

        // iterate of itemMasterList to add all available items to the assort table
        itemMasterList.forEach(element => 
        {
            const item = {
                _id: generateItemID(),
                _tpl: element._tpl,
                parentId: "hideout",
                slotId: "hideout",
                upd: element.upd
            };
            traderTable.assort.items.push(item);
            const barter_scheme = element.barter_scheme;
            if (Object.values(this.currencyIDs).includes(barter_scheme[0][0]._tpl)) 
            {
                const randomMultiplier = 1 + (Math.random() * (mul_max - mul_min) + mul_min);
                barter_scheme[0][0].count = Math.round(barter_scheme[0][0].count * randomMultiplier);
            }

            traderTable.assort.barter_scheme[item._id] = barter_scheme;
            traderTable.assort.loyal_level_items[item._id] = loyalty_level;
        });
    }

    /**
     * Add simple assort items to trader tables
     * 
     * @param traderTable  - The Trader table pull the time from
     * @param traderName - The readable name of the trader
     * @param type - The type of items to add relates to the config files for the traders
     * @param itemCount - The number of items to add
     */
    private AddRandomSimpleAssorts(traderTable, traderName, loyalty_level, type, itemCount): void 
    {
        if (itemCount === 0) 
        {
            return 
        }
        const filePath = path.resolve(__dirname, `../../config/TraderAssorts/${traderName}/ll_${loyalty_level}/${type}.json`);
        const itemMasterList = require(filePath);
        if (itemMasterList.length < itemCount) 
        {
            return
        }

        const mul_min = traderAssortConfig.trader_values[traderName].cost_multipliers.mul_min;
        const mul_max = traderAssortConfig.trader_values[traderName].cost_multipliers.mul_max;
        const numItems = Math.ceil(Math.random() * itemCount)

        let itemIndex: number;
        const itemsAdded: number[] = []
        for (let n = 0; n < numItems; n++) 
        {
            itemIndex = getRandomNumberInRange(itemMasterList.length)
            let stackSize = itemMasterList[itemIndex].upd.StackObjectsCount;

            if (itemMasterList[itemIndex].upd.UnlimitedCount === false) 
            {
                stackSize = Math.round((stackSize * Math.random()) + 1);
            }

            const item = {
                _id: generateItemID(),
                _tpl: itemMasterList[itemIndex]._tpl,
                parentId: "hideout",
                slotId: "hideout",
                upd: {
                    UnlimitedCount: itemMasterList[itemIndex].upd.UnlimitedCount,
                    StackObjectsCount: stackSize,
                    BuyRestrictionMax: itemMasterList[itemIndex].upd.BuyRestrictionMax,
                    BuyRestrictionCurrent: itemMasterList[itemIndex].upd.BuyRestrictionCurrent
                }
            };

            if (!itemsAdded.includes(itemIndex)) 
            {
                traderTable.assort.items.push(item);
                const barter_scheme = itemMasterList[itemIndex].barter_scheme;
                if (Object.values(this.currencyIDs).includes(barter_scheme[0][0]._tpl)) 
                {
                    const randomMultiplier = 1 + (Math.random() * (mul_max - mul_min) + mul_min);
                    barter_scheme[0][0].count = Math.round(barter_scheme[0][0].count * randomMultiplier);
                }

                traderTable.assort.barter_scheme[item._id] = barter_scheme;
                traderTable.assort.loyal_level_items[item._id] = loyalty_level;
                itemsAdded.push(itemIndex)
            }
        }
    }

    /**
     * Add complex assort items to trader tables
     * 
     * @param traderTable  - The Trader table pull the time from
     * @param traderName - The readable name of the trader
     * @param type - The type of items to add relates to the config files for the traders
     * @param itemCount - The number of items to add
     */
    private AddRandomComplexAssorts(traderTable, traderName, loyalty_level, type, itemCount): void 
    {
        if (itemCount === 0) 
        {
            return 
        }
        const filePath = path.resolve(__dirname, `../../config/TraderAssorts/${traderName}/ll_${loyalty_level}/${type}.json`);
        const itemMasterList = require(filePath);
        if (itemMasterList.length < itemCount) 
        {
            return
        }

        const mul_min = traderAssortConfig.trader_values[traderName].cost_multipliers.mul_min;
        const mul_max = traderAssortConfig.trader_values[traderName].cost_multipliers.mul_max;
        const numWeapons = Math.ceil(Math.random() * itemCount)

        let weaponIndex: number;
        const idxAdded: number[] = []
        if (numWeapons === 0) 
        {
            return 
        }
        for (let n = 0; n < numWeapons; n++) 
        {
            weaponIndex = getRandomNumberInRange(itemMasterList.length)
            const weaponAssort = itemMasterList[weaponIndex][0]
            let stackSize = weaponAssort.upd.StackObjectsCount;
            if (weaponAssort.upd.UnlimitedCount === false) 
            {
                stackSize = Math.round((stackSize * Math.random()) + 1);
            }

            if (!idxAdded.includes(weaponIndex)) 
            {
                const baseItemID = generateItemID()
                const baseItem = {
                    _id: baseItemID,
                    _tpl: weaponAssort._tpl,
                    parentId: "hideout",
                    slotId: "hideout",
                    upd: weaponAssort.upd
                };

                traderTable.assort.items.push(baseItem);
                const barter_scheme = weaponAssort.barter_scheme;
                if (Object.values(this.currencyIDs).includes(barter_scheme[0][0]._tpl)) 
                {
                    const randomMultiplier = 1 + (Math.random() * (mul_max - mul_min) + mul_min);
                    barter_scheme[0][0].count = Math.round(barter_scheme[0][0].count * randomMultiplier);
                }
                traderTable.assort.barter_scheme[baseItemID] = barter_scheme;
                traderTable.assort.loyal_level_items[baseItemID] = loyalty_level;

                const idMap = new Map();
                let subItemID: string;
                const subItems = [];
                itemMasterList[weaponIndex].forEach(element => 
                {
                    if (element._tpl !== baseItem._tpl) 
                    {
                        subItemID = generateItemID()
                        idMap.set(element._id, subItemID)
                        const subItem = {
                            _id: subItemID,
                            _tpl: element._tpl,
                            parentId: element.parentId,
                            slotId: element.slotId,
                            upd: element.upd
                        }
                        subItems.push(subItem)
                    }
                });

                subItems.forEach(item => 
                {
                    if (item.parentId && idMap.has(item.parentId)) 
                    {
                        item.parentId = idMap.get(item.parentId);
                    }
                    else 
                    {
                        item.parentId = baseItemID;
                    }
                    traderTable.assort.items.push(item);
                });
                idxAdded.push(weaponIndex)
            }
        }
    }
}
