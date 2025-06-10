/**
 * Basic Usage Examples for ng-terminus
 * 
 * These examples demonstrate how to use the ng-terminus library
 * for automatic subscription management in Angular applications.
 */

import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, map, filter } from 'rxjs';
import { 
  takeUntilDestroyed, 
  SubscriptionManager,
  createManagedObservable,
  manageManyObservables 
} from '@fivexlabs/ng-terminus';

// Example 1: Basic takeUntilDestroyed usage
@Component({
  selector: 'app-basic-example',
  template: `<div>Basic Example Component</div>`
})
export class BasicExampleComponent {
  constructor(private http: HttpClient) {
    // This subscription will automatically unsubscribe when component is destroyed
    this.http.get('/api/data')
      .pipe(takeUntilDestroyed())
      .subscribe(data => console.log('Data received:', data));
  }
}

// Example 2: Using SubscriptionManager
@Component({
  selector: 'app-subscription-manager-example',
  template: `<div>Subscription Manager Example</div>`,
  providers: [SubscriptionManager] // Provide at component level
})
export class SubscriptionManagerExampleComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private subManager: SubscriptionManager
  ) {}

  ngOnInit() {
    // Add multiple subscriptions that will be cleaned up automatically
    this.subManager.add(
      // HTTP request subscription
      this.http.get('/api/users').subscribe(users => console.log('Users:', users)),
      
      // Interval subscription
      interval(1000).subscribe(tick => console.log('Tick:', tick)),
      
      // Complex observable chain
      interval(5000).pipe(
        map(x => x * 2),
        filter(x => x % 4 === 0)
      ).subscribe(value => console.log('Filtered value:', value))
    );

    console.log(`Managing ${this.subManager.activeCount} subscriptions`);
  }

  // No ngOnDestroy needed! SubscriptionManager handles cleanup
}

// Example 3: Advanced usage with explicit DestroyRef
@Component({
  selector: 'app-advanced-example',
  template: `<div>Advanced Example Component</div>`
})
export class AdvancedExampleComponent {
  private destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient) {
    // Using explicit DestroyRef
    this.http.get('/api/config')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(config => this.applyConfig(config));

    // Using utility functions
    const managedData$ = createManagedObservable(
      this.http.get('/api/data'),
      this.destroyRef
    );

    managedData$.subscribe(data => console.log('Managed data:', data));

    // Managing multiple observables
    const [stream1$, stream2$, stream3$] = manageManyObservables([
      this.http.get('/api/stream1'),
      this.http.get('/api/stream2'),
      this.http.get('/api/stream3')
    ], this.destroyRef);

    stream1$.subscribe(data => console.log('Stream 1:', data));
    stream2$.subscribe(data => console.log('Stream 2:', data));
    stream3$.subscribe(data => console.log('Stream 3:', data));
  }

  private applyConfig(config: any) {
    console.log('Applying configuration:', config);
  }
}

// Example 4: Service usage
import { Injectable } from '@angular/core';

@Injectable()
export class DataService {
  private destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient) {
    // Services can also use takeUntilDestroyed
    interval(10000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshData());
  }

  private refreshData() {
    console.log('Refreshing data...');
  }

  getData() {
    return this.http.get('/api/data')
      .pipe(takeUntilDestroyed(this.destroyRef));
  }
}

// Example 5: Combining with other RxJS operators
@Component({
  selector: 'app-rxjs-example',
  template: `<div>RxJS Operators Example</div>`
})
export class RxJSExampleComponent {
  constructor(private http: HttpClient) {
    this.http.get('/api/search')
      .pipe(
        map(response => response.data),
        filter(data => data.length > 0),
        takeUntilDestroyed() // Always use as the last operator
      )
      .subscribe(data => console.log('Filtered data:', data));
  }
} 