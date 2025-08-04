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
exports.CustomLootspawnService = void 0;
const customSpawnpointsForced = __importStar(require("../../db/CustomLootspawnService/customSpawnpointsForced.json"));
const customSpawnpoints = __importStar(require("../../db/CustomLootspawnService/customSpawnpoints.json"));
class CustomLootspawnService {
    instanceManager;
    preSptLoad(instanceManager) {
        this.instanceManager = instanceManager;
    }
    postDBLoad() {
        const locations = this.instanceManager.database.locations;
        for (const locationId in locations) {
            const location = locations[locationId];
            if (customSpawnpointsForced[locationId]) {
                location.looseLoot.spawnpointsForced = location.looseLoot.spawnpointsForced.concat(customSpawnpointsForced[locationId]);
            }
        }
        this.processSpawnpoints(locations, customSpawnpoints);
    }
    processSpawnpoints(locations, customMap) {
        for (const locationId in customMap) {
            const location = locations[locationId];
            if (!location || !location.looseLoot)
                continue;
            const customSpawns = customMap[locationId];
            const existingSpawns = location.looseLoot.spawnpoints;
            for (const customSpawn of customSpawns) {
                const existingIndex = existingSpawns.findIndex(sp => sp.locationId === customSpawn.locationId);
                if (existingIndex === -1) {
                    existingSpawns.push(customSpawn);
                }
                else {
                    const existingSpawn = existingSpawns[existingIndex];
                    if (customSpawn.template?.Items) {
                        existingSpawn.template.Items = [
                            ...existingSpawn.template.Items,
                            ...customSpawn.template.Items
                        ];
                    }
                    if (customSpawn.itemDistribution) {
                        existingSpawn.itemDistribution = [
                            ...existingSpawn.itemDistribution,
                            ...customSpawn.itemDistribution
                        ];
                    }
                }
            }
            location.looseLoot.spawnpoints = existingSpawns;
        }
    }
}
exports.CustomLootspawnService = CustomLootspawnService;
//# sourceMappingURL=CustomLootspawnService.js.map