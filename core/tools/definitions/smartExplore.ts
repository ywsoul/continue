import { Tool } from "..";

export const smartExploreTool: Tool = {
  name: "smart_explore",
  displayTitle: "Smart Explore",
  description: "Intelligently explore files and directories to understand project structure and context. This tool combines multiple exploration strategies to provide comprehensive insights about code organization, dependencies, and key files.",
  parameters: {
    type: "object",
    properties: {
      target: {
        type: "string",
        description: "The file or directory path to explore. Can be a specific file (e.g., 'src/main.ts') or a directory (e.g., 'src/' or 'components/')",
      },
      depth: {
        type: "number",
        description: "How deep to explore directory structures (default: 2)",
        default: 2,
      },
      includeContent: {
        type: "boolean",
        description: "Whether to include file contents in the exploration (default: false for performance)",
        default: false,
      },
      focus: {
        type: "string",
        enum: ["structure", "content", "both"],
        description: "What to focus on: 'structure' for directory layout, 'content' for file contents, 'both' for comprehensive exploration (default: 'both')",
        default: "both",
      },
    },
    required: ["target"],
  },
};