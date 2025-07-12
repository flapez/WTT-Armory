/* eslint-disable @typescript-eslint/naming-convention */
import type { QuestZone } from "../../references/configConsts";

export const mechanicZones: QuestZone[] = [
    //Place Item
    {
        zoneId: "M_2CamScafzone",
        zoneName: "M_2CamScafzone",
        zoneType: "PlaceItem",
        zoneLocation: "factory4_night",
        position: {
            x: "38.6609",
            y: "9.6912",
            z: "6.417"
        },
        rotation: {
            x: "0",
            y: "0",
            z: "0"
        },
        scale: {
            x: "2",
            y: "5",
            z: "1"
        }
    },
    {
        zoneId: "M_2CamMedzone",
        zoneName: "M_2CamMedzone",
        zoneType: "PlaceItem",
        zoneLocation: "factory4_night",
        position: {
            x: "-22.0561",
            y: "8.1738",
            z: "-35.3336"
        },
        rotation: {
            x: "0",
            y: "0",
            z: "0"
        },
        scale: {
            x: "2.5",
            y: "5",
            z: "2"
        }
    },
    {
        zoneId: "place_RagSpyCam_01_1",
        zoneName: "place_RagSpyCam_01_1",
        zoneType: "PlaceItem",
        zoneLocation: "Interchange",
        position: {
            x: "265.0744",
            y: "25.0233",
            z: "-34.2742"
        },
        rotation: {
            x: "0",
            y: "0",
            z: "0"
        },
        scale: {
            x: "1",
            y: "1",
            z: "1"
        }
    },
    {
        zoneId: "place_RagSpyCam_01_2",
        zoneName: "place_RagSpyCam_01_2",
        zoneType: "PlaceItem",
        zoneLocation: "Interchange",
        position: {
            x: "260.8284",
            y: "24.6233",
            z: "-4.1455"
        },
        rotation: {
            x: "0",
            y: "0",
            z: "0"
        },
        scale: {
            x: "1",
            y: "1",
            z: "1"
        }
    },
    //BotKillZone
    {
        zoneId: "Ragman_Exfil_Killzone",
        zoneName: "Ragman_Exfil_Killzone",
        zoneType: "BotKillZone",
        zoneLocation: "Interchange",
        position: {
            x: "260.8284",
            y: "25.1233",
            z: "-21.1874"
        },
        rotation: {
            x: "0",
            y: "0",
            z: "0"
        },
        scale: {
            x: "40",
            y: "40",
            z: "40"
        }
    }
]