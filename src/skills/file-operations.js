/**
 * 文件操作技能
 * 提供安全的文件读写、编辑和管理功能
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileOperations {
  constructor(config = {}) {
    this.config = {
      defaultEncoding: config.defaultEncoding || 'utf-8',
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      backupEnabled: config.backupEnabled !== false,
      backupDir: config.backupDir || './backups',
      logger: config.logger || console
    };

    this.logger = this.config.logger;
    this.initialized = false;
  }

  /**
   * 初始化技能
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    // 创建备份目录
    if (this.config.backupEnabled) {
      try {
        await fs.mkdir(this.config.backupDir, { recursive: true });
        this.logger.info(`备份目录已创建: ${this.config.backupDir}`);
      } catch (error) {
        this.logger.warn(`创建备份目录失败: ${error.message}`);
      }
    }

    this.initialized = true;
    this.logger.info('文件操作技能初始化完成');
  }

  /**
   * 检查文件是否存在
   */
  async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 读取文件内容
   */
  async readFile(filePath, options = {}) {
    try {
      const encoding = options.encoding || this.config.defaultEncoding;
      const fullPath = path.resolve(filePath);

      // 检查文件大小
      const stats = await fs.stat(fullPath);
      if (stats.size > this.config.maxFileSize) {
        throw new Error(`文件过大: ${stats.size}字节 (限制: ${this.config.maxFileSize}字节)`);
      }

      const content = await fs.readFile(fullPath, encoding);

      this.logger.debug(`文件读取成功: ${fullPath} (${stats.size}字节)`);
      return content;
    } catch (error) {
      this.logger.error(`读取文件失败: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 写入文件内容
   */
  async writeFile(filePath, content, options = {}) {
    try {
      const encoding = options.encoding || this.config.defaultEncoding;
      const fullPath = path.resolve(filePath);
      const dirPath = path.dirname(fullPath);

      // 创建目录（如果不存在）
      await fs.mkdir(dirPath, { recursive: true });

      // 备份原文件（如果存在且启用备份）
      if (this.config.backupEnabled && await this.exists(fullPath)) {
        await this.backupFile(fullPath);
      }

      // 写入文件
      await fs.writeFile(fullPath, content, encoding);

      this.logger.info(`文件写入成功: ${fullPath} (${content.length}字符)`);
      return {
        success: true,
        path: fullPath,
        size: content.length,
        backupCreated: this.config.backupEnabled
      };
    } catch (error) {
      this.logger.error(`写入文件失败: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 编辑文件（替换特定文本）
   */
  async editFile(filePath, editOptions) {
    try {
      const { oldText, newText } = editOptions;
      
      if (!oldText || !newText) {
        throw new Error('oldText和newText都必须提供');
      }

      const fullPath = path.resolve(filePath);

      // 读取原文件内容
      const content = await this.readFile(fullPath);

      // 检查oldText是否存在
      if (!content.includes(oldText)) {
        throw new Error(`未找到要替换的文本: "${oldText.substring(0, 50)}..."`);
      }

      // 替换文本
      const newContent = content.replace(oldText, newText);

      // 写入新内容
      const result = await this.writeFile(fullPath, newContent);

      this.logger.info(`文件编辑成功: ${fullPath}`);
      return {
        ...result,
        replacements: 1,
        oldTextLength: oldText.length,
        newTextLength: newText.length
      };
    } catch (error) {
      this.logger.error(`编辑文件失败: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 备份文件
   */
  async backupFile(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      const fileName = path.basename(fullPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `${fileName}.backup.${timestamp}`;
      const backupPath = path.join(this.config.backupDir, backupFileName);

      // 复制文件
      await fs.copyFile(fullPath, backupPath);

      this.logger.debug(`文件备份成功: ${backupPath}`);
      return backupPath;
    } catch (error) {
      this.logger.warn(`文件备份失败: ${filePath}`, error);
      return null;
    }
  }

  /**
   * 列出目录中的文件
   */
  async listFiles(dirPath, options = {}) {
    try {
      const fullPath = path.resolve(dirPath);
      const recursive = options.recursive || false;
      const filter = options.filter || [];

      const files = await this._listFilesRecursive(fullPath, recursive, filter);
      
      this.logger.debug(`列出文件: ${fullPath} (找到${files.length}个文件)`);
      return files;
    } catch (error) {
      this.logger.error(`列出文件失败: ${dirPath}`, error);
      throw error;
    }
  }

  /**
   * 递归列出文件
   */
  async _listFilesRecursive(dirPath, recursive, filter, basePath = dirPath) {
    const files = [];
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.relative(basePath, fullPath);

        if (item.isDirectory()) {
          if (recursive) {
            const subFiles = await this._listFilesRecursive(
              fullPath,
              recursive,
              filter,
              basePath
            );
            files.push(...subFiles);
          }
        } else {
          // 应用过滤器
          if (filter.length > 0) {
            const ext = path.extname(item.name).toLowerCase();
            if (!filter.includes(ext)) {
              continue;
            }
          }
          files.push(relativePath);
        }
      }
    } catch (error) {
      // 忽略无权限访问的目录
      if (error.code !== 'EACCES') {
        throw error;
      }
    }

    return files;
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      const stats = await fs.stat(fullPath);

      return {
        path: fullPath,
        name: path.basename(fullPath),
        extension: path.extname(fullPath),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        permissions: stats.mode.toString(8).slice(-3)
      };
    } catch (error) {
      this.logger.error(`获取文件信息失败: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 创建目录
   */
  async createDirectory(dirPath, options = {}) {
    try {
      const fullPath = path.resolve(dirPath);
      const recursive = options.recursive !== false;

      await fs.mkdir(fullPath, { recursive });

      this.logger.info(`目录创建成功: ${fullPath}`);
      return {
        success: true,
        path: fullPath,
        created: true
      };
    } catch (error) {
      // 如果目录已存在，不算错误
      if (error.code === 'EEXIST') {
        this.logger.debug(`目录已存在: ${dirPath}`);
        return {
          success: true,
          path: path.resolve(dirPath),
          created: false,
          existed: true
        };
      }
      
      this.logger.error(`创建目录失败: ${dirPath}`, error);
      throw error;
    }
  }

  /**
   * 删除文件或目录
   */
  async delete(pathToDelete, options = {}) {
    try {
      const fullPath = path.resolve(pathToDelete);
      const recursive = options.recursive || false;
      const force = options.force || false;

      // 检查是否存在
      if (!await this.exists(fullPath)) {
        if (force) {
          return { success: true, path: fullPath, deleted: false, reason: '不存在' };
        }
        throw new Error(`路径不存在: ${fullPath}`);
      }

      const info = await this.getFileInfo(fullPath);

      // 备份（如果启用）
      if (this.config.backupEnabled && info.isFile) {
        await this.backupFile(fullPath);
      }

      if (info.isDirectory) {
        if (recursive) {
          // 递归删除目录
          const files = await this.listFiles(fullPath, { recursive: true });
          for (const file of files.reverse()) {
            const filePath = path.join(fullPath, file);
            await fs.unlink(filePath);
          }
        }
        await fs.rmdir(fullPath);
      } else {
        await fs.unlink(fullPath);
      }

      this.logger.info(`删除成功: ${fullPath}`);
      return {
        success: true,
        path: fullPath,
        deleted: true,
        type: info.isDirectory ? 'directory' : 'file',
        backupCreated: this.config.backupEnabled && info.isFile
      };
    } catch (error) {
      this.logger.error(`删除失败: ${pathToDelete}`, error);
      throw error;
    }
  }

  /**
   * 复制文件或目录
   */
  async copy(source, destination, options = {}) {
    try {
      const sourcePath = path.resolve(source);
      const destPath = path.resolve(destination);
      const recursive = options.recursive || false;

      const sourceInfo = await this.getFileInfo(sourcePath);

      if (sourceInfo.isDirectory) {
        if (!recursive) {
          throw new Error('复制目录需要设置recursive: true');
        }

        // 创建目标目录
        await this.createDirectory(destPath, { recursive: true });

        // 复制目录内容
        const files = await this.listFiles(sourcePath, { recursive: true });
        for (const file of files) {
          const sourceFile = path.join(sourcePath, file);
          const destFile = path.join(destPath, file);
          
          // 创建目标文件的目录
          await this.createDirectory(path.dirname(destFile), { recursive: true });
          
          // 复制文件
          await fs.copyFile(sourceFile, destFile);
        }
      } else {
        // 复制文件
        await fs.copyFile(sourcePath, destPath);
      }

      this.logger.info(`复制成功: ${sourcePath} -> ${destPath}`);
      return {
        success: true,
        source: sourcePath,
        destination: destPath,
        type: sourceInfo.isDirectory ? 'directory' : 'file'
      };
    } catch (error) {
      this.logger.error(`复制失败: ${source} -> ${destination}`, error);
      throw error;
    }
  }

  /**
   * 移动/重命名文件或目录
   */
  async move(source, destination, options = {}) {
    try {
      const sourcePath = path.resolve(source);
      const destPath = path.resolve(destination);

      // 检查源文件是否存在
      if (!await this.exists(sourcePath)) {
        throw new Error(`源文件不存在: ${sourcePath}`);
      }

      // 备份（如果启用）
      if (this.config.backupEnabled) {
        const sourceInfo = await this.getFileInfo(sourcePath);
        if (sourceInfo.isFile) {
          await this.backupFile(sourcePath);
        }
      }

      await fs.rename(sourcePath, destPath);

      this.logger.info(`移动成功: ${sourcePath} -> ${destPath}`);
      return {
        success: true,
        source: sourcePath,
        destination: destPath,
        moved: true
      };
    } catch (error) {
      this.logger.error(`移动失败: ${source} -> ${destination}`, error);
      throw error;
    }
  }

  /**
   * 搜索文件内容
   */
  async searchInFiles(dirPath, searchText, options = {}) {
    try {
      const fullPath = path.resolve(dirPath);
      const recursive = options.recursive || true;
      const caseSensitive = options.caseSensitive || false;
      const fileFilter = options.filter || ['.txt', '.md', '.js', '.json', '.html', '.css'];

      const files = await this.listFiles(fullPath, {
        recursive,
        filter: fileFilter
      });

      const results = [];
      const searchRegex = caseSensitive 
        ? new RegExp(searchText, 'g')
        : new RegExp(searchText, 'gi');

      for (const file of files) {
        const filePath = path.join(fullPath, file);
        
        try {
          const content = await this.readFile(filePath);
          const matches = content.match(searchRegex);

          if (matches) {
            results.push({
              file: file,
              path: filePath,
              matchCount: matches.length,
              sample: content.substring(0, 200) // 前200个字符作为样本
            });
          }
        } catch (error) {
          // 忽略无法读取的文件
          this.logger.debug(`无法搜索文件: ${filePath}`, error.message);
        }
      }

      this.logger.debug(`文件内容搜索完成: 搜索"${searchText}"，在${files.length}个文件中找到${results.length}个匹配`);
      return results;
    } catch (error) {
      this.logger.error(`文件内容搜索失败: ${dirPath}`, error);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      // 测试文件操作
      const testDir = './.fileops-test';
      const testFile = path.join(testDir, 'test.txt');
      const testContent = '健康检查测试内容 ' + uuidv4();

      // 创建测试目录
      await this.createDirectory(testDir);

      // 测试写入
      await this.writeFile(testFile, testContent);

      // 测试读取
      const readContent = await this.readFile(testFile);
      const writeReadMatch = readContent === testContent;

      // 测试编辑
      await this.editFile(testFile, {
        oldText: '健康检查',
        newText: '健康检查通过'
      });

      // 清理测试文件
      await this.delete(testDir, { recursive: true });

      return {
        status: writeReadMatch ? 'healthy' : 'degraded',
        checks: {
          writeRead: writeReadMatch,
          edit: true,
          delete: true
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    // 清理备份目录中的旧备份文件（保留最近7天）
    if (this.config.backupEnabled) {
      try {
        const backupFiles = await this.listFiles(this.config.backupDir);
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        for (const file of backupFiles) {
          const filePath = path.join(this.config.backupDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtimeMs < weekAgo) {
            await fs.unlink(filePath);
            this.logger.debug(`清理旧备份文件: ${file}`);
          }
        }
      } catch (error) {
        this.logger.warn('清理备份文件失败:', error.message);
      }
    }

    this.initialized = false;
    this.logger.info('文件操作技能清理完成');
  }
}

module.exports = FileOperations;