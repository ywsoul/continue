import { Editor } from "@tiptap/core";
import { ContextProviderDescription } from "core";
import { Mention } from "../extensions";

/**
 * 插入当前文件上下文作为可移除的提及节点
 * 
 * 使用 TipTap 的 `create` 方法在底层创建新节点
 * 
 * @param editor - TipTap 编辑器实例
 * @param contextProviders - 可用的上下文提供者列表
 */
export function insertCurrentFileContextMention(
  editor: Editor,
  contextProviders: ContextProviderDescription[],
): void {
  try {
    // 查找当前文件提供者
    const foundCurrentFileProvider = contextProviders.find(
      (provider) => provider.title === "currentFile",
    );

    if (!foundCurrentFileProvider) {
      console.warn("Current file context provider not found");
      return;
    }

    // 验证编辑器状态
    if (!editor || !editor.isEditable) {
      console.warn("Editor is not available or not editable");
      return;
    }

    // 创建提及节点
    const mentionNode = editor.schema.nodes[Mention.name]?.create({
      name: foundCurrentFileProvider.displayTitle,
      description: foundCurrentFileProvider.description,
      id: foundCurrentFileProvider.title,
      label: foundCurrentFileProvider.displayTitle,
      renderInlineAs: foundCurrentFileProvider.renderInlineAs,
      type: foundCurrentFileProvider.type,
      itemType: "contextProvider",
    });

    if (!mentionNode) {
      console.error("Failed to create mention node");
      return;
    }

    // 插入节点和空格
    editor
      .chain()
      .insertContent([
        mentionNode.toJSON(), 
        { type: "text", text: " " }
      ])
      .run();

    console.debug("Successfully inserted current file context mention");
  } catch (error) {
    console.error("Error inserting current file context mention:", error);
  }
}

/**
 * 检查是否可以插入当前文件上下文提及
 * 
 * @param contextProviders - 上下文提供者列表
 * @returns 是否可以插入
 */
export function canInsertCurrentFileContextMention(
  contextProviders: ContextProviderDescription[],
): boolean {
  return contextProviders.some(provider => provider.title === "currentFile");
}

/**
 * 获取当前文件上下文提供者信息
 * 
 * @param contextProviders - 上下文提供者列表
 * @returns 当前文件提供者或 null
 */
export function getCurrentFileProvider(
  contextProviders: ContextProviderDescription[],
): ContextProviderDescription | null {
  return contextProviders.find(provider => provider.title === "currentFile") || null;
}
