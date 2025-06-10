# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-06-10

### 🎉 Major Release - Enhanced Features

This major release introduces comprehensive subscription management capabilities with advanced features for modern Angular applications.

### ✨ Added

#### 🛣️ Route-based Subscription Management
- **takeUntilRoute()** - Automatically unsubscribe when navigating away from routes
- **takeWhileOnRoute()** - Keep subscriptions active only while on specific routes
- Route pattern matching with wildcard support

#### 🌐 HTTP Request Management
- **HttpRequestManager** service for centralized HTTP request lifecycle management
- **cancelOnDestroy()** operator for automatic request cancellation
- **cancelPrevious()** operator to cancel previous requests when new ones start
- **retryWithBackoff()** operator with exponential backoff retry logic
- **logHttpRequests()** operator for HTTP request lifecycle logging

#### 👁️ Visibility-based Subscriptions
- **takeWhileVisible()** - Pause subscriptions when page becomes hidden
- **takeUntilHidden()** - Unsubscribe when page becomes hidden
- **bufferWhileHidden()** - Buffer emissions while page is hidden
- **throttleWhileHidden()** - Throttle emissions when page is not visible

#### 📝 Reactive Forms Integration
- **takeUntilFormDestroyed()** - Form-specific subscription cleanup
- **takeWhileFormValid()** - Emit only when form is valid
- **FormSubscriptionManager** service for managing form subscriptions

#### 🧠 Memory Optimization
- **MemoryOptimizer** singleton for advanced memory management
- **optimizeMemory()** operator for memory-optimized observables
- **shareWithAutoCleanup()** operator for automatic cleanup sharing
- **limitEmissionRate()** operator for rate limiting
- **MemoryUtils** for memory monitoring and statistics

#### 🔍 Enhanced Debugging
- **SubscriptionDebuggerService** with comprehensive debugging capabilities
- Performance metrics and memory leak detection
- Stack trace capture and emission logging
- Debug information export functionality

#### 🧪 Testing Utilities
- **TestObservable** - Controllable observable for testing
- **SubscriptionTester** - Framework for testing subscription behavior
- **MemoryLeakDetector** - Memory leak detection in tests
- **TestScenarios** - Pre-built test scenarios for common patterns

#### ⚙️ Configuration & Module Enhancements
- **NgTerminusConfig** interface for library configuration
- Enhanced **NgTerminusModule** with forRoot() and forFeature() configuration
- Support for enabling/disabling features based on environment

### 🔧 Changed
- Updated peer dependencies to include @angular/router, @angular/forms
- Enhanced module structure with better service organization
- Improved TypeScript definitions and type safety
- Updated documentation with comprehensive examples

### 📦 Dependencies
- Added @angular/router@>=14.0.0 as peer dependency
- Added @angular/forms@>=14.0.0 as peer dependency
- Updated Angular dependencies to version 20.x for development

### 🚀 Performance
- Optimized memory usage with advanced sharing strategies
- Improved subscription cleanup efficiency
- Added memory monitoring and leak detection

### 📚 Documentation
- Comprehensive README update with all new features
- Added detailed API reference
- Created extensive examples for all features
- Enhanced configuration documentation

### 🧪 Testing
- Complete testing framework for subscription management
- Memory leak detection utilities
- Controllable test observables
- Pre-built test scenarios

## [1.0.1] - 2024-12-XX

### 🔧 Fixed
- Fixed package export paths to match actual build output files
- Updated package.json exports to reference correct file names (fivexlabs-ng-terminus.mjs)

### 📦 Changed
- Corrected module export configuration for better compatibility

## [1.0.0] - 2024-12-XX

### 🎉 Initial Release

### ✨ Added
- **takeUntilDestroyed** operator for automatic subscription cleanup
- **untilDestroyed** alias operator with auto-injection
- **SubscriptionManager** service for centralized subscription management
- **NgTerminusModule** for Angular module integration
- Comprehensive utility functions for subscription management
- Full TypeScript support with type definitions
- Complete documentation and examples

### 🛡️ Features
- Automatic subscription cleanup tied to Angular component lifecycle
- DestroyRef integration for modern Angular patterns
- Zero-dependency implementation (only peer dependencies)
- Tree-shakable for optimal bundle size
- Support for Angular 14+ and RxJS 7+

### 📚 Documentation
- Comprehensive README with examples
- API documentation
- Usage patterns and best practices
- Migration guide from manual subscription management

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