/* eslint-disable @typescript-eslint/naming-convention */
import type { WTTInstanceManager } from "../WTTInstanceManager";
//Import zones here substitute GK for any other zone, if you need a new zone template, copy gk's and remove the contents.
import { TherapistZones } from "./zones/TherapistZones";
import { RagmanZones } from "./zones/RagmanZones";
import { mechanicZones } from "./zones/mechanicZones";
import { PraporZones } from "./zones/PraporZones";
//import {SkierZones} from "./zones/SkierZones";
//import { JaegerZones } from "./zones/JaegarZones";
//import { ScholarSocietyZones } from "./zones/ScholarSocietyZones";
//import { ArtemZones } from "./zones/ArtemZones";
import { RefZones } from "./zones/RefZones";


export class TraderQuestReplacer
{
    private instanceManager: WTTInstanceManager;

    postDBLoad(Instance: WTTInstanceManager): void
    {
        this.instanceManager = Instance;
        // Change base trader quests

        this.instanceManager.questApi.loadQuestsFromDirectory("Therapist");
        this.instanceManager.questApi.importQuestZones(TherapistZones, "Therapist");

        this.instanceManager.questApi.loadQuestsFromDirectory("Ragman");
        this.instanceManager.questApi.importQuestZones(RagmanZones, "Ragman");

        this.instanceManager.questApi.loadQuestsFromDirectory("mechanic");
        this.instanceManager.questApi.importQuestZones(mechanicZones, "mechanic");

        this.instanceManager.questApi.loadQuestsFromDirectory("Prapor");
        this.instanceManager.questApi.importQuestZones(PraporZones, "Prapor");

        this.instanceManager.questApi.loadQuestsFromDirectory("Jaeger");
        //this.instanceManager.questApi.importQuestZones(JaegerZones, "Jaeger");

        this.instanceManager.questApi.loadQuestsFromDirectory("Skier");
        //this.instanceManager.questApi.importQuestZones(SkierZones, "Skier");

        this.instanceManager.questApi.loadQuestsFromDirectory("Peacekeeper");
        //this.instanceManager.questApi.importQuestZones(PeaceKeeperZones, "Peacekeeper");

        this.instanceManager.questApi.loadQuestsFromDirectory("Ref");
        this.instanceManager.questApi.importQuestZones(RefZones, "RefZones");

        this.instanceManager.questApi.loadQuestsFromDirectory("Lightkeeper");
        //this.instanceManager.questApi.importQuestZones(LightKeeperZones, "Lightkeeper");

        //this.instanceManager.questApi.loadQuestsFromDirectory("Artem");
        //this.instanceManager.questApi.importQuestZones(ArtemZones, "ArtemZones");

        //this.instanceManager.questApi.loadQuestsFromDirectory("ScholarSociety");
        //this.instanceManager.questApi.importQuestZones(ScholarSocietyZones, "ScholarSocietyZones");

        //this.instanceManager.questApi.loadQuestsFromDirectory("Viper");
        //this.instanceManager.questApi.importQuestZones(ViperZones, "viper_zones");





    }
}