# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-10

### Added

#### Core Features
- **takeUntilDestroyed Operator**: RxJS operator that automatically completes observables when Angular components are destroyed
- **untilDestroyed Operator**: Simplified version of takeUntilDestroyed with automatic DestroyRef injection
- **SubscriptionManager Service**: Injectable service for managing multiple subscriptions with automatic cleanup
- **NgTerminusModule**: Angular module providing library services with forRoot() and forFeature() methods

#### Utility Functions
- **safeUnsubscribe()**: Safely unsubscribe from subscriptions without throwing errors
- **createManagedObservable()**: Create observables with automatic cleanup
- **manageManyObservables()**: Manage multiple observables with automatic cleanup
- **isSubscription()**: Type guard for Subscription objects
- **isObservableValue()**: Type guard for Observable objects

#### Debugging Tools
- **SubscriptionDebugger**: Utility class for debugging subscription lifecycle
- **SubscriptionDebugOptions**: Configuration interface for debugging options
- Console logging for subscription lifecycle events
- Stack trace capture for subscription creation

#### TypeScript Support
- Full TypeScript support with comprehensive type definitions
- Generic type support for all functions and operators
- Type guards and utility types
- Exported type aliases for better developer experience

#### Documentation
- Comprehensive README with usage examples
- JSDoc comments for all public APIs
- Example files demonstrating common usage patterns
- Best practices and architecture documentation

### Technical Details
- Built for Angular 14+ using modern patterns
- Leverages Angular's DestroyRef for lifecycle management
- Zero runtime dependencies (only peer dependencies)
- Support for both CommonJS and ES modules
- Tree-shakable exports for optimal bundle size

### Package Information
- Published as `@fivexlabs/ng-terminus` on npm
- MIT License
- Maintained by Fivex Labs 