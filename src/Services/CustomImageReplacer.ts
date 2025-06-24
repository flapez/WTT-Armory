/* eslint-disable @typescript-eslint/naming-convention */
import type { WTTInstanceManager } from "../WTTInstanceManager";
import * as path from "node:path"; 

export class CustomImageReplacer 
{
    private instanceManager: WTTInstanceManager;

    public preSptLoad(instanceManager: WTTInstanceManager): void 
    {
        this.instanceManager = instanceManager;
    }

    public postDBLoad(): void
    {
        this.replaceLauncherBackground();
    }
    public replaceLauncherBackground(): void
    {
        const customBackgroundImagePath = path.join(__dirname, "../../db/Images/Launcher/bg.png");

        this.instanceManager.imageRouter.addRoute("/files/launcher/bg", customBackgroundImagePath);
    }
}
