import { DestroyRef, inject } from '@angular/core';
import { Observable, takeUntil, Subject } from 'rxjs';

/**
 * An RxJS operator that automatically completes the source observable
 * when the associated Angular component, directive, or service is destroyed.
 * 
 * This operator prevents memory leaks by tying the observable lifecycle
 * to Angular's component lifecycle through DestroyRef.
 * 
 * @param destroyRef Optional DestroyRef instance. If not provided, 
 *                   it will be automatically injected using Angular's inject() function.
 * @returns An operator function that can be used in a pipe() chain
 * 
 * @example
 * ```typescript
 * // Basic usage with automatic DestroyRef injection
 * constructor(private dataService: DataService) {
 *   this.dataService.getData()
 *     .pipe(takeUntilDestroyed())
 *     .subscribe(data => console.log(data));
 * }
 * 
 * // Usage with explicit DestroyRef
 * constructor(private dataService: DataService) {
 *   const destroyRef = inject(DestroyRef);
 *   this.dataService.getData()
 *     .pipe(takeUntilDestroyed(destroyRef))
 *     .subscribe(data => console.log(data));
 * }
 * ```
 */
export function takeUntilDestroyed<T>(destroyRef?: DestroyRef) {
  return (source: Observable<T>): Observable<T> => {
    const destroy$ = new Subject<void>();
    
    // Use provided DestroyRef or inject it automatically
    const ref = destroyRef ?? inject(DestroyRef);
    
    // Register cleanup callback
    ref.onDestroy(() => {
      destroy$.next();
      destroy$.complete();
    });
    
    return source.pipe(takeUntil(destroy$));
  };
}

/**
 * A simplified version of takeUntilDestroyed that always uses automatic injection.
 * This provides the cleanest API for most use cases.
 * 
 * @returns An operator function that can be used in a pipe() chain
 * 
 * @example
 * ```typescript
 * constructor(private dataService: DataService) {
 *   this.dataService.getData()
 *     .pipe(untilDestroyed())
 *     .subscribe(data => console.log(data));
 * }
 * ```
 */
export function untilDestroyed<T>() {
  return takeUntilDestroyed<T>();
}

/**
 * Type alias for the takeUntilDestroyed operator function
 */
export type TakeUntilDestroyed = typeof takeUntilDestroyed; 