import { inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { takeUntil, filter, switchMap } from 'rxjs/operators';

/**
 * RxJS operator that automatically unsubscribes when navigating away from the current route.
 * This is useful for subscriptions that should only remain active while on a specific route.
 * 
 * @param targetRoute Optional specific route to monitor. If not provided, monitors any route change.
 * @returns MonoTypeOperatorFunction that unsubscribes on route change
 * 
 * @example
 * ```typescript
 * // Unsubscribe on any route change
 * this.dataService.getData()
 *   .pipe(takeUntilRoute())
 *   .subscribe(data => console.log(data));
 * 
 * // Unsubscribe only when leaving specific route
 * this.dataService.getData()
 *   .pipe(takeUntilRoute('/dashboard'))
 *   .subscribe(data => console.log(data));
 * ```
 */
export function takeUntilRoute(targetRoute?: string) {
  return function <T>(source: Observable<T>): Observable<T> {
    const router = inject(Router, { optional: true });
    
    if (!router) {
      console.warn('takeUntilRoute: Router not available, operator will have no effect');
      return source;
    }

    const routeChange$ = router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      filter((event: NavigationEnd) => {
        if (!targetRoute) {
          return true; // Unsubscribe on any route change
        }
        // Unsubscribe when leaving the target route
        return !event.urlAfterRedirects.startsWith(targetRoute);
      })
    );

    return source.pipe(takeUntil(routeChange$));
  };
}

/**
 * RxJS operator that keeps subscription active only while on a specific route.
 * When navigating away, it unsubscribes and returns EMPTY.
 * When navigating back, it resubscribes.
 * 
 * @param routePattern The route pattern to match (supports wildcards)
 * @returns OperatorFunction that manages subscription based on route presence
 * 
 * @example
 * ```typescript
 * this.dataService.getLiveData()
 *   .pipe(takeWhileOnRoute('/dashboard/**'))
 *   .subscribe(data => console.log('Dashboard data:', data));
 * ```
 */
export function takeWhileOnRoute<T>(routePattern: string) {
  return function (source: Observable<T>): Observable<T> {
    const router = inject(Router, { optional: true });
    
    if (!router) {
      console.warn('takeWhileOnRoute: Router not available, operator will have no effect');
      return source;
    }

    return router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      switchMap((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects;
        const matches = matchesRoutePattern(currentUrl, routePattern);
        return matches ? source : EMPTY;
      })
    );
  };
}

/**
 * Utility function to check if a URL matches a route pattern.
 * Supports wildcards (* and **).
 */
function matchesRoutePattern(url: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '.*')  // ** matches anything including /
    .replace(/\*/g, '[^/]*') // * matches anything except /
    .replace(/\//g, '\\/');  // Escape forward slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
} 