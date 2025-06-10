import { inject, DestroyRef, DOCUMENT } from '@angular/core';
import { Observable, fromEvent, merge, EMPTY } from 'rxjs';
import { switchMap, takeUntil, startWith, map, distinctUntilChanged, share } from 'rxjs/operators';

/**
 * RxJS operator that pauses subscription when page becomes hidden
 * and resumes when page becomes visible again.
 * 
 * @param emitOnResume Whether to emit the last value when resuming (default: true)
 * @returns OperatorFunction that manages subscription based on page visibility
 * 
 * @example
 * ```typescript
 * this.dataService.getLiveData()
 *   .pipe(takeWhileVisible())
 *   .subscribe(data => console.log('Received while visible:', data));
 * ```
 */
export function takeWhileVisible<T>(emitOnResume: boolean = true) {
  return function (source: Observable<T>): Observable<T> {
    const document = inject(DOCUMENT, { optional: true });
    
    if (!document) {
      console.warn('takeWhileVisible: Document not available, operator will have no effect');
      return source;
    }

    const visibility$ = merge(
      fromEvent(document, 'visibilitychange'),
      fromEvent(document, 'blur'),
      fromEvent(document, 'focus')
    ).pipe(
      startWith(null),
      map(() => !document.hidden),
      distinctUntilChanged(),
      share()
    );

    return visibility$.pipe(
      switchMap(isVisible => {
        if (isVisible) {
          return source;
        } else {
          return EMPTY;
        }
      })
    );
  };
}

/**
 * RxJS operator that unsubscribes when page becomes hidden
 * and doesn't automatically resubscribe when visible again.
 * 
 * @returns MonoTypeOperatorFunction that unsubscribes on page hide
 * 
 * @example
 * ```typescript
 * this.dataService.getData()
 *   .pipe(takeUntilHidden())
 *   .subscribe(data => console.log('Data received:', data));
 * ```
 */
export function takeUntilHidden<T>() {
  return function (source: Observable<T>): Observable<T> {
    const document = inject(DOCUMENT, { optional: true });
    
    if (!document) {
      console.warn('takeUntilHidden: Document not available, operator will have no effect');
      return source;
    }

    const hidden$ = merge(
      fromEvent(document, 'visibilitychange'),
      fromEvent(document, 'blur')
    ).pipe(
      map(() => document.hidden),
      distinctUntilChanged(),
      switchMap(isHidden => isHidden ? [true] : EMPTY)
    );

    return source.pipe(takeUntil(hidden$));
  };
}

/**
 * RxJS operator that emits only when page is visible
 * and buffers emissions while hidden.
 * 
 * @param bufferSize Maximum number of emissions to buffer (default: 10)
 * @returns OperatorFunction that buffers emissions while page is hidden
 * 
 * @example
 * ```typescript
 * this.dataService.getNotifications()
 *   .pipe(bufferWhileHidden(5))
 *   .subscribe(notifications => {
 *     // Receive up to 5 buffered notifications when page becomes visible
 *     console.log('Notifications:', notifications);
 *   });
 * ```
 */
export function bufferWhileHidden<T>(bufferSize: number = 10) {
  return function (source: Observable<T>): Observable<T[]> {
    const document = inject(DOCUMENT, { optional: true });
    
    if (!document) {
      console.warn('bufferWhileHidden: Document not available, operator will have no effect');
      return source.pipe(map(value => [value]));
    }

    const visibility$ = merge(
      fromEvent(document, 'visibilitychange'),
      fromEvent(document, 'focus'),
      fromEvent(document, 'blur')
    ).pipe(
      startWith(null),
      map(() => !document.hidden),
      distinctUntilChanged(),
      share()
    );

    let buffer: T[] = [];

    return source.pipe(
      switchMap(value => {
        return visibility$.pipe(
          map(isVisible => {
            if (isVisible) {
              // Page is visible, emit buffered values plus current value
              buffer.push(value);
              const result = buffer.slice(-bufferSize);
              buffer = [];
              return result;
            } else {
              // Page is hidden, add to buffer
              buffer.push(value);
              if (buffer.length > bufferSize) {
                buffer = buffer.slice(-bufferSize);
              }
              return [];
            }
          })
        );
      }),
      switchMap(values => values.length > 0 ? [values] : EMPTY)
    );
  };
}

/**
 * RxJS operator that throttles emissions when page is not visible
 * and resumes normal emission rate when visible.
 * 
 * @param hiddenThrottleMs Throttle time in milliseconds when hidden (default: 30000)
 * @returns MonoTypeOperatorFunction that throttles based on visibility
 * 
 * @example
 * ```typescript
 * this.dataService.getHeartbeat()
 *   .pipe(throttleWhileHidden(60000)) // Throttle to 1 minute when hidden
 *   .subscribe(heartbeat => console.log('Heartbeat:', heartbeat));
 * ```
 */
export function throttleWhileHidden<T>(hiddenThrottleMs: number = 30000) {
  return function (source: Observable<T>): Observable<T> {
    const document = inject(DOCUMENT, { optional: true });
    
    if (!document) {
      console.warn('throttleWhileHidden: Document not available, operator will have no effect');
      return source;
    }

    const visibility$ = merge(
      fromEvent(document, 'visibilitychange'),
      fromEvent(document, 'focus'),
      fromEvent(document, 'blur')
    ).pipe(
      startWith(null),
      map(() => !document.hidden),
      distinctUntilChanged(),
      share()
    );

    let lastEmission = 0;

    return source.pipe(
      switchMap(value => {
        return visibility$.pipe(
          map(isVisible => {
            const now = Date.now();
            
            if (isVisible) {
              // Always emit when visible
              lastEmission = now;
              return value;
            } else {
              // Throttle when hidden
              if (now - lastEmission >= hiddenThrottleMs) {
                lastEmission = now;
                return value;
              }
              return null;
            }
          })
        );
      }),
      switchMap(value => value !== null ? [value] : EMPTY)
    );
  };
} 