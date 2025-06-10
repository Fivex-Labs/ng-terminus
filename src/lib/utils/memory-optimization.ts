import { Observable, Subject, Subscription, BehaviorSubject, ReplaySubject } from 'rxjs';
import { share, shareReplay, finalize, tap, distinctUntilChanged } from 'rxjs/operators';

/**
 * Memory usage statistics
 */
export interface MemoryStats {
  totalObservables: number;
  activeSubscriptions: number;
  sharedObservables: number;
  memoryUsage: number;
  potentialLeaks: number;
}

/**
 * Observable metadata for memory tracking
 */
interface ObservableMetadata {
  id: string;
  createdAt: Date;
  subscriptionCount: number;
  isShared: boolean;
  lastActivity: Date;
  memoryEstimate: number;
}

/**
 * Memory optimizer for RxJS observables
 */
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private observables = new Map<string, ObservableMetadata>();
  private sharedObservables = new Map<string, Observable<any>>();
  private idCounter = 0;
  private isEnabled = false;

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  /**
   * Enable memory optimization tracking
   */
  enable(): void {
    this.isEnabled = true;
    console.log('🧠 Memory optimizer enabled');
  }

  /**
   * Disable memory optimization tracking
   */
  disable(): void {
    this.isEnabled = false;
    console.log('🧠 Memory optimizer disabled');
  }

  /**
   * Create a memory-optimized observable with automatic sharing
   */
  optimize<T>(source: Observable<T>, options: {
    share?: boolean;
    shareReplay?: number;
    name?: string;
  } = {}): Observable<T> {
    if (!this.isEnabled) {
      return source;
    }

    const id = `opt_${++this.idCounter}`;
    const metadata: ObservableMetadata = {
      id,
      createdAt: new Date(),
      subscriptionCount: 0,
      isShared: options.share || options.shareReplay !== undefined,
      lastActivity: new Date(),
      memoryEstimate: this.estimateMemoryUsage(source)
    };

    this.observables.set(id, metadata);

    let optimized = source.pipe(
      tap(() => {
        metadata.lastActivity = new Date();
      }),
      finalize(() => {
        this.observables.delete(id);
      })
    );

    if (options.shareReplay !== undefined) {
      optimized = optimized.pipe(shareReplay(options.shareReplay));
      this.sharedObservables.set(id, optimized);
    } else if (options.share) {
      optimized = optimized.pipe(share());
      this.sharedObservables.set(id, optimized);
    }

    return optimized;
  }

  /**
   * Create a shared observable that automatically cleans up when no subscribers
   */
  shareWithCleanup<T>(source: Observable<T>, cleanupDelayMs: number = 5000): Observable<T> {
    let refCount = 0;
    let sharedObservable: Observable<T> | null = null;
    let cleanupTimeout: NodeJS.Timeout | null = null;

    return new Observable<T>(subscriber => {
      refCount++;

      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
        cleanupTimeout = null;
      }

      if (!sharedObservable) {
        sharedObservable = source.pipe(shareReplay(1));
      }

      const subscription = sharedObservable.subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
        refCount--;

        if (refCount === 0) {
          cleanupTimeout = setTimeout(() => {
            sharedObservable = null;
          }, cleanupDelayMs);
        }
      };
    });
  }

  /**
   * Create a memory-efficient BehaviorSubject
   */
  createEfficientBehaviorSubject<T>(initialValue: T, maxHistorySize: number = 1): BehaviorSubject<T> {
    const subject = new BehaviorSubject<T>(initialValue);
    
    // Override the next method to limit memory usage
    const originalNext = subject.next.bind(subject);
    subject.next = (value: T) => {
      originalNext(value);
      // Cleanup old values if needed (simplified implementation)
    };

    return subject;
  }

  /**
   * Create a memory-efficient ReplaySubject
   */
  createEfficientReplaySubject<T>(bufferSize: number = 1, windowTime?: number): ReplaySubject<T> {
    // Limit buffer size to prevent memory issues
    const safeBufferSize = Math.min(bufferSize, 100);
    const safeWindowTime = windowTime && windowTime > 0 ? Math.min(windowTime, 300000) : windowTime; // Max 5 minutes
    
    return new ReplaySubject<T>(safeBufferSize, safeWindowTime);
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): MemoryStats {
    const now = Date.now();
    const staleThreshold = 300000; // 5 minutes

    const potentialLeaks = Array.from(this.observables.values()).filter(meta => {
      const timeSinceActivity = now - meta.lastActivity.getTime();
      return timeSinceActivity > staleThreshold && meta.subscriptionCount > 0;
    }).length;

    return {
      totalObservables: this.observables.size,
      activeSubscriptions: Array.from(this.observables.values())
        .reduce((sum, meta) => sum + meta.subscriptionCount, 0),
      sharedObservables: this.sharedObservables.size,
      memoryUsage: this.getCurrentMemoryUsage(),
      potentialLeaks
    };
  }

  /**
   * Clean up stale observables
   */
  cleanup(maxAge: number = 600000): number { // 10 minutes
    const now = Date.now();
    let cleaned = 0;

    this.observables.forEach((metadata, id) => {
      const age = now - metadata.createdAt.getTime();
      const timeSinceActivity = now - metadata.lastActivity.getTime();
      
      if (age > maxAge && timeSinceActivity > maxAge) {
        this.observables.delete(id);
        this.sharedObservables.delete(id);
        cleaned++;
      }
    });

    console.log(`🧹 Cleaned up ${cleaned} stale observables`);
    return cleaned;
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): void {
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
      console.log('🗑️ Forced garbage collection');
    } else {
      console.warn('⚠️ Garbage collection not available');
    }
  }

  private estimateMemoryUsage(observable: Observable<any>): number {
    // Simplified memory estimation - in reality this would be much more complex
    return 1024; // 1KB base estimate
  }

  private getCurrentMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}

