import { Observable, Subject, Subscription, throwError, EMPTY } from 'rxjs';
import { delay, take, tap } from 'rxjs/operators';

/**
 * Mock subscription manager for testing
 */
export class MockSubscriptionManager {
  private subscriptions = new Map<string, Subscription>();
  private subscriptionCount = 0;

  add(subscription: Subscription, name?: string): string {
    const id = name || `mock_${++this.subscriptionCount}`;
    this.subscriptions.set(id, subscription);
    return id;
  }

  remove(id: string): boolean {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(id);
      return true;
    }
    return false;
  }

  removeAll(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
  }

  getActiveCount(): number {
    return Array.from(this.subscriptions.values())
      .filter(sub => !sub.closed).length;
  }

  getAllCount(): number {
    return this.subscriptions.size;
  }

  isActive(id: string): boolean {
    const subscription = this.subscriptions.get(id);
    return subscription ? !subscription.closed : false;
  }
}

/**
 * Test observable that can be controlled for testing subscription behavior
 */
export class TestObservable<T> extends Observable<T> {
  private subject = new Subject<T>();
  private isCompleted = false;
  private hasErrored = false;

  constructor() {
    super(subscriber => {
      const subscription = this.subject.subscribe(subscriber);
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Emit a value to all subscribers
   */
  emit(value: T): void {
    if (!this.isCompleted && !this.hasErrored) {
      this.subject.next(value);
    }
  }

  /**
   * Emit multiple values with optional delays
   */
  emitSequence(values: T[], delayMs: number = 0): Promise<void> {
    return new Promise((resolve) => {
      let index = 0;
      const emitNext = () => {
        if (index < values.length && !this.isCompleted && !this.hasErrored) {
          this.emit(values[index++]);
          if (index < values.length) {
            setTimeout(emitNext, delayMs);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      };
      emitNext();
    });
  }

  /**
   * Complete the observable
   */
  complete(): void {
    if (!this.isCompleted && !this.hasErrored) {
      this.isCompleted = true;
      this.subject.complete();
    }
  }

  /**
   * Emit an error
   */
  error(error: any): void {
    if (!this.isCompleted && !this.hasErrored) {
      this.hasErrored = true;
      this.subject.error(error);
    }
  }

  /**
   * Get the current state
   */
  getState(): { completed: boolean; errored: boolean } {
    return {
      completed: this.isCompleted,
      errored: this.hasErrored
    };
  }
}

/**
 * Subscription testing utilities
 */
export class SubscriptionTester {
  private subscriptions: Subscription[] = [];
  private emissionCounts = new Map<string, number>();
  private errorCounts = new Map<string, number>();
  private completionCounts = new Map<string, number>();

  /**
   * Subscribe to an observable with tracking
   */
  subscribe<T>(
    observable: Observable<T>,
    name: string,
    options: {
      onNext?: (value: T) => void;
      onError?: (error: any) => void;
      onComplete?: () => void;
    } = {}
  ): Subscription {
    const subscription = observable
      .pipe(
        tap({
          next: (value) => {
            this.incrementCount(this.emissionCounts, name);
            options.onNext?.(value);
          },
          error: (error) => {
            this.incrementCount(this.errorCounts, name);
            options.onError?.(error);
          },
          complete: () => {
            this.incrementCount(this.completionCounts, name);
            options.onComplete?.();
          }
        })
      )
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Get emission count for a named subscription
   */
  getEmissionCount(name: string): number {
    return this.emissionCounts.get(name) || 0;
  }

  /**
   * Get error count for a named subscription
   */
  getErrorCount(name: string): number {
    return this.errorCounts.get(name) || 0;
  }

  /**
   * Get completion count for a named subscription
   */
  getCompletionCount(name: string): number {
    return this.completionCounts.get(name) || 0;
  }

  /**
   * Get total active subscriptions
   */
  getActiveSubscriptionCount(): number {
    return this.subscriptions.filter(sub => !sub.closed).length;
  }

  /**
   * Unsubscribe from all tracked subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  /**
   * Reset all counters
   */
  reset(): void {
    this.unsubscribeAll();
    this.emissionCounts.clear();
    this.errorCounts.clear();
    this.completionCounts.clear();
  }

  /**
   * Wait for a specific number of emissions
   */
  waitForEmissions(name: string, count: number, timeoutMs: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkEmissions = () => {
        if (this.getEmissionCount(name) >= count) {
          resolve();
        } else if (Date.now() - startTime > timeoutMs) {
          reject(new Error(`Timeout waiting for ${count} emissions from ${name}. Got ${this.getEmissionCount(name)}`));
        } else {
          setTimeout(checkEmissions, 10);
        }
      };
      checkEmissions();
    });
  }

  /**
   * Wait for completion
   */
  waitForCompletion(name: string, timeoutMs: number = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkCompletion = () => {
        if (this.getCompletionCount(name) > 0) {
          resolve();
        } else if (Date.now() - startTime > timeoutMs) {
          reject(new Error(`Timeout waiting for completion of ${name}`));
        } else {
          setTimeout(checkCompletion, 10);
        }
      };
      checkCompletion();
    });
  }

  private incrementCount(map: Map<string, number>, key: string): void {
    map.set(key, (map.get(key) || 0) + 1);
  }
}

/**
 * Memory leak detector for testing
 */
export class MemoryLeakDetector {
  private initialMemory?: number;
  private subscriptions: Subscription[] = [];

  /**
   * Start monitoring memory usage
   */
  startMonitoring(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      this.initialMemory = (performance as any).memory.usedJSHeapSize;
    }
  }

  /**
   * Add subscription to monitor
   */
  track(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }

  /**
   * Check for memory leaks
   */
  checkForLeaks(): {
    hasLeaks: boolean;
    memoryIncrease: number;
    activeSubscriptions: number;
    totalSubscriptions: number;
  } {
    const currentMemory = typeof performance !== 'undefined' && 'memory' in performance
      ? (performance as any).memory.usedJSHeapSize
      : 0;

    const memoryIncrease = this.initialMemory
      ? currentMemory - this.initialMemory
      : 0;

    const activeSubscriptions = this.subscriptions.filter(sub => !sub.closed).length;

    return {
      hasLeaks: activeSubscriptions > 0 || memoryIncrease > 1000000, // 1MB threshold
      memoryIncrease,
      activeSubscriptions,
      totalSubscriptions: this.subscriptions.length
    };
  }

  /**
   * Clean up all tracked subscriptions
   */
  cleanup(): void {
    this.subscriptions.forEach(sub => {
      if (!sub.closed) {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];
  }
}

/**
 * Helper functions for creating test scenarios
 */
export const TestScenarios = {
  /**
   * Create an observable that emits values at intervals
   */
  createIntervalObservable(intervalMs: number, maxValues: number = 10): Observable<number> {
    return new Observable(subscriber => {
      let count = 0;
      const interval = setInterval(() => {
        if (count < maxValues) {
          subscriber.next(count++);
        } else {
          subscriber.complete();
          clearInterval(interval);
        }
      }, intervalMs);

      return () => clearInterval(interval);
    });
  },

  /**
   * Create an observable that errors after a delay
   */
  createErrorObservable(delayMs: number, error: any = new Error('Test error')): Observable<never> {
    return new Observable(subscriber => {
      const timeout = setTimeout(() => {
        subscriber.error(error);
      }, delayMs);

      return () => clearTimeout(timeout);
    });
  },

  /**
   * Create an observable that never completes or errors
   */
  createInfiniteObservable(): Observable<number> {
    return new Observable(subscriber => {
      let count = 0;
      const interval = setInterval(() => {
        subscriber.next(count++);
      }, 100);

      return () => clearInterval(interval);
    });
  },

  /**
   * Create an observable that completes immediately
   */
  createImmediateCompletionObservable(): Observable<never> {
    return EMPTY;
  },

  /**
   * Create an observable that emits once then completes
   */
  createSingleValueObservable<T>(value: T, delayMs: number = 0): Observable<T> {
    return new Observable(subscriber => {
      const timeout = setTimeout(() => {
        subscriber.next(value);
        subscriber.complete();
      }, delayMs);

      return () => clearTimeout(timeout);
    });
  }
}; 