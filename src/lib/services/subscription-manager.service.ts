import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * A service that manages multiple RxJS subscriptions and automatically
 * unsubscribes from all of them when the associated component is destroyed.
 * 
 * This service implements Angular's OnDestroy interface and should be
 * provided at the component level to ensure proper cleanup.
 * 
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-my-component',
 *   providers: [SubscriptionManager] // Provide at component level
 * })
 * export class MyComponent implements OnInit {
 *   constructor(
 *     private dataService: DataService,
 *     private subManager: SubscriptionManager
 *   ) {}
 * 
 *   ngOnInit() {
 *     // Add subscriptions to the manager
 *     this.subManager.add(
 *       this.dataService.getStream1().subscribe(data => console.log(data)),
 *       this.dataService.getStream2().subscribe(data => console.log(data))
 *     );
 *   }
 *   // No ngOnDestroy needed - the service handles cleanup automatically
 * }
 * ```
 */
@Injectable()
export class SubscriptionManager implements OnDestroy {
  private subscriptions: Set<Subscription> = new Set();
  private isDestroyed = false;

  /**
   * Add one or more subscriptions to be managed by this service.
   * All added subscriptions will be automatically unsubscribed when
   * the component is destroyed.
   * 
   * @param subscriptions The subscriptions to add
   * @returns The SubscriptionManager instance for method chaining
   * 
   * @example
   * ```typescript
   * // Add single subscription
   * this.subManager.add(observable$.subscribe());
   * 
   * // Add multiple subscriptions
   * this.subManager.add(
   *   observable1$.subscribe(),
   *   observable2$.subscribe()
   * );
   * 
   * // Method chaining
   * this.subManager
   *   .add(observable1$.subscribe())
   *   .add(observable2$.subscribe());
   * ```
   */
  add(...subscriptions: Subscription[]): SubscriptionManager {
    if (this.isDestroyed) {
      console.warn('SubscriptionManager: Attempting to add subscriptions after destroy. Subscriptions will be immediately unsubscribed.');
      subscriptions.forEach(sub => sub.unsubscribe());
      return this;
    }

    subscriptions.forEach(subscription => {
      if (subscription && !subscription.closed) {
        this.subscriptions.add(subscription);
      }
    });

    return this;
  }

  /**
   * Remove a specific subscription from management.
   * The subscription will not be unsubscribed automatically.
   * 
   * @param subscription The subscription to remove
   * @returns The SubscriptionManager instance for method chaining
   */
  remove(subscription: Subscription): SubscriptionManager {
    this.subscriptions.delete(subscription);
    return this;
  }

  /**
   * Manually unsubscribe from all managed subscriptions.
   * This is automatically called during ngOnDestroy.
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
    });
    this.subscriptions.clear();
  }

  /**
   * Get the current number of active subscriptions being managed.
   * 
   * @returns The number of active subscriptions
   */
  get activeCount(): number {
    // Filter out closed subscriptions
    const activeSubscriptions = Array.from(this.subscriptions).filter(
      sub => !sub.closed
    );
    
    // Clean up closed subscriptions from the set
    if (activeSubscriptions.length !== this.subscriptions.size) {
      this.subscriptions.clear();
      activeSubscriptions.forEach(sub => this.subscriptions.add(sub));
    }
    
    return activeSubscriptions.length;
  }

  /**
   * Check if the manager has any active subscriptions.
   * 
   * @returns True if there are active subscriptions, false otherwise
   */
  get hasActiveSubscriptions(): boolean {
    return this.activeCount > 0;
  }

  /**
   * Angular lifecycle hook that automatically unsubscribes from all
   * managed subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.unsubscribeAll();
  }
} 