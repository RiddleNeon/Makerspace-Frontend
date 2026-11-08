import { initGears } from "./gears/gears";
import { startRouter } from "./router";
import { applySessionChrome } from "./session";

initGears();

await startRouter();
await applySessionChrome();
