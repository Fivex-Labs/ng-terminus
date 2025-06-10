# @fivexlabs/ng-terminus

<div align="center">
  <img src="https://fivexlabs.com/assets/icon/logos/icon-logo-square.jpeg" alt="Fivex Labs" width="80" height="80" />
  
  <h3>Angular Subscription Management Library</h3>
  <p>Comprehensive utilities for managing RxJS subscriptions and preventing memory leaks in Angular applications</p>
  
  <p>Made with ❤️ by <a href="https://fivexlabs.com">Fivex Labs</a></p>

  [![npm version](https://badge.fury.io/js/@fivexlabs%2Fng-terminus.svg)](https://www.npmjs.com/package/@fivexlabs/ng-terminus)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

## 💡 Why ng-terminus?

### 🚨 **The Problem**
Angular applications commonly suffer from **memory leaks** caused by unmanaged RxJS subscriptions. These issues lead to:

- 📈 **Gradual Performance Degradation**: Memory usage increases over time as subscriptions accumulate
- 🐛 **Difficult-to-Debug Issues**: Memory leaks cause seemingly random performance problems
- 🔄 **Repetitive Boilerplate**: Manual `unsubscribe()` calls in every component's `ngOnDestroy`
- ❌ **Human Error**: Easy to forget unsubscription, especially in complex components
- 🧠 **Cognitive Load**: Developers must remember subscription management instead of focusing on business logic

### ✅ **The Solution**
**ng-terminus** eliminates these issues by providing:

- **🎯 Zero Memory Leaks**: Automatic subscription cleanup tied to Angular's lifecycle
- **📝 Declarative API**: Clean, RxJS-native operators that integrate seamlessly
- **🚀 Developer Experience**: Write less code, focus on features, not cleanup
- **🛡️ Type Safety**: Full TypeScript support prevents runtime errors
- **⚡ Performance**: Optimized cleanup strategies with minimal overhead

## ✨ Features

### 🎯 **Core Features**
- **🔚 takeUntilDestroyed Operator**: RxJS operator that automatically completes observables when components are destroyed
- **📦 SubscriptionManager Service**: Injectable service for managing multiple subscriptions with automatic cleanup
- **🛡️ Type Safety**: Full TypeScript support with comprehensive type definitions
- **🚀 Modern Angular**: Built for Angular 14+ using the latest DestroyRef patterns
- **⚡ Zero Dependencies**: Only peer dependencies on Angular and RxJS
- **🌳 Tree Shakable**: Optimized for minimal bundle size impact

### 🔥 **Enhanced Features**
- **🛣️ Route-based Management**: Automatically manage subscriptions based on route navigation
- **🌐 HTTP Request Control**: Advanced HTTP request cancellation and retry mechanisms
- **👁️ Visibility-based Subscriptions**: Pause/resume subscriptions based on page visibility
- **📝 Reactive Forms Integration**: Seamless integration with Angular reactive forms
- **🧠 Memory Optimization**: Advanced memory management and leak detection
- **🔍 Enhanced Debugging**: Comprehensive debugging tools with performance metrics
- **🧪 Testing Utilities**: Complete testing framework for subscription management

### 🔧 **Advanced Features**
- **🔍 Debugging Tools**: Built-in utilities for tracking subscription lifecycle in development
- **🛠️ Utility Functions**: Helper functions for safe unsubscription and batch management
- **📊 Subscription Tracking**: Monitor active subscriptions and get insights
- **🔄 Method Chaining**: Fluent API for managing multiple subscriptions
- **⚙️ Flexible Configuration**: Support for both automatic and explicit lifecycle management

## 📦 Installation

```bash
npm install @fivexlabs/ng-terminus
# or
yarn add @fivexlabs/ng-terminus
```

> **Note**: This library requires Angular 14+ and RxJS 7+. For enhanced features, you may also need @angular/router, @angular/forms, and @angular/common.

## 🚀 Quick Start

### The takeUntilDestroyed Way (Recommended)

Transform your subscription management with a single operator:

```typescript
import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@fivexlabs/ng-terminus';
import { DataService } from './data.service';

@Component({
  selector: 'app-user-dashboard',
  template: `<div>Welcome {{ user?.name }}!</div>`
})
export class UserDashboardComponent {
  user: User | null = null;

  constructor(private dataService: DataService) {
    // ✨ This subscription automatically cleans itself up!
    this.dataService.getCurrentUser()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user = user);
    
    // ✨ Multiple streams? No problem!
    this.dataService.getNotifications()
      .pipe(
        debounceTime(1000),
        takeUntilDestroyed() // Always last in the pipe
      )
      .subscribe(notifications => this.handleNotifications(notifications));
  }
}
```

## 🔥 Enhanced Features

### 🛣️ Route-based Subscription Management

Automatically manage subscriptions based on route navigation:

```typescript
import { takeUntilRoute, takeWhileOnRoute } from '@fivexlabs/ng-terminus';

@Component({...})
export class DashboardComponent {
  constructor(private dataService: DataService) {
    // Unsubscribe when navigating away from any route
    this.dataService.getLiveData()
      .pipe(takeUntilRoute())
      .subscribe(data => this.updateDashboard(data));

    // Only active while on dashboard routes
    this.dataService.getDashboardMetrics()
      .pipe(takeWhileOnRoute('/dashboard/**'))
      .subscribe(metrics => this.updateMetrics(metrics));
  }
}
```

### 🌐 HTTP Request Management

Advanced HTTP request cancellation and retry mechanisms:

```typescript
import { 
  HttpRequestManager, 
  cancelOnDestroy, 
  retryWithBackoff,
  logHttpRequests 
} from '@fivexlabs/ng-terminus';

@Component({
  providers: [HttpRequestManager]
})
export class ApiComponent {
  constructor(
    private http: HttpClient,
    private httpManager: HttpRequestManager
  ) {
    // Cancellable requests
    const { request$, cancel } = this.httpManager.createCancellableRequest(
      () => this.http.get('/api/data'),
      'user-data'
    );

    request$
      .pipe(
        logHttpRequests('User Data'),
        retryWithBackoff(3, 1000),
        cancelOnDestroy()
      )
      .subscribe(data => this.handleData(data));

    // Cancel after 5 seconds if needed
    setTimeout(() => cancel(), 5000);
  }
}
```

### 👁️ Visibility-based Subscriptions

Pause/resume subscriptions based on page visibility:

```typescript
import { 
  takeWhileVisible, 
  bufferWhileHidden, 
  throttleWhileHidden 
} from '@fivexlabs/ng-terminus';

@Component({...})
export class LiveDataComponent {
  constructor(private dataService: DataService) {
    // Pause when page is hidden
    this.dataService.getLiveUpdates()
      .pipe(takeWhileVisible())
      .subscribe(update => this.processUpdate(update));

    // Buffer notifications while hidden
    this.dataService.getNotifications()
      .pipe(bufferWhileHidden(10))
      .subscribe(notifications => this.showNotifications(notifications));

    // Throttle heartbeat when hidden
    this.dataService.getHeartbeat()
      .pipe(throttleWhileHidden(30000))
      .subscribe(heartbeat => this.updateStatus(heartbeat));
  }
}
```

### 📝 Reactive Forms Integration

Seamless integration with Angular reactive forms:

```typescript
import { 
  takeUntilFormDestroyed, 
  takeWhileFormValid,
  FormSubscriptionManager 
} from '@fivexlabs/ng-terminus';

@Component({
  providers: [FormSubscriptionManager]
})
export class FormComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private formManager: FormSubscriptionManager
  ) {
    // Auto-cleanup form subscriptions
    this.form.valueChanges
      .pipe(takeUntilFormDestroyed())
      .subscribe(value => this.handleFormChange(value));

    // Only emit when form is valid
    this.form.valueChanges
      .pipe(takeWhileFormValid(() => this.form.valid))
      .subscribe(value => this.saveValidForm(value));

    // Managed form subscriptions
    this.formManager.manage(
      this.form.get('email')!.valueChanges,
      'email-validation'
    ).subscribe(email => this.validateEmail(email));
  }
}
```

### 🧠 Memory Optimization

Advanced memory management and leak detection:

```typescript
import { 
  MemoryOptimizer, 
  optimizeMemory, 
  shareWithAutoCleanup,
  MemoryUtils 
} from '@fivexlabs/ng-terminus';

@Component({...})
export class OptimizedComponent {
  constructor(private dataService: DataService) {
    // Enable memory optimization
    MemoryOptimizer.getInstance().enable();

    // Optimized observable with sharing
    const optimizedData$ = this.dataService.getData()
      .pipe(optimizeMemory({ share: true, name: 'user-data' }));

    // Auto-cleanup sharing
    const sharedStream$ = this.dataService.getLiveStream()
      .pipe(shareWithAutoCleanup(5000));

    // Monitor memory usage
    MemoryUtils.logMemoryStats();
  }
}
```

### 🔍 Enhanced Debugging

Comprehensive debugging tools with performance metrics:

```typescript
import { SubscriptionDebuggerService } from '@fivexlabs/ng-terminus';

@Component({...})
export class DebugComponent {
  constructor(private debugger: SubscriptionDebuggerService) {
    // Enable debugging
    this.debugger.enable();

    // Create debuggable subscription
    const debugObs = this.debugger.debugSubscription(
      this.dataService.getData(),
      {
        name: 'UserData',
        componentName: 'DebugComponent',
        logEmissions: true,
        captureStackTrace: true
      }
    );

    debugObs.subscribe(data => this.handleData(data));

    // Monitor performance
    setTimeout(() => {
      this.debugger.logStatus();
      const metrics = this.debugger.getPerformanceMetrics();
      console.log('Performance:', metrics);
    }, 5000);
  }
}
```

### 🧪 Testing Utilities

Complete testing framework for subscription management:

```typescript
import { 
  TestObservable, 
  SubscriptionTester, 
  MemoryLeakDetector,
  TestScenarios 
} from '@fivexlabs/ng-terminus';

describe('SubscriptionComponent', () => {
  let tester: SubscriptionTester;
  let leakDetector: MemoryLeakDetector;

  beforeEach(() => {
    tester = new SubscriptionTester();
    leakDetector = new MemoryLeakDetector();
    leakDetector.startMonitoring();
  });

  it('should manage subscriptions correctly', async () => {
    const testObs = new TestObservable<string>();
    
    tester.subscribe(testObs, 'test-stream');
    
    testObs.emit('test-value');
    await tester.waitForEmissions('test-stream', 1);
    
    expect(tester.getEmissionCount('test-stream')).toBe(1);
    
    testObs.complete();
    await tester.waitForCompletion('test-stream');
    
    const leakCheck = leakDetector.checkForLeaks();
    expect(leakCheck.hasLeaks).toBeFalsy();
  });
});
```

## 📚 Complete API Reference

### Core Operators
- `takeUntilDestroyed()` - Automatic cleanup on component destruction
- `untilDestroyed()` - Simplified alias with auto-injection

### Route-based Operators
- `takeUntilRoute(route?)` - Unsubscribe on route change
- `takeWhileOnRoute(pattern)` - Active only on specific routes

### HTTP Operators
- `cancelOnDestroy()` - Cancel HTTP requests on destruction
- `cancelPrevious()` - Cancel previous requests when new ones start
- `retryWithBackoff(retries, delay, maxDelay)` - Exponential backoff retry
- `logHttpRequests(name?)` - Log HTTP request lifecycle

### Visibility Operators
- `takeWhileVisible()` - Pause when page is hidden
- `takeUntilHidden()` - Unsubscribe when page becomes hidden
- `bufferWhileHidden(size)` - Buffer emissions while hidden
- `throttleWhileHidden(ms)` - Throttle when page is hidden

### Forms Operators
- `takeUntilFormDestroyed()` - Form-specific cleanup
- `takeWhileFormValid(validator)` - Emit only when form is valid

### Memory Operators
- `optimizeMemory(options)` - Memory-optimized observables
- `shareWithAutoCleanup(delay)` - Auto-cleanup sharing
- `limitEmissionRate(rate)` - Rate limiting for memory efficiency

### Services
- `SubscriptionManager` - Centralized subscription management
- `HttpRequestManager` - HTTP request lifecycle management
- `FormSubscriptionManager` - Form-specific subscription management
- `SubscriptionDebuggerService` - Advanced debugging capabilities

### Testing Utilities
- `TestObservable<T>` - Controllable test observable
- `SubscriptionTester` - Subscription testing framework
- `MemoryLeakDetector` - Memory leak detection
- `TestScenarios` - Pre-built test scenarios

## 🔧 Configuration

Configure ng-terminus for your application:

```typescript
import { NgTerminusModule } from '@fivexlabs/ng-terminus';

@NgModule({
  imports: [
    NgTerminusModule.forRoot({
      enableDebugger: !environment.production,
      enableMemoryOptimization: true,
      debugMode: !environment.production
    })
  ]
})
export class AppModule {}
```

## 🧪 Testing

```bash
npm test
```

## 📖 API Reference

### Core Operators

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `takeUntilDestroyed<T>` | `destroyRef?: DestroyRef` | `OperatorFunction<T, T>` | Automatically completes observable on component destroy |
| `untilDestroyed<T>` | None | `OperatorFunction<T, T>` | Alias for `takeUntilDestroyed()` with auto-injection |

### Services

| Service | Key Methods | Description |
|---------|-------------|-------------|
| `SubscriptionManager` | `add()`, `remove()`, `activeCount` | Manages multiple subscriptions with automatic cleanup |

### Utility Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `safeUnsubscribe` | `Subscription \| null \| undefined` | `boolean` | Safely unsubscribe without errors |
| `createManagedObservable<T>` | `Observable<T>, DestroyRef?` | `Observable<T>` | Create auto-managed observable |
| `manageManyObservables<T>` | `T[], DestroyRef?` | `T[]` | Batch manage multiple observables |

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of all changes and new features.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About Fivex Labs

[Fivex Labs](https://fivexlabs.com) is a technology company focused on building innovative tools and libraries for modern web development. We believe in creating solutions that are both powerful and developer-friendly.

### Other Libraries by Fivex Labs

- [**conform-react**](https://github.com/fivex-labs/conform-react) - Dynamic, conditional forms for React with JSON schemas
- [**react-use-file-system**](https://github.com/fivex-labs/react-use-file-system) - File System Access API hook for React with TypeScript support

Visit us at [fivexlabs.com](https://fivexlabs.com) to learn more about our work and other open-source projects.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://fivexlabs.com">Fivex Labs</a></p>
  <p>© 2025 Fivex Labs. All rights reserved.</p>
</div> 