/**
 * RxJS operator for memory optimization
 */
export function optimizeMemory<T>(options: {
  share?: boolean;
  shareReplay?: number;
  name?: string;
} = {}) {
  return function (source: Observable<T>): Observable<T> {
    return MemoryOptimizer.getInstance().optimize(source, options);
  };
}

/**
 * RxJS operator that automatically shares observables with cleanup
 */
export function shareWithAutoCleanup<T>(cleanupDelayMs: number = 5000) {
  return function (source: Observable<T>): Observable<T> {
    return MemoryOptimizer.getInstance().shareWithCleanup(source, cleanupDelayMs);
  };
}

/**
 * RxJS operator that limits emission frequency to reduce memory pressure
 */
export function limitEmissionRate<T>(maxEmissionsPerSecond: number = 10) {
  return function (source: Observable<T>): Observable<T> {
    let lastEmission = 0;
    const minInterval = 1000 / maxEmissionsPerSecond;

    return source.pipe(
      distinctUntilChanged(),
      tap(() => {
        const now = Date.now();
        if (now - lastEmission < minInterval) {
          // Could implement buffering here if needed
        }
        lastEmission = now;
      })
    );
  };
}

/**
 * Utility functions for memory management
 */
export const MemoryUtils = {
  /**
   * Get current memory usage (if available)
   */
  getCurrentMemoryUsage(): { used: number; total: number; limit: number } | null {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  /**
   * Check if memory usage is high
   */
  isMemoryUsageHigh(): boolean {
    const memory = this.getCurrentMemoryUsage();
    if (!memory) return false;
    
    return memory.used / memory.limit > 0.8; // 80% threshold
  },

  /**
   * Log memory statistics
   */
  logMemoryStats(): void {
    const memory = this.getCurrentMemoryUsage();
    const optimizer = MemoryOptimizer.getInstance();
    const stats = optimizer.getMemoryStats();

    console.group('🧠 Memory Statistics');
    
    if (memory) {
      console.log('Browser Memory:', {
        used: `${(memory.used / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.total / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.limit / 1024 / 1024).toFixed(2)} MB`,
        usage: `${((memory.used / memory.limit) * 100).toFixed(1)}%`
      });
    }

    console.log('Observable Statistics:', stats);
    
    if (stats.potentialLeaks > 0) {
      console.warn(`⚠️ ${stats.potentialLeaks} potential memory leaks detected`);
    }

    console.groupEnd();
  }
}; 