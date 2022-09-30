import { Zurg } from "@fern-typescript/commons-v2";
import { Fetcher } from "./implementations/Fetcher";

export interface CoreUtilities {
    zurg: Zurg;
    fetcher: Fetcher;
}
