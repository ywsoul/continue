import { ContextItem, ToolExtras } from "../..";
import { fileGlobSearchImpl } from "./globSearch";
import { lsToolImpl } from "./lsTool";
import { readFileImpl } from "./readFile";
import { grepSearchImpl } from "./grepSearch";

interface SmartExploreArgs {
  target: string;
  depth?: number;
  includeContent?: boolean;
  focus?: "structure" | "content" | "both";
}

export async function smartExploreImpl(
  args: SmartExploreArgs,
  extras: ToolExtras,
): Promise<ContextItem[]> {
  const { target, depth = 2, includeContent = false, focus = "both" } = args;
  const results: ContextItem[] = [];

  try {
    // First, understand what we're dealing with
    const isFile = target.includes('.') && !target.endsWith('/');
    
    if (isFile) {
      // If it's a file, read it and explore its context
      try {
        const fileContent = await readFileImpl({ path: target }, extras);
        results.push(...fileContent);

        if (focus === "both" || focus === "structure") {
          // Find related files in the same directory
          const directory = target.substring(0, target.lastIndexOf('/'));
          if (directory) {
            const dirContents = await lsToolImpl({ path: directory }, extras);
            results.push({
              name: `Directory Structure: ${directory}`,
              description: `Contents of ${directory}`,
              content: dirContents[0]?.content || "Unable to read directory",
            });
          }

          // Look for imports/dependencies
          if (fileContent[0]?.content) {
            const content = fileContent[0].content;
            const importMatches = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g) || [];
            const requireMatches = content.match(/require\(['"`]([^'"`]+)['"`]\)/g) || [];
            
            if (importMatches.length > 0 || requireMatches.length > 0) {
              results.push({
                name: `Dependencies in ${target}`,
                description: "Imported modules and dependencies",
                content: `Imports:\n${importMatches.join('\n')}\n\nRequires:\n${requireMatches.join('\n')}`,
              });
            }
          }
        }
      } catch (error) {
        results.push({
          name: "File Read Error",
          description: `Could not read ${target}`,
          content: `Error: ${error}`,
        });
      }
    } else {
      // If it's a directory, explore its structure
      if (focus === "both" || focus === "structure") {
        try {
          const dirContents = await lsToolImpl({ path: target }, extras);
          results.push(...dirContents);

          // Get a broader view with glob search for common file types
          const commonPatterns = [
            "*.ts", "*.tsx", "*.js", "*.jsx",
            "*.py", "*.java", "*.go", "*.rs",
            "*.md", "*.json", "*.yaml", "*.yml",
            "package.json", "tsconfig.json", "README*"
          ];

          for (const pattern of commonPatterns) {
            try {
              const globResults = await fileGlobSearchImpl(
                { pattern: `${target}/**/${pattern}` },
                extras
              );
              if (globResults[0]?.content && globResults[0].content.trim()) {
                results.push({
                  name: `${pattern} files in ${target}`,
                  description: `Found ${pattern} files`,
                  content: globResults[0].content,
                });
              }
            } catch (e) {
              // Skip patterns that don't match
            }
          }
        } catch (error) {
          results.push({
            name: "Directory Exploration Error",
            description: `Could not explore ${target}`,
            content: `Error: ${error}`,
          });
        }
      }

      if (focus === "both" || focus === "content") {
        // Look for key configuration and documentation files
        const keyFiles = [
          "README.md", "README.txt", "package.json", "tsconfig.json",
          "Cargo.toml", "go.mod", "requirements.txt", "pom.xml",
          ".gitignore", "Dockerfile", "docker-compose.yml"
        ];

        for (const keyFile of keyFiles) {
          try {
            const filePath = `${target}/${keyFile}`;
            const fileContent = await readFileImpl({ path: filePath }, extras);
            if (fileContent[0]?.content) {
              results.push({
                name: `Key File: ${keyFile}`,
                description: `Important project file`,
                content: fileContent[0].content.substring(0, 2000) + 
                        (fileContent[0].content.length > 2000 ? "\n\n... (truncated)" : ""),
              });
            }
          } catch (e) {
            // File doesn't exist, skip
          }
        }
      }
    }

    // If no results found, provide helpful guidance
    if (results.length === 0) {
      results.push({
        name: "No Content Found",
        description: `Unable to explore ${target}`,
        content: `The target "${target}" could not be explored. This might be because:
- The path doesn't exist
- You don't have permission to access it
- It's empty or contains no recognizable files

Try:
- Using ls_tool to check if the path exists
- Using glob_search to find files with specific patterns
- Using grep_search to search for content`,
      });
    }

    return results;

  } catch (error) {
    return [{
      name: "Smart Explore Error",
      description: "Failed to explore target",
      content: `An unexpected error occurred while exploring "${target}": ${error}

This tool helps you understand project structure and context by:
- Reading file contents and finding related files
- Exploring directory structures
- Identifying key project files and dependencies
- Providing context about imports and relationships

Try using more specific tools like read_file, ls_tool, or grep_search for targeted exploration.`,
    }];
  }
}