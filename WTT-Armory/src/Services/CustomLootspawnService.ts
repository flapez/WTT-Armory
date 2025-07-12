/* eslint-disable @typescript-eslint/naming-convention */
import type { WTTInstanceManager } from "./WTTInstanceManager";
import * as customSpawnpointsForced from "../../db/CustomLootspawnService/customSpawnpointsForced.json";
import * as customSpawnpoints from "../../db/CustomLootspawnService/customSpawnpoints.json"
import { ILocations } from "@spt/models/spt/server/ILocations";

export class CustomLootspawnService 
{
    private instanceManager: WTTInstanceManager;

    public preSptLoad(instanceManager: WTTInstanceManager): void 
    {
        this.instanceManager = instanceManager;
    }

    public postDBLoad(): void 
    {
        const locations = this.instanceManager.database.locations;

        for (const locationId in locations) 
        {
            const location = locations[locationId];
            
            if (customSpawnpointsForced[locationId]) 
            {
                // Concatenate the existing spawnpoints with the new ones
                location.looseLoot.spawnpointsForced = location.looseLoot.spawnpointsForced.concat(customSpawnpointsForced[locationId]);
            }
        }

        // Process regular spawnpoints
        this.processSpawnpoints(locations, customSpawnpoints);
    }

    private processSpawnpoints(
        locations: ILocations,
        customMap: Record<string, any[]>
    ): void 
    {
        for (const locationId in customMap) 
        {
            const location = locations[locationId];
            if (!location || !location.looseLoot) continue;
            
            const customSpawns = customMap[locationId];
            const existingSpawns = location.looseLoot.spawnpoints;
            
            for (const customSpawn of customSpawns) 
            {
                const existingIndex = existingSpawns.findIndex(
                    sp => sp.locationId === customSpawn.locationId
                );
                
                if (existingIndex === -1) 
                {
                    // Spawnpoint doesn't exist - add it
                    existingSpawns.push(customSpawn);
                } 
                else 
                {
                    // Spawnpoint exists - merge items and distributions
                    const existingSpawn = existingSpawns[existingIndex];
                    
                    // Merge template items
                    if (customSpawn.template?.Items) 
                    {
                        existingSpawn.template.Items = [
                            ...existingSpawn.template.Items,
                            ...customSpawn.template.Items
                        ];
                    }
                    
                    // Merge item distributions
                    if (customSpawn.itemDistribution) 
                    {
                        existingSpawn.itemDistribution = [
                            ...existingSpawn.itemDistribution,
                            ...customSpawn.itemDistribution
                        ];
                    }
                }
            }
            
            // Update the spawnpoints array in the location
            location.looseLoot.spawnpoints = existingSpawns;
        }
    }
}
