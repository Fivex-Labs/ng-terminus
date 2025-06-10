import { Observable, Subscription, isObservable } from 'rxjs';
import { takeUntilDestroyed } from '../operators/take-until-destroyed';
import { DestroyRef } from '@angular/core';

/**
 * Type guard to check if a value is a Subscription
 */
export function isSubscription(value: any): value is Subscription {
  return value && typeof value.unsubscribe === 'function';
}

/**
 * Type guard to check if a value is an Observable
 */
export function isObservableValue<T>(value: any): value is Observable<T> {
  return isObservable(value);
}

/**
 * Utility function to safely unsubscribe from a subscription
 * without throwing errors if the subscription is null, undefined, or already closed.
 * 
 * @param subscription The subscription to unsubscribe from
 * @returns True if unsubscription was successful, false otherwise
 * 
 * @example
 * ```typescript
 * let sub: Subscription | undefined;
 * // ... later
 * safeUnsubscribe(sub); // Won't throw if sub is undefined
 * ```
 */
export function safeUnsubscribe(subscription: Subscription | null | undefined): boolean {
  if (subscription && !subscription.closed) {
    try {
      subscription.unsubscribe();
      return true;
    } catch (error) {
      console.warn('Error during unsubscription:', error);
      return false;
    }
  }
  return false;
}

/**
 * Utility function to create an observable that automatically unsubscribes
 * when the component is destroyed. This is a functional approach alternative
 * to using the operator in a pipe.
 * 
 * @param source$ The source observable
 * @param destroyRef Optional DestroyRef instance
 * @returns A new observable that will complete on component destruction
 * 
 * @example
 * ```typescript
 * const managedObservable$ = createManagedObservable(
 *   this.dataService.getData(),
 *   inject(DestroyRef)
 * );
 * 
 * managedObservable$.subscribe(data => console.log(data));
 * ```
 */
export function createManagedObservable<T>(
  source$: Observable<T>,
  destroyRef?: DestroyRef
): Observable<T> {
  return source$.pipe(takeUntilDestroyed(destroyRef));
}

/**
 * Utility function to handle multiple observables with automatic cleanup.
 * Returns an array of managed observables.
 * 
 * @param observables Array of source observables
 * @param destroyRef Optional DestroyRef instance
 * @returns Array of managed observables
 * 
 * @example
 * ```typescript
 * const [data1$, data2$, data3$] = manageManyObservables([
 *   this.service.getData1(),
 *   this.service.getData2(),
 *   this.service.getData3()
 * ]);
 * ```
 */
export function manageManyObservables<T extends readonly Observable<any>[]>(
  observables: T,
  destroyRef?: DestroyRef
): { [K in keyof T]: T[K] } {
  return observables.map(obs => createManagedObservable(obs, destroyRef)) as any;
}

/**
 * Configuration options for subscription debugging
 */
export interface SubscriptionDebugOptions {
  /** Enable console logging for subscription lifecycle events */
  enableLogging?: boolean;
  /** Custom prefix for log messages */
  logPrefix?: string;
  /** Enable stack trace capture for subscription creation */
  captureStackTrace?: boolean;
}

/**
 * Utility class for debugging subscription lifecycle in development
 */
export class SubscriptionDebugger {
  private static defaultOptions: SubscriptionDebugOptions = {
    enableLogging: false,
    logPrefix: '[ng-terminus]',
    captureStackTrace: false
  };

  private static options = { ...SubscriptionDebugger.defaultOptions };

  /**
   * Configure global debugging options
   */
  static configure(options: Partial<SubscriptionDebugOptions>): void {
    SubscriptionDebugger.options = {
      ...SubscriptionDebugger.defaultOptions,
      ...options
    };
  }

  /**
   * Log subscription creation
   */
  static logSubscription(context: string, subscription?: Subscription): void {
    if (!SubscriptionDebugger.options.enableLogging) return;

    const prefix = SubscriptionDebugger.options.logPrefix;
    console.log(`${prefix} Subscription created in ${context}`, {
      subscription,
      timestamp: new Date().toISOString(),
      ...(SubscriptionDebugger.options.captureStackTrace && {
        stack: new Error().stack
      })
    });
  }

  /**
   * Log subscription cleanup
   */
  static logCleanup(context: string, count: number): void {
    if (!SubscriptionDebugger.options.enableLogging) return;

    const prefix = SubscriptionDebugger.options.logPrefix;
    console.log(`${prefix} Cleaned up ${count} subscription(s) in ${context}`, {
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Types for better TypeScript support
 */

/** A function that returns an observable */
export type ObservableFactory<T> = () => Observable<T>;

/** A function that handles subscription cleanup */
export type CleanupFunction = () => void;

/** Configuration for subscription management */
export interface SubscriptionConfig {
  /** Automatically log subscription lifecycle events */
  debug?: boolean;
  /** Custom cleanup functions to run on destroy */
  cleanupFunctions?: CleanupFunction[];
} 