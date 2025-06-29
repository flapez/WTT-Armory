"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stashes = exports.inventorySlots = exports.allBotTypes = exports.currencyIDs = exports.traderIDs = exports.defaultCaliberAmmo = void 0;
;
var defaultCaliberAmmo;
(function (defaultCaliberAmmo) {
    defaultCaliberAmmo["Caliber762x25TT"] = "573603562459776430731618";
    defaultCaliberAmmo["Caliber9x18PM"] = "57372140245977611f70ee91";
    defaultCaliberAmmo["Caliber9x19PARA"] = "5efb0da7a29a85116f6ea05f";
    defaultCaliberAmmo["Caliber9x21"] = "6576f4708ca9c4381d16cd9d";
    defaultCaliberAmmo["Caliber9x33R"] = "62330c40bdd19b369e1e53d1";
    defaultCaliberAmmo["Caliber1143x23ACP"] = "5efb0cabfb3e451d70735af5";
    defaultCaliberAmmo["Caliber127x33"] = "66a0d1c87d0d369e270bb9de";
    defaultCaliberAmmo["Caliber46x30"] = "5ba26835d4351e0035628ff5";
    defaultCaliberAmmo["Caliber57x28"] = "5cc86840d7f00c002412c56c";
    defaultCaliberAmmo["Caliber545x39"] = "61962b617c6c7b169525f168";
    defaultCaliberAmmo["Caliber556x45NATO"] = "59e690b686f7746c9f75e848";
    defaultCaliberAmmo["Caliber68x51"] = "6529243824cbe3c74a05e5c1";
    defaultCaliberAmmo["Caliber762x35"] = "5fbe3ffdf8b6a877a729ea82";
    defaultCaliberAmmo["Caliber762x39"] = "59e0d99486f7744a32234762";
    defaultCaliberAmmo["Caliber762x51"] = "5efb0c1bd79ff02a1f5e68d9";
    defaultCaliberAmmo["Caliber762x54R"] = "560d61e84bdc2da74d8b4571";
    defaultCaliberAmmo["Caliber9x39"] = "57a0e5022459774d1673f889";
    defaultCaliberAmmo["Caliber366TKM"] = "59e655cb86f77411dc52a77b";
    defaultCaliberAmmo["Caliber127x55"] = "5cadf6ddae9215051e1c23b2";
    defaultCaliberAmmo["Caliber127x108"] = "5cde8864d7f00c0010373be1";
    defaultCaliberAmmo["Caliber12g"] = "5c0d591486f7744c505b416f";
    defaultCaliberAmmo["Caliber20g"] = "5d6e6a5fa4b93614ec501745";
    defaultCaliberAmmo["Caliber23x75"] = "5f647f31b6238e5dd066e196";
    defaultCaliberAmmo["Caliber40x46"] = "5ede474b0c226a66f5402622";
})(defaultCaliberAmmo || (exports.defaultCaliberAmmo = defaultCaliberAmmo = {}));
var traderIDs;
(function (traderIDs) {
    traderIDs["MECHANIC"] = "5a7c2eca46aef81a7ca2145d";
    traderIDs["SKIER"] = "58330581ace78e27b8b10cee";
    traderIDs["PEACEKEEPER"] = "5935c25fb3acc3127c3d8cd9";
    traderIDs["THERAPIST"] = "54cb57776803fa99248b456e";
    traderIDs["PRAPOR"] = "54cb50c76803fa8b248b4571";
    traderIDs["JAEGER"] = "5c0647fdd443bc2504c2d371";
    traderIDs["RAGMAN"] = "5ac3b934156ae10c4430e83c";
    traderIDs["FENCE"] = "579dc571d53a0658a154fbec";
    traderIDs["BADGER"] = "bd3a8b28356d9c6509966546";
})(traderIDs || (exports.traderIDs = traderIDs = {}));
var currencyIDs;
(function (currencyIDs) {
    currencyIDs["ROUBLES"] = "5449016a4bdc2d6f028b456f";
    currencyIDs["EUROS"] = "569668774bdc2da2298b4568";
    currencyIDs["DOLLARS"] = "5696686a4bdc2da3298b456a";
})(currencyIDs || (exports.currencyIDs = currencyIDs = {}));
var allBotTypes;
(function (allBotTypes) {
    // Arena Fighters
    allBotTypes["ARENAFIGHTER"] = "arenafighter";
    allBotTypes["ARENAFIGHTEREVENT"] = "arenafighterevent";
    // Scavs
    allBotTypes["ASSAULT"] = "assault";
    allBotTypes["ASSAULTGROUP"] = "assaultgroup";
    allBotTypes["MARKSMAN"] = "marksman";
    allBotTypes["CRAZYASSAULTEVENT"] = "crazyassaultevent";
    allBotTypes["CURSEDASSAULT"] = "cursedassault";
    // PMC's
    allBotTypes["BEAR"] = "bear";
    allBotTypes["USEC"] = "usec";
    allBotTypes["PMCBEAR"] = "pmcbear";
    allBotTypes["PMCUSEC"] = "pmcusec";
    allBotTypes["PMC"] = "pmcbot";
    // ExUsec
    allBotTypes["EXUSEC"] = "exusec";
    // Cultists
    allBotTypes["CULTISTPRIEST"] = "sectantpriest";
    allBotTypes["CULTISTWARRIOR"] = "sectantwarrior";
    allBotTypes["CULTISTONI"] = "sectantoni";
    allBotTypes["CULTISTPRIESTEVENT"] = "sectantpriestevent";
    allBotTypes["CULTISTPREDVESTNIK"] = "sectantpredvestnik";
    allBotTypes["CULTISTPRIZRAK"] = "sectantprizrak";
    // BTR
    allBotTypes["BTR"] = "btrshooter";
    // Spirits
    allBotTypes["SPIRITSPRING"] = "spiritspring";
    allBotTypes["SPIRITWINTER"] = "spiritwinter";
    // Zombies
    allBotTypes["INFECTEDASSAULT"] = "infectedassault";
    allBotTypes["INFECTEDCIVIL"] = "infectedcivil";
    allBotTypes["INFECTEDLABORANT"] = "infectedlaborant";
    allBotTypes["INFECTEDPMC"] = "infectedpmc";
    allBotTypes["INFECTEDTAGILLA"] = "infectedtagilla";
    // Santa
    allBotTypes["GIFTER"] = "gifter";
    // Bosses & Followers
    // Kaban
    allBotTypes["KABAN"] = "bossboar";
    allBotTypes["KABANSNIPER"] = "bossboarsniper";
    allBotTypes["FOLLOWERBOAR"] = "followerboar";
    allBotTypes["FOLLOWERBOARCLOSE1"] = "followerboarclose1";
    allBotTypes["FOLLOWERBOARCLOSE2"] = "followerboarclose2";
    // Killa
    allBotTypes["KILLA"] = "bosskilla";
    // Kolontay
    allBotTypes["KOLONTAY"] = "bosskolontay";
    allBotTypes["FOLLOWERKOLONTAYASSAULT"] = "followerkolontayassault";
    allBotTypes["FOLLOWERKOLONTAYSECURITY"] = "followerkolontaysecurity";
    // Partisan
    allBotTypes["PARTISAN"] = "bosspartisan";
    // Reshala
    allBotTypes["RESHALA"] = "bossbully";
    allBotTypes["FOLLOWERRESHALA"] = "followerbully";
    // Gluhar
    allBotTypes["GLUHAR"] = "bossgluhar";
    allBotTypes["FOLLOWERGLUHARASSAULT"] = "followergluharassault";
    allBotTypes["FOLLOWERGLUHARSCOUT"] = "followergluharscout";
    allBotTypes["FOLLOWERGLUHARSECURITY"] = "followergluharsecurity";
    allBotTypes["FOLLOWERGLUHARSNIPER"] = "followergluharsnipe";
    // Goons
    allBotTypes["KNIGHT"] = "bossknight";
    allBotTypes["FOLLOWERBIGPIPE"] = "followerbigpipe";
    allBotTypes["FOLLOWERBIRDEYE"] = "followerbirdeye";
    // Shturman
    allBotTypes["SHTURMAN"] = "bosskojaniy";
    allBotTypes["FOLLOWERSHTURMAN"] = "followerkojaniy";
    // Sanitar
    allBotTypes["SANITAR"] = "bosssanitar";
    allBotTypes["FOLLOWERSANITAR"] = "followersanitar";
    // Tagilla
    allBotTypes["TAGILLA"] = "bosstagilla";
    allBotTypes["FOLLOWERTAGILLA"] = "followertagilla";
    // Zryachiy
    allBotTypes["ZRYACHIY"] = "bosszryachiy";
    allBotTypes["FOLLOWERZRYACHIY"] = "followerzryachiy";
    allBotTypes["PEACEFULZRYACHIYEVENT"] = "peacefulzryachiyevent";
    allBotTypes["RAVANGEZRYACHIYEVENT"] = "ravengezryachiyevent";
    // Traders
    // Peacemaker
    allBotTypes["PEACEMAKER"] = "peacemaker";
    // Skier
    allBotTypes["SKIER"] = "skier";
})(allBotTypes || (exports.allBotTypes = allBotTypes = {}));
var inventorySlots;
(function (inventorySlots) {
    inventorySlots["FirstPrimaryWeapon"] = "55d729c64bdc2d89028b4570";
    inventorySlots["SecondPrimaryWeapon"] = "55d729d14bdc2d86028b456e";
    inventorySlots["Holster"] = "55d729d84bdc2de3098b456b";
    inventorySlots["Scabbard"] = "55d729e34bdc2d1b198b456d";
    inventorySlots["FaceCover"] = "55d729e84bdc2d8a028b4569";
    inventorySlots["Headwear"] = "55d729ef4bdc2d3a168b456c";
    inventorySlots["TacticalVest"] = "55d729f74bdc2d87028b456e";
    inventorySlots["SecuredContainer"] = "55d72a054bdc2d88028b456e";
    inventorySlots["Backpack"] = "55d72a104bdc2d89028b4571";
    inventorySlots["ArmorVest"] = "55d72a194bdc2d86028b456f";
    inventorySlots["Pockets"] = "55d72a274bdc2de3098b456c";
    inventorySlots["Earpiece"] = "5665b7164bdc2d144c8b4570";
    inventorySlots["Dogtag"] = "59f0be1e86f77453be490939";
    inventorySlots["Eyewear"] = "5a0ad9313f1241000e072755";
    inventorySlots["ArmBand"] = "5b3f583786f77411d552fb2b";
})(inventorySlots || (exports.inventorySlots = inventorySlots = {}));
var Stashes;
(function (Stashes) {
    Stashes["LEVEL1"] = "566abbc34bdc2d92178b4576";
    Stashes["LEVEL2"] = "5811ce572459770cba1a34ea";
    Stashes["LEVEL3"] = "5811ce662459770f6f490f32";
    Stashes["LEVEL4"] = "5811ce772459770e9e5f9532";
})(Stashes || (exports.Stashes = Stashes = {}));
//# sourceMappingURL=configConsts.js.map