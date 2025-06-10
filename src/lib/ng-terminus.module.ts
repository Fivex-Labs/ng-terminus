import { NgModule } from '@angular/core';
import { SubscriptionManager } from './services/subscription-manager.service';

/**
 * The main Angular module for ng-terminus library.
 * 
 * This module can be imported into your Angular application to provide
 * the SubscriptionManager service and enable all ng-terminus functionality.
 * 
 * Note: The takeUntilDestroyed operator can be used without importing this module
 * as it's a standalone function that relies on Angular's inject() function.
 * 
 * @example
 * ```typescript
 * import { NgModule } from '@angular/core';
 * import { NgTerminusModule } from '@fivexlabs/ng-terminus';
 * 
 * @NgModule({
 *   imports: [NgTerminusModule],
 *   // ...
 * })
 * export class AppModule { }
 * ```
 */
@NgModule({
  providers: [
    // Note: SubscriptionManager is typically provided at component level,
    // but we include it here for applications that want to provide it globally
    SubscriptionManager
  ]
})
export class NgTerminusModule {
  /**
   * Use this method to configure the module for the root application.
   * Currently, no special configuration is needed, but this method
   * is provided for future extensibility.
   * 
   * @returns The configured module
   * 
   * @example
   * ```typescript
   * @NgModule({
   *   imports: [NgTerminusModule.forRoot()],
   *   // ...
   * })
   * export class AppModule { }
   * ```
   */
  static forRoot() {
    return {
      ngModule: NgTerminusModule,
      providers: [
        SubscriptionManager
      ]
    };
  }

  /**
   * Use this method to configure the module for feature modules.
   * This ensures proper service scoping in lazy-loaded modules.
   * 
   * @returns The configured module
   * 
   * @example
   * ```typescript
   * @NgModule({
   *   imports: [NgTerminusModule.forFeature()],
   *   // ...
   * })
   * export class FeatureModule { }
   * ```
   */
  static forFeature() {
    return {
      ngModule: NgTerminusModule,
      providers: []
    };
  }
} 