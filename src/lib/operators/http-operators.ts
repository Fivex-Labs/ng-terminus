import { inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { takeUntil, catchError, tap, finalize, retry, delay } from 'rxjs/operators';

/**
 * Service to manage HTTP request cancellation
 */
export class HttpRequestManager {
  private pendingRequests = new Map<string, Subject<void>>();
  private requestCounter = 0;

  /**
   * Create a cancellable HTTP request
   */
  createCancellableRequest<T>(
    requestFn: () => Observable<T>,
    requestId?: string
  ): { request$: Observable<T>; cancel: () => void } {
    const id = requestId || `req_${++this.requestCounter}`;
    const cancelSubject = new Subject<void>();
    
    this.pendingRequests.set(id, cancelSubject);

    const request$ = requestFn().pipe(
      takeUntil(cancelSubject),
      catchError((error) => {
        if (error.name === 'AbortError') {
          console.log(`Request ${id} was cancelled`);
          return throwError(() => new Error('Request cancelled'));
        }
        return throwError(() => error);
      }),
      finalize(() => {
        this.pendingRequests.delete(id);
      })
    );

    const cancel = () => {
      cancelSubject.next();
      cancelSubject.complete();
      this.pendingRequests.delete(id);
    };

    return { request$, cancel };
  }

  /**
   * Cancel a specific request by ID
   */
  cancelRequest(requestId: string): void {
    const cancelSubject = this.pendingRequests.get(requestId);
    if (cancelSubject) {
      cancelSubject.next();
      cancelSubject.complete();
      this.pendingRequests.delete(requestId);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.pendingRequests.forEach((cancelSubject) => {
      cancelSubject.next();
      cancelSubject.complete();
    });
    this.pendingRequests.clear();
  }

  /**
   * Get the number of pending requests
   */
  getPendingRequestCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Get all pending request IDs
   */
  getPendingRequestIds(): string[] {
    return Array.from(this.pendingRequests.keys());
  }
}

/**
 * RxJS operator that cancels HTTP requests when component is destroyed
 */
export function cancelOnDestroy() {
  return function <T>(source: Observable<T>): Observable<T> {
    const destroyRef = inject(DestroyRef, { optional: true });
    
    if (!destroyRef) {
      console.warn('cancelOnDestroy: DestroyRef not available, operator will have no effect');
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
 * RxJS operator that cancels previous HTTP requests when a new one is made
 */
export function cancelPrevious() {
  let currentRequest$: Subject<void> | null = null;

  return function <T>(source: Observable<T>): Observable<T> {
    // Cancel previous request
    if (currentRequest$) {
      currentRequest$.next();
      currentRequest$.complete();
    }

    // Create new cancellation subject
    currentRequest$ = new Subject<void>();
    const cancelSubject = currentRequest$;

    return source.pipe(
      takeUntil(cancelSubject),
      finalize(() => {
        if (currentRequest$ === cancelSubject) {
          currentRequest$ = null;
        }
      })
    );
  };
}

/**
 * RxJS operator that adds retry logic with exponential backoff for HTTP requests
 */
export function retryWithBackoff(
  maxRetries: number = 3,
  initialDelay: number = 1000,
  maxDelay: number = 30000
) {
  return function <T>(source: Observable<T>): Observable<T> {
    return source.pipe(
      catchError((error, caught) => {
        if (maxRetries <= 0) {
          return throwError(() => error);
        }

        const delayTime = Math.min(initialDelay * Math.pow(2, 3 - maxRetries), maxDelay);
        
        return new Observable<T>(subscriber => {
          const timeoutId = setTimeout(() => {
            const retriedObservable = caught.pipe(
              retryWithBackoff(maxRetries - 1, initialDelay, maxDelay)
            ) as Observable<T>;
            retriedObservable.subscribe(subscriber);
          }, delayTime);

          return () => clearTimeout(timeoutId);
        });
      })
    );
  };
}

/**
 * RxJS operator that logs HTTP request lifecycle events
 */
export function logHttpRequests(requestName?: string) {
  return function <T>(source: Observable<T>): Observable<T> {
    const name = requestName || 'HTTP Request';
    
    return source.pipe(
      tap({
        subscribe: () => console.log(`🚀 ${name}: Started`),
        next: (value) => console.log(`📦 ${name}: Received data`, value),
        error: (error) => console.error(`❌ ${name}: Error`, error),
        complete: () => console.log(`✅ ${name}: Completed`)
      })
    );
  };
} 