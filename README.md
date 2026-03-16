# Agent Essential Skills

![ClawHub](https://img.shields.io/clawhub/v/agent-essential-skills)
![GitHub Actions](https://github.com/opencc2026/agent-essential-skills/actions/workflows/publish-to-clawhub.yml/badge.svg)
![License](https://img.shields.io/github/license/opencc2026/agent-essential-skills)
![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

一个包含Agent开发必备基础技能的技能包，帮助开发者快速构建功能完整的AI Agent。

## 🎯 功能概述

这个技能包提供Agent开发中最常用的基础技能，帮助开发者快速构建功能完整的AI Agent。

## 📦 包含的技能

### 1. 基础工具技能
- 文件操作（读/写/编辑）
- 命令行执行
- 网络搜索和获取
- 会话管理
- 内存管理

### 2. 开发辅助技能
- 代码分析和审查
- 项目结构建议
- 技术栈选型
- 部署指导

### 3. 办公自动化技能
- 文档处理
- 会议管理
- 任务跟踪
- 报告生成

## 🚀 快速开始

### 安装
```bash
# 使用clawhub安装
clawhub install opencc2026/agent-essential-skills

# 或者直接克隆
git clone https://github.com/opencc2026/agent-essential-skills.git
cd agent-essential-skills
npm install
```

### 使用示例
```javascript
// 导入技能包
const AgentEssentials = require('agent-essential-skills');

// 创建技能实例
const essentials = new AgentEssentials();

// 初始化
await essentials.initialize();

// 使用文件操作技能
const content = await essentials.getFileOperations().readFile('path/to/file.txt');

// 使用命令行技能
const result = await essentials.getCommandExecutor().run('ls -la');

// 使用网络搜索技能
const searchResults = await essentials.getWebOperations().search('AI tools');
```

## 📁 项目结构
```
agent-essential-skills/
├── README.md
├── SKILL.md
├── package.json
├── .github/workflows/
│   └── publish-to-clawhub.yml
├── src/
│   ├── index.js              # 主入口文件
│   └── skills/
│       ├── file-operations.js # 文件操作技能
│       ├── command-executor.js # 命令行执行技能
│       ├── web-operations.js  # 网络操作技能
│       ├── session-manager.js # 会话管理技能
│       └── memory-manager.js  # 内存管理技能
└── tests/
    └── basic.test.js
```

## 🔧 开发指南

### 添加新技能
1. 在 `src/skills/` 目录创建新技能文件
2. 实现技能的核心功能
3. 编写测试用例
4. 更新文档

### 技能规范
- 每个技能应该是独立的模块
- 提供清晰的API文档
- 包含错误处理
- 支持配置和扩展

## 🤝 贡献

欢迎贡献新技能或改进现有技能！

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 📄 许可证

MIT License - 详见LICENSE文件

## 🆘 支持

- 问题报告: [GitHub Issues](https://github.com/opencc2026/agent-essential-skills/issues)
- 讨论: [GitHub Discussions](https://github.com/opencc2026/agent-essential-skills/discussions)
- 文档: 项目Wiki

## 🔄 自动发布

本项目使用GitHub Actions自动发布到ClawHub。每次推送到main分支时，会自动：
1. 运行测试
2. 验证技能结构
3. 发布到ClawHub
4. 创建GitHub发布版本

### 设置自动发布
1. 在GitHub仓库设置中添加 `CLAWHUB_TOKEN` 密钥
2. 每次推送到main分支会自动触发发布流程

---

**呷呷！让Agent开发变得更简单！** 🚀