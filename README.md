<div align="center">

![Continue logo](media/readme.png)

</div>

<h1 align="center">Continue</h1>

<div align="center">

**[Continue](https://docs.continue.dev) enables developers to create, share, and use custom AI code assistants with our
open-source [VS Code](https://marketplace.visualstudio.com/items?itemName=Continue.continue)
and [JetBrains](https://plugins.jetbrains.com/plugin/22707-continue-extension) extensions
and [hub of models, rules, prompts, docs, and other building blocks](https://hub.continue.dev)**

</div>

<div align="center">

<a target="_blank" href="https://opensource.org/licenses/Apache-2.0" style="background:none">
    <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" style="height: 22px;" />
</a>
<a target="_blank" href="https://docs.continue.dev" style="background:none">
    <img src="https://img.shields.io/badge/continue_docs-%23BE1B55" style="height: 22px;" />
</a>
<a target="_blank" href="https://changelog.continue.dev" style="background:none">
    <img src="https://img.shields.io/badge/changelog-%96EFF3" style="height: 22px;" />
</a>
<a target="_blank" href="https://discord.gg/vapESyrFmJ" style="background:none">
    <img src="https://img.shields.io/badge/discord-join-continue.svg?labelColor=191937&color=6F6FF7&logo=discord" style="height: 22px;" />
</a>

<p></p>

## Agent

[Agent](https://continue.dev/docs/agent/how-to-use-it) enables you to make more substantial changes to your codebase

![agent](docs/static/img/agent.gif)

## Chat

[Chat](https://continue.dev/docs/chat/how-to-use-it) makes it easy to ask for help from an LLM without needing to leave
the IDE

![chat](docs/static/img/chat.gif)

## Autocomplete

[Autocomplete](https://continue.dev/docs/autocomplete/how-to-use-it) provides inline code suggestions as you type

![autocomplete](docs/static/img/autocomplete.gif)

## Edit

[Edit](https://continue.dev/docs/edit/how-to-use-it) is a convenient way to modify code without leaving your current
file

![edit](docs/static/img/edit.gif)

## 核心特性

### 🤖 AI 驱动的代码助手
- **智能代码补全**: 基于上下文的代码建议和自动补全
- **代码重构**: 智能重构建议，提高代码质量
- **错误检测**: 实时检测和修复代码中的潜在问题

### 🔧 开发工具集成
- **VS Code 扩展**: 无缝集成 VS Code 开发环境
- **JetBrains 插件**: 支持 IntelliJ IDEA、WebStorm 等 IDE
- **命令行工具**: 提供强大的命令行界面

### 📚 知识库管理
- **自定义规则**: 创建和分享自定义 AI 规则
- **提示词库**: 丰富的提示词模板库
- **文档生成**: 自动生成代码文档和注释

### 🌟 高级功能
- **多模型支持**: 支持多种 AI 模型
- **版本控制**: 与 Git 完美集成
- **团队协作**: 支持团队共享配置和规则

</div>

## Getting Started

Learn about how to install and use Continue in the docs [here](https://continue.dev/docs/getting-started/install)

## 代码格式化

本项目使用 [Prettier](https://prettier.io/) 统一代码风格。

- 执行 `npm run format` 可自动格式化所有代码文件。
- 提交前建议运行 `npm run format:check` 检查格式。
- 配置详见 `.prettierrc`，忽略文件见 `.prettierignore`。

## Contributing

Read the [contributing guide](https://github.com/continuedev/continue/blob/main/CONTRIBUTING.md), and
join [#contribute on Discord](https://discord.gg/vapESyrFmJ).

## License

[Apache 2.0 © 2023-2024 Continue Dev, Inc.](./LICENSE)
