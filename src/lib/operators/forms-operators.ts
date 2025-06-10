import { inject, DestroyRef, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

/**
 * RxJS operator that automatically unsubscribes from form value changes when component is destroyed
 */
export function takeUntilFormDestroyed() {
  return function <T>(source: Observable<T>): Observable<T> {
    const destroyRef = inject(DestroyRef, { optional: true });
    
    if (!destroyRef) {
      console.warn('takeUntilFormDestroyed: DestroyRef not available, operator will have no effect');
      return source;
    }

    const destroy$ = new Subject<void>();
    destroyRef.onDestroy(() => {
      destroy$.next();
      destroy$.complete();
    });

    return source.pipe(takeUntil(destroy$));
  };
}

/**
 * RxJS operator that emits only when form is valid
 */
export function takeWhileFormValid<T>(isValid: () => boolean) {
  return function (source: Observable<T>): Observable<T> {
    return source.pipe(
      filter(() => isValid())
    );
  };
}

/**
 * Injectable service for managing form subscriptions
 */
@Injectable()
export class FormSubscriptionManager {
  private subscriptions = new Map<string, Subject<void>>();

  /**
   * Create a managed subscription with automatic cleanup
   */
  manage<T>(source: Observable<T>, name: string): Observable<T> {
    const destroy$ = new Subject<void>();
    this.subscriptions.set(name, destroy$);
    
    return source.pipe(takeUntil(destroy$));
  }

  /**
   * Unsubscribe from a specific managed subscription
   */
  unsubscribe(name: string): void {
    const destroy$ = this.subscriptions.get(name);
    if (destroy$) {
      destroy$.next();
      destroy$.complete();
      this.subscriptions.delete(name);
    }
  }

  /**
   * Unsubscribe from all managed subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach(destroy$ => {
      destroy$.next();
      destroy$.complete();
    });
    this.subscriptions.clear();
  }

  /**
   * Get count of active subscriptions
   */
  getActiveCount(): number {
    return this.subscriptions.size;
  }
} 