---
name: agent-essential-skills
description: 一个包含Agent开发必备基础技能的技能包，帮助开发者快速构建功能完整的AI Agent。包含文件操作、命令行执行、网络搜索、会话管理等核心功能。
tags:
  - agent-development
  - essential-tools
  - beginner-friendly
  - productivity
version: 0.1.0
author: opencc2026
---

# Agent Essential Skills

## 🎯 技能概述

这个技能包为Agent开发者提供了一组最常用的基础技能，让你能够快速开始Agent开发，而无需从头构建所有基础功能。

## 📋 使用场景

当用户需要：
- 开始学习Agent开发
- 快速构建一个功能完整的Agent
- 寻找Agent开发的基础工具
- 需要一个标准化的技能集合作为起点

## 🛠️ 包含的核心技能

### 1. 文件操作技能 (File Operations)
- **读取文件** - 安全地读取各种格式的文件
- **写入文件** - 创建或覆盖文件内容
- **编辑文件** - 精确修改文件内容
- **文件管理** - 列出、移动、删除文件

### 2. 命令行执行技能 (Command Execution)
- **执行Shell命令** - 运行系统命令并获取结果
- **进程管理** - 管理后台运行的进程
- **环境配置** - 设置和管理执行环境

### 3. 网络操作技能 (Web Operations)
- **网络搜索** - 使用搜索引擎获取信息
- **网页获取** - 抓取和解析网页内容
- **API调用** - 与外部服务进行HTTP通信

### 4. 会话管理技能 (Session Management)
- **会话创建** - 启动新的会话或子会话
- **消息传递** - 在会话间发送消息
- **状态管理** - 跟踪和管理会话状态

### 5. 内存管理技能 (Memory Management)
- **记忆存储** - 保存重要的信息和上下文
- **记忆检索** - 快速查找相关记忆
- **记忆组织** - 结构化存储记忆内容

## 🚀 快速开始

### 安装
```bash
# 使用clawhub安装
clawhub install opencc2026/agent-essential-skills

# 或者使用npm（如果发布到npm）
npm install agent-essential-skills
```

### 基本使用
```javascript
// 导入技能包
const AgentEssentials = require('agent-essential-skills');

// 创建技能实例
const essentials = new AgentEssentials();

// 使用文件操作技能
const content = await essentials.fileOperations.readFile('path/to/file.txt');

// 使用命令行技能
const result = await essentials.commandExecutor.run('ls -la');

// 使用网络搜索技能
const searchResults = await essentials.webSearch.search('AI tools');
```

### 在OpenClaw中使用
```yaml
# 在OpenClaw配置中引用
skills:
  - name: agent-essential-skills
    version: 0.1.0
    enabled: true
```

## 📖 详细使用指南

### 文件操作示例
```javascript
const fileOps = essentials.fileOperations;

// 读取文件
const content = await fileOps.readFile('./data/config.json');

// 写入文件
await fileOps.writeFile('./output/report.md', '# 分析报告\n\n内容...');

// 编辑文件
await fileOps.editFile('./src/index.js', {
  oldText: 'console.log("old");',
  newText: 'console.log("new");'
});
```

### 命令行执行示例
```javascript
const cmd = essentials.commandExecutor;

// 执行简单命令
const { stdout, stderr } = await cmd.run('pwd');

// 执行带工作目录的命令
const result = await cmd.run('npm install', {
  workdir: './project'
});

// 管理后台进程
const process = await cmd.runBackground('node server.js');
// 稍后停止进程
await process.stop();
```

### 网络操作示例
```javascript
const web = essentials.webOperations;

// 搜索网络
const searchResults = await web.search({
  query: '最新AI技术趋势',
  count: 10
});

// 获取网页内容
const pageContent = await web.fetch('https://example.com', {
  extractMode: 'markdown'
});

// 调用API
const apiResponse = await web.apiCall({
  url: 'https://api.example.com/data',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token'
  }
});
```

## 🔧 配置选项

### 全局配置
```javascript
const essentials = new AgentEssentials({
  // 文件操作配置
  fileOperations: {
    defaultEncoding: 'utf-8',
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  
  // 命令行配置
  commandExecutor: {
    timeout: 30000, // 30秒超时
    shell: '/bin/bash'
  },
  
  // 网络操作配置
  webOperations: {
    searchEngine: 'brave', // 或 'google', 'bing'
    userAgent: 'Agent-Essential-Skills/0.1.0'
  }
});
```

