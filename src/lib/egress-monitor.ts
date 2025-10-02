// Egress monitoring utility to track and limit database usage
class EgressMonitor {
  private static instance: EgressMonitor;
  private requestCount = 0;
  private lastReset = Date.now();
  private readonly MAX_REQUESTS_PER_HOUR = 100; // Limit requests per hour

  static getInstance(): EgressMonitor {
    if (!EgressMonitor.instance) {
      EgressMonitor.instance = new EgressMonitor();
    }
    return EgressMonitor.instance;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Reset counter if more than an hour has passed
    if (now - this.lastReset > oneHour) {
      this.requestCount = 0;
      this.lastReset = now;
    }

    return this.requestCount < this.MAX_REQUESTS_PER_HOUR;
  }

  recordRequest(): void {
    this.requestCount++;
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  getTimeUntilReset(): number {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const timeSinceReset = now - this.lastReset;
    return Math.max(0, oneHour - timeSinceReset);
  }
}

export const egressMonitor = EgressMonitor.getInstance();
