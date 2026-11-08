import { initGears } from "./gears/gears";
import { startRouter } from "./router";
import { applySessionChrome } from "./session";
import "./pages/wiki/wiki.ts";

initGears();

await startRouter();
await applySessionChrome();