### 环境变量
```bash
# 文件操作相关
MAX_FILE_SIZE=10485760
DEFAULT_ENCODING=utf-8

# 命令行相关
COMMAND_TIMEOUT=30000
DEFAULT_SHELL=/bin/bash

# 网络操作相关
SEARCH_ENGINE_API_KEY=your_api_key
USER_AGENT=Agent-Essential-Skills
```

## 🧪 测试

### 运行测试
```bash
# 安装测试依赖
npm install --save-dev jest

# 运行所有测试
npm test

# 运行特定测试
npm test -- file-operations.test.js
```

### 测试示例
```javascript
// file-operations.test.js
const { FileOperations } = require('../src/skills/file-operations');

describe('File Operations', () => {
  let fileOps;
  
  beforeEach(() => {
    fileOps = new FileOperations();
  });
  
  test('should read file content', async () => {
    const content = await fileOps.readFile('test.txt');
    expect(content).toBe('test content');
  });
  
  test('should write file', async () => {
    await fileOps.writeFile('output.txt', 'new content');
    const content = await fileOps.readFile('output.txt');
    expect(content).toBe('new content');
  });
});
```

## 📈 高级用法

### 技能组合
```javascript
// 组合多个技能完成复杂任务
async function analyzeProject(projectPath) {
  // 1. 读取项目文件
  const files = await essentials.fileOperations.listFiles(projectPath);
  
  // 2. 分析项目结构
  const analysis = await essentials.commandExecutor.run(
    `find ${projectPath} -name "*.js" -o -name "*.json" | wc -l`
  );
  
  // 3. 搜索相关技术信息
  const techInfo = await essentials.webOperations.search(
    'JavaScript project best practices'
  );
  
  // 4. 生成报告
  const report = {
    fileCount: parseInt(analysis.stdout),
    files: files.slice(0, 10),
    recommendations: techInfo.slice(0, 5)
  };
  
  // 5. 保存报告
  await essentials.fileOperations.writeFile(
    `${projectPath}/analysis-report.json`,
    JSON.stringify(report, null, 2)
  );
  
  return report;
}
```

### 错误处理
```javascript
try {
  const result = await essentials.fileOperations.readFile('nonexistent.txt');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('文件不存在，创建新文件');
    await essentials.fileOperations.writeFile('nonexistent.txt', '新内容');
  } else {
    console.error('读取文件失败:', error.message);
    // 记录错误到日志
    await essentials.fileOperations.writeFile(
      'error.log',
      `${new Date().toISOString()}: ${error.message}\n`,
      { append: true }
    );
  }
}
```

## 🔍 技能搜索关键词

当用户搜索以下关键词时，这个技能应该被推荐：
- "agent开发基础"
- "必备agent技能"
- "agent入门工具"
- "agent文件操作"
- "agent命令行"
- "agent网络搜索"
- "agent会话管理"

## 🤝 贡献指南

### 添加新技能
1. 在 `src/skills/` 目录创建新文件
2. 实现技能类，继承BaseSkill
3. 编写详细的文档
4. 添加测试用例
5. 更新SKILL.md中的功能列表

### 代码规范
- 使用ES6+语法
- 添加JSDoc注释
- 遵循Airbnb代码风格
- 编写有意义的提交信息

## 📄 许可证

MIT License - 详见LICENSE文件

## 🆘 支持

- **问题报告**: [GitHub Issues](https://github.com/opencc2026/agent-essential-skills/issues)
- **讨论**: [GitHub Discussions](https://github.com/opencc2026/agent-essential-skills/discussions)
- **文档**: 项目Wiki
- **邮件**: opencc2026@hotmail.com

## 🚀 路线图

### v0.1.0 (当前)
- 基础文件操作
- 命令行执行
- 网络搜索和获取
- 基础会话管理

### v0.2.0 (计划中)
- 数据库操作技能
- 缓存管理
- 身份验证和授权
- 更高级的错误处理

### v0.3.0 (计划中)
- 机器学习基础技能
- 数据可视化
- 性能监控
- 部署自动化

---

**呷呷！开始你的Agent开发之旅吧！** 🎯