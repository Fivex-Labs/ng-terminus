import { NgModule, ModuleWithProviders } from '@angular/core';
import { SubscriptionManager } from './services/subscription-manager.service';
import { SubscriptionDebuggerService } from './services/subscription-debugger.service';
import { HttpRequestManager } from './operators/http-operators';
import { FormSubscriptionManager } from './operators/forms-operators';
import { MemoryOptimizer } from './utils/memory-optimization';

/**
 * Configuration options for NgTerminus
 */
export interface NgTerminusConfig {
  enableDebugger?: boolean;
  enableMemoryOptimization?: boolean;
  debugMode?: boolean;
}

/**
 * The main Angular module for ng-terminus library.
 * 
 * This module can be imported into your Angular application to provide
 * all ng-terminus services and enable comprehensive subscription management.
 * 
 * @example
 * ```typescript
 * import { NgModule } from '@angular/core';
 * import { NgTerminusModule } from '@fivexlabs/ng-terminus';
 * 
 * @NgModule({
 *   imports: [NgTerminusModule.forRoot({ enableDebugger: true })],
 *   // ...
 * })
 * export class AppModule { }
 * ```
 */
@NgModule({
  providers: [
    SubscriptionManager,
    SubscriptionDebuggerService,
    HttpRequestManager,
    FormSubscriptionManager
  ]
})
export class NgTerminusModule {
  /**
   * Use this method to configure the module for the root application.
   * 
   * @param config Configuration options for ng-terminus
   * @returns The configured module with providers
   * 
   * @example
   * ```typescript
   * @NgModule({
   *   imports: [NgTerminusModule.forRoot({
   *     enableDebugger: true,
   *     enableMemoryOptimization: true,
   *     debugMode: environment.production === false
   *   })],
   *   // ...
   * })
   * export class AppModule { }
   * ```
   */
  static forRoot(config: NgTerminusConfig = {}): ModuleWithProviders<NgTerminusModule> {
    return {
      ngModule: NgTerminusModule,
      providers: [
        SubscriptionManager,
        SubscriptionDebuggerService,
        HttpRequestManager,
        FormSubscriptionManager,
        {
          provide: 'NG_TERMINUS_CONFIG',
          useValue: config
        }
      ]
    };
  }

  /**
   * Use this method to configure the module for feature modules.
   * This ensures proper service scoping in lazy-loaded modules.
   * 
   * @param config Optional configuration for feature modules
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
  static forFeature(config: Partial<NgTerminusConfig> = {}): ModuleWithProviders<NgTerminusModule> {
    return {
      ngModule: NgTerminusModule,
      providers: [
        // Feature modules get their own instances of these services
        SubscriptionManager,
        HttpRequestManager,
        FormSubscriptionManager
      ]
    };
  }

  constructor() {
    // Initialize services if configuration is provided
    // This would typically be done in an APP_INITIALIZER
    console.log('🎯 NgTerminus module initialized');
  }
} 