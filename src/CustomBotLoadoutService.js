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
exports.CustomBotLoadoutService = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CustomBotLoadoutService {
    instanceManager;
    preSptLoad(instanceManager) {
        this.instanceManager = instanceManager;
    }
    postDBLoad() {
        const debug = this.instanceManager.debug;
        if (debug)
            console.log("[CustomBotLoadoutService] Starting custom bot loadout processing");
        const customLoadoutsDir = path.join(__dirname, "../db/CustomBotLoadouts/");
        if (!fs.existsSync(customLoadoutsDir)) {
            if (debug)
                console.log("[CustomBotLoadoutService] Custom loadouts directory not found. Skipping.");
            return;
        }
        const files = fs.readdirSync(customLoadoutsDir);
        const botTypes = this.instanceManager.database.bots.types;
        let loadedCount = 0;
        if (debug)
            console.log(`[CustomBotLoadoutService] Found ${files.length} files in custom loadouts directory`);
        for (const file of files) {
            if (!file.endsWith(".json"))
                continue;
            try {
                const botType = file.replace(/\.json$/i, "");
                if (debug)
                    console.log(`[CustomBotLoadoutService] Processing ${botType} from file: ${file}`);
                if (!botTypes[botType]) {
                    if (debug)
                        console.warn(`[CustomBotLoadoutService] Bot type '${botType}' not found in database. Skipping.`);
                    continue;
                }
                const filePath = path.join(customLoadoutsDir, file);
                const fileData = fs.readFileSync(filePath, "utf8");
                const customLoadout = JSON.parse(fileData);
                if (debug)
                    console.log(`[CustomBotLoadoutService] Applying custom loadout for ${botType}`);
                this.deepMerge(botTypes[botType], customLoadout, botType);
                loadedCount++;
                if (debug)
                    console.log(`[CustomBotLoadoutService] Successfully applied custom loadout for ${botType}`);
            }
            catch (error) {
                console.error(`[CustomBotLoadoutService] Error processing ${file}:`, error);
            }
        }
        if (this.instanceManager.debug || loadedCount > 0) {
            console.log(`[CustomBotLoadoutService] Loaded ${loadedCount} custom bot loadouts`);
        }
    }
    deepMerge(target, source, botType, path = "") {
        const debug = this.instanceManager.debug;
        const currentPath = path ? `${path}.` : "";
        for (const key of Object.keys(source)) {
            const sourceValue = source[key];
            const targetValue = target[key];
            const fullPath = `${currentPath}${key}`;
            if (debug)
                console.log(`[CustomBotLoadoutService] Merging ${botType} -> ${fullPath}`);
            // Handle object recursion
            if (this.isObject(sourceValue)) {
                if (!this.isObject(targetValue)) {
                    if (debug)
                        console.log(`[CustomBotLoadoutService] Creating object at ${fullPath}`);
                    target[key] = {};
                }
                this.deepMerge(target[key], sourceValue, botType, fullPath);
            }
            // Handle arrays without duplicates
            else if (Array.isArray(sourceValue)) {
                if (!Array.isArray(targetValue)) {
                    if (debug)
                        console.log(`[CustomBotLoadoutService] Creating array at ${fullPath}`);
                    target[key] = [];
                }
                for (const item of sourceValue) {
                    if (this.isObject(item)) {
                        // try to find a matching object
                        const match = target[key].find((tItem) => this.deepEquals(tItem, item));
                        if (match) {
                            if (debug)
                                console.log(`[CustomBotLoadoutService] Merging existing object in array at ${fullPath}`);
                            this.deepMerge(match, item, botType, fullPath);
                        }
                        else {
                            if (debug)
                                console.log(`[CustomBotLoadoutService] Adding new object to array at ${fullPath}`);
                            target[key].push(item);
                        }
                    }
                    else {
                        // primitive: add if not already present
                        if (!target[key].includes(item)) {
                            if (debug)
                                console.log(`[CustomBotLoadoutService] Adding new value '${item}' to array at ${fullPath}`);
                            target[key].push(item);
                        }
                    }
                }
            }
            // Handle primitives & override under 'chances'
            else {
                const isChancePath = fullPath.startsWith("chances.");
                if (targetValue === undefined || isChancePath) {
                    if (debug)
                        console.log(`[CustomBotLoadoutService] Setting '${fullPath}' = ${sourceValue}`);
                    target[key] = sourceValue;
                }
                else if (debug) {
                    console.log(`[CustomBotLoadoutService] Preserving existing '${fullPath}' = ${targetValue}`);
                }
            }
        }
    }
    isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
    deepEquals(a, b) {
        if (a === b)
            return true;
        if (typeof a !== typeof b)
            return false;
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length)
                return false;
            return a.every((v, i) => this.deepEquals(v, b[i]));
        }
        if (this.isObject(a) && this.isObject(b)) {
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length)
                return false;
            return aKeys.every(key => this.deepEquals(a[key], b[key]));
        }
        return false;
    }
}
exports.CustomBotLoadoutService = CustomBotLoadoutService;
//# sourceMappingURL=CustomBotLoadoutService.js.map