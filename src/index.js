/**
 * Agent Essential Skills - 主入口文件
 * 提供Agent开发必备的基础技能集合
 */

const FileOperations = require('./skills/file-operations');
const CommandExecutor = require('./skills/command-executor');
const WebOperations = require('./skills/web-operations');
const SessionManager = require('./skills/session-manager');
const MemoryManager = require('./skills/memory-manager');

class AgentEssentialSkills {
  constructor(config = {}) {
    // 初始化配置
    this.config = {
      fileOperations: config.fileOperations || {},
      commandExecutor: config.commandExecutor || {},
      webOperations: config.webOperations || {},
      sessionManager: config.sessionManager || {},
      memoryManager: config.memoryManager || {},
      logger: config.logger || console
    };

    // 初始化技能实例
    this.skills = {
      fileOperations: new FileOperations(this.config.fileOperations),
      commandExecutor: new CommandExecutor(this.config.commandExecutor),
      webOperations: new WebOperations(this.config.webOperations),
      sessionManager: new SessionManager(this.config.sessionManager),
      memoryManager: new MemoryManager(this.config.memoryManager)
    };

    this.logger = this.config.logger;
    this.initialized = false;
  }

  /**
   * 初始化所有技能
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    this.logger.info('正在初始化Agent Essential Skills...');

    try {
      // 按顺序初始化技能
      await this.skills.fileOperations.initialize();
      await this.skills.commandExecutor.initialize();
      await this.skills.webOperations.initialize();
      await this.skills.sessionManager.initialize();
      await this.skills.memoryManager.initialize();

      this.initialized = true;
      this.logger.info('Agent Essential Skills 初始化完成');
    } catch (error) {
      this.logger.error('初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取文件操作技能
   */
  getFileOperations() {
    return this.skills.fileOperations;
  }

  /**
   * 获取命令行执行技能
   */
  getCommandExecutor() {
    return this.skills.commandExecutor;
  }

  /**
   * 获取网络操作技能
   */
  getWebOperations() {
    return this.skills.webOperations;
  }

  /**
   * 获取会话管理技能
   */
  getSessionManager() {
    return this.skills.sessionManager;
  }

  /**
   * 获取内存管理技能
   */
  getMemoryManager() {
    return this.skills.memoryManager;
  }

  /**
   * 获取所有技能
   */
  getAllSkills() {
    return this.skills;
  }

  /**
   * 执行复合任务
   */
  async executeTask(taskName, parameters) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.logger.info(`执行任务: ${taskName}`, parameters);

