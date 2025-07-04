/* eslint-disable @typescript-eslint/naming-convention */
import type { WTTInstanceManager } from "./WTTInstanceManager";
import * as customSpawnpointsForced from "../db/Locations/customSpawnpointsForced.json";
import * as customSpawnpoints from "../db/Locations/customSpawnpoints.json"

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

            // REGULAR LOOSELOOT SPAWNPOINTS
            if (customSpawnpoints[locationId])
            {
                // Concatenate the existing spawnpoints with the new ones
                location.looseLoot.spawnpoints = location.looseLoot.spawnpoints.concat(customSpawnpoints[locationId]);
            }
        }
    }
}
