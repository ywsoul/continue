import { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { SuggestionOptions } from "@tiptap/suggestion";

/**
 * 提及选项类型定义
 * 扩展了基础的 TipTap 节点选项
 */
export interface MentionOptions {
  HTMLAttributes: Record<string, any>;
  renderHTML: (props: {
    options: MentionOptions;
    node: ProseMirrorNode;
  }) => DOMOutputSpec;
  suggestion: Omit<SuggestionOptions, "editor">;
}

/**
 * 提及节点属性接口
 */
export interface MentionNodeAttributes {
  id: string | null;
  label: string | null;
  renderInlineAs: string | null;
  query: string | null;
  itemType: string | null;
}

/**
 * 提及命令参数接口
 */
export interface MentionCommandProps {
  editor: any;
  range: any;
  props: any;
}

/**
 * 提及允许检查参数接口
 */
export interface MentionAllowProps {
  state: any;
  range: any;
}

/**
 * 提及配置选项
 */
export interface MentionConfig {
  /**
   * 触发字符，默认为 "@"
   */
  char: string;
  
  /**
   * 是否允许在提及中使用空格
   */
  allowSpaces: boolean;
  
  /**
   * CSS 类名
   */
  className: string;
  
  /**
   * 最大显示高度
   */
  maxHeight: string;
  
  /**
   * 自定义渲染函数
   */
  customRenderer?: (node: ProseMirrorNode) => DOMOutputSpec;
}