    switch (taskName) {
      case 'analyzeProject':
        return this.analyzeProject(parameters);
      case 'generateReport':
        return this.generateReport(parameters);
      case 'setupDevelopmentEnvironment':
        return this.setupDevelopmentEnvironment(parameters);
      default:
        throw new Error(`未知任务: ${taskName}`);
    }
  }

  /**
   * 分析项目
   */
  async analyzeProject({ projectPath }) {
    try {
      // 1. 读取项目文件
      const files = await this.skills.fileOperations.listFiles(projectPath, {
        recursive: true,
        filter: ['.js', '.json', '.md', '.txt']
      });

      // 2. 分析项目结构
      const stats = await this.skills.commandExecutor.run(
        `find "${projectPath}" -type f -name "*.js" -o -name "*.json" | wc -l`
      );

      // 3. 读取package.json（如果存在）
      let packageInfo = {};
      try {
        const packageContent = await this.skills.fileOperations.readFile(
          `${projectPath}/package.json`
        );
        packageInfo = JSON.parse(packageContent);
      } catch (error) {
        this.logger.warn('未找到package.json文件');
      }

      // 4. 生成分析报告
      const analysis = {
        projectPath,
        fileCount: parseInt(stats.stdout.trim()) || 0,
        files: files.slice(0, 20), // 只显示前20个文件
        packageInfo: {
          name: packageInfo.name,
          version: packageInfo.version,
          dependencies: Object.keys(packageInfo.dependencies || {}).length,
          devDependencies: Object.keys(packageInfo.devDependencies || {}).length
        },
        analyzedAt: new Date().toISOString()
      };

      // 5. 保存分析结果
      await this.skills.fileOperations.writeFile(
        `${projectPath}/project-analysis.json`,
        JSON.stringify(analysis, null, 2)
      );

      // 6. 保存到记忆
      await this.skills.memoryManager.save('project-analysis', analysis);

      return analysis;
    } catch (error) {
      this.logger.error('项目分析失败:', error);
      throw error;
    }
  }

  /**
   * 生成报告
   */
  async generateReport({ data, outputPath, format = 'markdown' }) {
    try {
      let reportContent;

      if (format === 'markdown') {
        reportContent = this.generateMarkdownReport(data);
      } else if (format === 'json') {
        reportContent = JSON.stringify(data, null, 2);
      } else {
        throw new Error(`不支持的格式: ${format}`);
      }

      await this.skills.fileOperations.writeFile(outputPath, reportContent);

      this.logger.info(`报告已生成: ${outputPath}`);
      return {
        success: true,
        path: outputPath,
        size: reportContent.length
      };
    } catch (error) {
      this.logger.error('生成报告失败:', error);
      throw error;
    }
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport(data) {
    return `# 项目分析报告

## 基本信息
- **分析时间**: ${new Date().toISOString()}
- **项目路径**: ${data.projectPath}
- **文件总数**: ${data.fileCount}

## 项目结构
\`\`\`json
${JSON.stringify(data.packageInfo, null, 2)}
\`\`\`

## 主要文件
${data.files.map(file => `- ${file}`).join('\n')}

## 建议
1. 确保所有依赖都是最新版本
2. 添加必要的测试文件
3. 完善项目文档
4. 设置代码质量检查工具

---
*报告由 Agent Essential Skills 生成*
`;
  }

  /**
   * 设置开发环境
   */
  async setupDevelopmentEnvironment({ projectPath, tools = [] }) {
    try {
      const results = [];

      // 检查Node.js版本
      const nodeVersion = await this.skills.commandExecutor.run('node --version');
      results.push({
        tool: 'Node.js',
        version: nodeVersion.stdout.trim(),
        status: 'installed'
      });

      // 检查npm
      const npmVersion = await this.skills.commandExecutor.run('npm --version');
      results.push({
        tool: 'npm',
        version: npmVersion.stdout.trim(),
        status: 'installed'
      });

      // 检查Git
      try {
        const gitVersion = await this.skills.commandExecutor.run('git --version');
        results.push({
          tool: 'Git',
          version: gitVersion.stdout.trim(),
          status: 'installed'
        });
      } catch (error) {
        results.push({
          tool: 'Git',
          version: '未安装',
          status: 'missing'
        });
      }

      // 创建基础项目结构
      const projectStructure = [
        'src/',
        'tests/',
        'docs/',
        '.gitignore',
        'README.md',
        'package.json'
      ];

      for (const item of projectStructure) {
        if (item.endsWith('/')) {
          await this.skills.commandExecutor.run(`mkdir -p "${projectPath}/${item}"`);
        } else {
          const filePath = `${projectPath}/${item}`;
          if (!await this.skills.fileOperations.exists(filePath)) {
            await this.skills.fileOperations.writeFile(filePath, '');
          }
        }
      }

      // 初始化Git仓库（如果Git已安装）
      const gitInstalled = results.find(r => r.tool === 'Git' && r.status === 'installed');
      if (gitInstalled) {
        try {
          await this.skills.commandExecutor.run(
            `cd "${projectPath}" && git init`
          );
          results.push({
            tool: 'Git Repository',
            status: 'initialized'
          });
        } catch (error) {
          this.logger.warn('Git仓库初始化失败:', error.message);
        }
      }

      return {
        success: true,
        results,
        projectPath,
        setupAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('设置开发环境失败:', error);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    const checks = {};

    try {
      checks.fileOperations = await this.skills.fileOperations.healthCheck();
    } catch (error) {
      checks.fileOperations = { status: 'error', error: error.message };
    }

    try {
      checks.commandExecutor = await this.skills.commandExecutor.healthCheck();
    } catch (error) {
      checks.commandExecutor = { status: 'error', error: error.message };
    }

    try {
      checks.webOperations = await this.skills.webOperations.healthCheck();
    } catch (error) {
      checks.webOperations = { status: 'error', error: error.message };
    }

    try {
      checks.sessionManager = await this.skills.sessionManager.healthCheck();
    } catch (error) {
      checks.sessionManager = { status: 'error', error: error.message };
    }

    try {
      checks.memoryManager = await this.skills.memoryManager.healthCheck();
    } catch (error) {
      checks.memoryManager = { status: 'error', error: error.message };
    }

    const allHealthy = Object.values(checks).every(
      check => check.status === 'healthy'
    );

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      initialized: this.initialized,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 清理资源
   */
  async cleanup() {
    this.logger.info('正在清理资源...');

    const cleanupTasks = [
      this.skills.fileOperations.cleanup(),
      this.skills.commandExecutor.cleanup(),
      this.skills.webOperations.cleanup(),
      this.skills.sessionManager.cleanup(),
      this.skills.memoryManager.cleanup()
    ];

    await Promise.allSettled(cleanupTasks);
    this.initialized = false;

    this.logger.info('资源清理完成');
  }
}

// 导出主类
module.exports = AgentEssentialSkills;

// 也导出各个技能类，方便单独使用
module.exports.FileOperations = FileOperations;
module.exports.CommandExecutor = CommandExecutor;
module.exports.WebOperations = WebOperations;
module.exports.SessionManager = SessionManager;
module.exports.MemoryManager = MemoryManager;

// 导出工具函数
module.exports.utils = {
  formatBytes: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  formatTimestamp: (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
};