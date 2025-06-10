import { Injectable, DestroyRef, inject } from '@angular/core';
import { Observable, Subscription, Subject } from 'rxjs';
import { tap, finalize, share } from 'rxjs/operators';

export interface SubscriptionDebugInfo {
  id: string;
  componentName?: string;
  operatorName?: string;
  createdAt: Date;
  stackTrace?: string;
  isActive: boolean;
  emissionCount: number;
  errorCount: number;
  lastEmission?: Date;
  lastError?: Date;
  memoryUsage?: number;
  duration?: number;
}

export interface PerformanceMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalEmissions: number;
  totalErrors: number;
  averageLifetime: number;
  memoryUsage: number;
  leaksDetected: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionDebuggerService {
  private subscriptions = new Map<string, SubscriptionDebugInfo>();
  private debugCounter = 0;
  private isEnabled = false;
  private performanceObserver?: PerformanceObserver;
  private memoryInterval?: NodeJS.Timeout;

  constructor() {
    this.setupPerformanceMonitoring();
    this.setupMemoryMonitoring();
  }

  /**
   * Enable debugging mode
   */
  enable(): void {
    this.isEnabled = true;
    console.log('🔍 SubscriptionDebugger enabled');
  }

  /**
   * Disable debugging mode
   */
  disable(): void {
    this.isEnabled = false;
    console.log('🔍 SubscriptionDebugger disabled');
  }

  /**
   * Create a debuggable subscription with detailed tracking
   */
  debugSubscription<T>(
    source: Observable<T>,
    options: {
      name?: string;
      componentName?: string;
      captureStackTrace?: boolean;
      logEmissions?: boolean;
      logErrors?: boolean;
    } = {}
  ): Observable<T> {
    if (!this.isEnabled) {
      return source;
    }

    const id = `debug_${++this.debugCounter}`;
    const info: SubscriptionDebugInfo = {
      id,
      componentName: options.componentName,
      operatorName: options.name || 'Unknown',
      createdAt: new Date(),
      isActive: true,
      emissionCount: 0,
      errorCount: 0,
      stackTrace: options.captureStackTrace ? this.captureStackTrace() : undefined
    };

    this.subscriptions.set(id, info);

    return source.pipe(
      tap({
        next: (value) => {
          info.emissionCount++;
          info.lastEmission = new Date();
          
          if (options.logEmissions) {
            console.log(`📦 [${id}] ${info.operatorName}:`, value);
          }
        },
        error: (error) => {
          info.errorCount++;
          info.lastError = new Date();
          
          if (options.logErrors) {
            console.error(`❌ [${id}] ${info.operatorName} Error:`, error);
          }
        },
        complete: () => {
          if (options.logEmissions) {
            console.log(`✅ [${id}] ${info.operatorName} completed`);
          }
        }
      }),
      finalize(() => {
        info.isActive = false;
        info.duration = Date.now() - info.createdAt.getTime();
        
        // Clean up after some time to prevent memory leaks
        setTimeout(() => {
          this.subscriptions.delete(id);
        }, 60000); // Keep debug info for 1 minute after completion
      }),
      share()
    );
  }

  /**
   * Get detailed information about a specific subscription
   */
  getSubscriptionInfo(id: string): SubscriptionDebugInfo | undefined {
    return this.subscriptions.get(id);
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): SubscriptionDebugInfo[] {
    return Array.from(this.subscriptions.values()).filter(info => info.isActive);
  }

  /**
   * Get all subscriptions (active and completed)
   */
  getAllSubscriptions(): SubscriptionDebugInfo[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const all = this.getAllSubscriptions();
    const active = this.getActiveSubscriptions();
    
    return {
      totalSubscriptions: all.length,
      activeSubscriptions: active.length,
      totalEmissions: all.reduce((sum, info) => sum + info.emissionCount, 0),
      totalErrors: all.reduce((sum, info) => sum + info.errorCount, 0),
      averageLifetime: this.calculateAverageLifetime(all),
      memoryUsage: this.getCurrentMemoryUsage(),
      leaksDetected: this.detectPotentialLeaks()
    };
  }

  /**
   * Log current subscription status
   */
  logStatus(): void {
    if (!this.isEnabled) {
      console.log('🔍 SubscriptionDebugger is disabled');
      return;
    }

    const metrics = this.getPerformanceMetrics();
    const active = this.getActiveSubscriptions();

    console.group('🔍 Subscription Debugger Status');
    console.log('📊 Metrics:', metrics);
    
    if (active.length > 0) {
      console.group('🔴 Active Subscriptions:');
      active.forEach(info => {
        console.log(`[${info.id}] ${info.operatorName} (${info.componentName || 'Unknown'})`, {
          emissions: info.emissionCount,
          errors: info.errorCount,
          age: Date.now() - info.createdAt.getTime(),
          stackTrace: info.stackTrace
        });
      });
      console.groupEnd();
    }

    if (metrics.leaksDetected > 0) {
      console.warn(`⚠️ Potential memory leaks detected: ${metrics.leaksDetected}`);
    }

    console.groupEnd();
  }

  /**
   * Detect potential memory leaks
   */
  detectPotentialLeaks(): number {
    const active = this.getActiveSubscriptions();
    const now = Date.now();
    
    return active.filter(info => {
      const age = now - info.createdAt.getTime();
      // Consider subscriptions older than 5 minutes with no recent activity as potential leaks
      return age > 300000 && (!info.lastEmission || (now - info.lastEmission.getTime()) > 60000);
    }).length;
  }

  /**
   * Clear all debug information
   */
  clear(): void {
    this.subscriptions.clear();
    console.log('🧹 Subscription debug information cleared');
  }

  /**
   * Export debug information as JSON
   */
  exportDebugInfo(): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.getPerformanceMetrics(),
      subscriptions: this.getAllSubscriptions()
    };
    
    return JSON.stringify(data, null, 2);
  }

  private captureStackTrace(): string {
    const error = new Error();
    return error.stack || 'Stack trace not available';
  }

  private calculateAverageLifetime(subscriptions: SubscriptionDebugInfo[]): number {
    const completed = subscriptions.filter(info => !info.isActive && info.duration);
    if (completed.length === 0) return 0;
    
    const total = completed.reduce((sum, info) => sum + (info.duration || 0), 0);
    return total / completed.length;
  }

  private getCurrentMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private setupPerformanceMonitoring(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        // Process performance entries if needed
      });
      
      try {
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  }

  private setupMemoryMonitoring(): void {
    if (this.isEnabled && typeof performance !== 'undefined' && 'memory' in performance) {
      this.memoryInterval = setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('⚠️ High memory usage detected:', {
            used: memory.usedJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  ngOnDestroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
  }
} 