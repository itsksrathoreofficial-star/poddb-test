export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  podcastId?: string;
  episodeId?: string;
  duration?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  stackTrace?: string;
}

export interface LogFilter {
  level?: LogLevel;
  category?: string;
  podcastId?: string;
  episodeId?: string;
  startTime?: Date;
  endTime?: Date;
  searchTerm?: string;
}

export class AdvancedLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;
  private listeners: ((log: LogEntry) => void)[] = [];
  private isEnabled: boolean = true;
  private logLevel: LogLevel = LogLevel.INFO;

  constructor(maxLogs: number = 10000) {
    this.maxLogs = maxLogs;
  }

  // Enable/disable logging
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Set log level
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Add log entry
  log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    podcastId?: string,
    episodeId?: string
  ): void {
    if (!this.isEnabled || level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      podcastId,
      episodeId,
      duration: this.calculateDuration(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
      stackTrace: level >= LogLevel.ERROR ? this.getStackTrace() : undefined
    };

    this.addLog(logEntry);
    this.notifyListeners(logEntry);
  }

  // Debug log
  debug(category: string, message: string, data?: any, podcastId?: string, episodeId?: string): void {
    this.log(LogLevel.DEBUG, category, message, data, podcastId, episodeId);
  }

  // Info log
  info(category: string, message: string, data?: any, podcastId?: string, episodeId?: string): void {
    this.log(LogLevel.INFO, category, message, data, podcastId, episodeId);
  }

  // Warning log
  warn(category: string, message: string, data?: any, podcastId?: string, episodeId?: string): void {
    this.log(LogLevel.WARN, category, message, data, podcastId, episodeId);
  }

  // Error log
  error(category: string, message: string, data?: any, podcastId?: string, episodeId?: string): void {
    this.log(LogLevel.ERROR, category, message, data, podcastId, episodeId);
  }

  // Critical log
  critical(category: string, message: string, data?: any, podcastId?: string, episodeId?: string): void {
    this.log(LogLevel.CRITICAL, category, message, data, podcastId, episodeId);
  }

  // Sync specific logging methods
  syncStart(podcastId: string, totalEpisodes: number): void {
    this.info('sync', `Starting sync for podcast ${podcastId}`, { totalEpisodes }, podcastId);
  }

  syncProgress(podcastId: string, processed: number, total: number, currentEpisode?: string): void {
    this.debug('sync', `Progress: ${processed}/${total} episodes processed`, 
      { processed, total, currentEpisode }, podcastId);
  }

  syncComplete(podcastId: string, processed: number, duration: number): void {
    this.info('sync', `Sync completed for podcast ${podcastId}`, 
      { processed, duration }, podcastId);
  }

  syncError(podcastId: string, error: Error, episodeId?: string): void {
    this.error('sync', `Sync error: ${error.message}`, 
      { error: error.stack }, podcastId, episodeId);
  }

  episodeProcessed(podcastId: string, episodeId: string, duration: number): void {
    this.debug('episode', `Episode processed`, 
      { duration }, podcastId, episodeId);
  }

  episodeError(podcastId: string, episodeId: string, error: Error): void {
    this.error('episode', `Episode processing error: ${error.message}`, 
      { error: error.stack }, podcastId, episodeId);
  }

  databaseOperation(operation: string, table: string, duration: number, recordCount?: number): void {
    this.debug('database', `Database ${operation} on ${table}`, 
      { operation, table, duration, recordCount });
  }

  memoryWarning(usage: number, limit: number): void {
    this.warn('memory', `Memory usage high: ${usage}MB / ${limit}MB`, 
      { usage, limit });
  }

  performanceMetric(metric: string, value: number, unit: string): void {
    this.info('performance', `Performance metric: ${metric}`, 
      { metric, value, unit });
  }

  // Get logs with filtering
  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level >= filter.level!);
      }

      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filter.category);
      }

      if (filter.podcastId) {
        filteredLogs = filteredLogs.filter(log => log.podcastId === filter.podcastId);
      }

      if (filter.episodeId) {
        filteredLogs = filteredLogs.filter(log => log.episodeId === filter.episodeId);
      }

      if (filter.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startTime!);
      }

      if (filter.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endTime!);
      }

      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchTerm) ||
          log.category.toLowerCase().includes(searchTerm)
        );
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.getLogs({ category });
  }

  // Get error logs
  getErrorLogs(): LogEntry[] {
    return this.getLogs({ level: LogLevel.ERROR });
  }

  // Get logs for specific podcast
  getPodcastLogs(podcastId: string): LogEntry[] {
    return this.getLogs({ podcastId });
  }

  // Get recent logs
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count).reverse();
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Export logs
  exportLogs(format: 'json' | 'csv' | 'txt' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2);
      case 'csv':
        return this.exportToCSV();
      case 'txt':
        return this.exportToText();
      default:
        return JSON.stringify(this.logs, null, 2);
    }
  }

  // Subscribe to log events
  subscribe(listener: (log: LogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get log statistics
  getStatistics(): {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    debugCount: number;
    criticalCount: number;
    categories: Record<string, number>;
    timeRange: { start: Date; end: Date };
  } {
    const stats = {
      totalLogs: this.logs.length,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0,
      criticalCount: 0,
      categories: {} as Record<string, number>,
      timeRange: { start: new Date(), end: new Date() }
    };

    if (this.logs.length === 0) {
      return stats;
    }

    let earliest = this.logs[0].timestamp;
    let latest = this.logs[0].timestamp;

    for (const log of this.logs) {
      // Count by level
      switch (log.level) {
        case LogLevel.DEBUG:
          stats.debugCount++;
          break;
        case LogLevel.INFO:
          stats.infoCount++;
          break;
        case LogLevel.WARN:
          stats.warningCount++;
          break;
        case LogLevel.ERROR:
          stats.errorCount++;
          break;
        case LogLevel.CRITICAL:
          stats.criticalCount++;
          break;
      }

      // Count by category
      stats.categories[log.category] = (stats.categories[log.category] || 0) + 1;

      // Track time range
      if (log.timestamp < earliest) {
        earliest = log.timestamp;
      }
      if (log.timestamp > latest) {
        latest = log.timestamp;
      }
    }

    stats.timeRange = { start: earliest, end: latest };
    return stats;
  }

  // Private methods
  private addLog(log: LogEntry): void {
    this.logs.push(log);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private notifyListeners(log: LogEntry): void {
    this.listeners.forEach(listener => {
      try {
        listener(log);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateDuration(): number {
    // This would calculate duration since last log
    return 0;
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  private getCpuUsage(): number {
    // This would require a more sophisticated implementation
    return 0;
  }

  private getStackTrace(): string {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(2).join('\n') : '';
  }

  private exportToCSV(): string {
    if (this.logs.length === 0) {
      return '';
    }

    const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Podcast ID', 'Episode ID', 'Duration', 'Memory Usage'];
    const rows = this.logs.map(log => [
      log.timestamp.toISOString(),
      LogLevel[log.level],
      log.category,
      `"${log.message.replace(/"/g, '""')}"`,
      log.podcastId || '',
      log.episodeId || '',
      log.duration || '',
      log.memoryUsage || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private exportToText(): string {
    return this.logs.map(log => {
      const level = LogLevel[log.level].padEnd(8);
      const category = log.category.padEnd(12);
      const timestamp = log.timestamp.toISOString();
      return `[${timestamp}] ${level} ${category} ${log.message}`;
    }).join('\n');
  }
}

// Export singleton instance
export const logger = new AdvancedLogger();
