import { ContextItem, ToolExtras } from "../..";

export type ToolImpl = (
  parameters: any,
  extras: ToolExtras,
) => Promise<ContextItem[]>;

export * from "./createNewFile";
export * from "./createRuleBlock";
export * from "./fetchUrlContent";
export * from "./globSearch";
export * from "./grepSearch";
export * from "./lsTool";
export * from "./readCurrentlyOpenFile";
export * from "./readFile";
export * from "./requestRule";
export * from "./runTerminalCommand";
export * from "./searchWeb";
export * from "./viewDiff";
export * from "./smartExplore";
