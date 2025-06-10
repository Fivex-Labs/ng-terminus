# @fivexlabs/ng-terminus

<div align="center">
  <img src="https://fivexlabs.com/assets/icon/logos/icon-logo-square.jpeg" alt="Fivex Labs" width="80" height="80" />
  
  <h3>Angular Subscription Management Library</h3>
  <p>Declarative utilities for managing RxJS subscriptions and preventing memory leaks in Angular applications</p>
  
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

### 🔥 **Advanced Features**
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

> **Note**: This library requires Angular 14+ and RxJS 7+.

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

### The Service Manager Way

Perfect for complex components with many subscriptions:

```typescript
import { Component, OnInit } from '@angular/core';
import { SubscriptionManager } from '@fivexlabs/ng-terminus';

@Component({
  selector: 'app-complex-dashboard',
  providers: [SubscriptionManager] // 🔑 Component-level provider
})
export class ComplexDashboardComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private subManager: SubscriptionManager
  ) {}

  ngOnInit() {
    // ✨ Add multiple subscriptions - all cleaned up automatically!
    this.subManager.add(
      this.dataService.getUserData().subscribe(data => this.handleUserData(data)),
      this.dataService.getAnalytics().subscribe(analytics => this.updateCharts(analytics)),
      interval(30000).subscribe(() => this.refreshData()),
      this.websocketService.connect().subscribe(message => this.handleMessage(message))
    );

    console.log(`Managing ${this.subManager.activeCount} subscriptions`);
  }
  
  // 🎉 No ngOnDestroy needed! Zero boilerplate!
}
```

## 🔥 Advanced Features Showcase

### 🔍 Subscription Debugging

Track subscription lifecycle in development with powerful debugging tools:

```typescript
import { SubscriptionDebugger } from '@fivexlabs/ng-terminus';

// Enable debugging in development
if (!environment.production) {
  SubscriptionDebugger.configure({
    enableLogging: true,
    logPrefix: '[MyApp Subscriptions]',
    captureStackTrace: true
  });
}

// Now all subscription lifecycle events will be logged!
```

### 🛠️ Utility Functions

Handle edge cases and complex scenarios with ease:

```typescript
import { 
  safeUnsubscribe, 
  createManagedObservable,
  manageManyObservables 
} from '@fivexlabs/ng-terminus';

@Component({...})
export class AdvancedComponent {
  constructor(private http: HttpClient) {
    // ✨ Safe unsubscription - never throws
    let subscription: Subscription | undefined;
    safeUnsubscribe(subscription); // Won't throw if undefined

    // ✨ Functional approach to managed observables
    const managedData$ = createManagedObservable(
      this.http.get('/api/data'),
      inject(DestroyRef)
    );

    // ✨ Batch manage multiple observables
    const [users$, posts$, comments$] = manageManyObservables([
      this.http.get('/api/users'),
      this.http.get('/api/posts'),
      this.http.get('/api/comments')
    ]);
  }
}
```

### 📊 Subscription Tracking

Monitor and analyze your subscription usage:

```typescript
@Component({
  providers: [SubscriptionManager]
})
export class MonitoredComponent {
  constructor(private subManager: SubscriptionManager) {
    // Add subscriptions
    this.subManager.add(
      stream1$.subscribe(),
      stream2$.subscribe()
    );

    // ✨ Monitor subscription health
    console.log(`Active subscriptions: ${this.subManager.activeCount}`);
    console.log(`Has active subscriptions: ${this.subManager.hasActiveSubscriptions}`);
    
    // ✨ Method chaining for fluent API
    this.subManager
      .add(stream3$.subscribe())
      .add(stream4$.subscribe());
  }
}
```

## 📚 Documentation

### Basic Subscription Management

The foundation of ng-terminus is built on two core patterns:

```typescript
// Pattern 1: Operator-based (Recommended)
import { takeUntilDestroyed } from '@fivexlabs/ng-terminus';

data$.pipe(takeUntilDestroyed()).subscribe();

// Pattern 2: Service-based (For complex scenarios)
import { SubscriptionManager } from '@fivexlabs/ng-terminus';

constructor(private subManager: SubscriptionManager) {
  this.subManager.add(subscription1, subscription2);
}
```

### takeUntilDestroyed Operator

#### Automatic DestroyRef Injection
The simplest and most common usage - no configuration needed:

```typescript
@Component({...})
export class SimpleComponent {
  constructor(private dataService: DataService) {
    // ✨ DestroyRef is automatically injected
    this.dataService.getData()
      .pipe(takeUntilDestroyed())
      .subscribe(data => console.log(data));
  }
}
```

#### Explicit DestroyRef Usage
For advanced scenarios where you need control:

```typescript
@Component({...})
export class AdvancedComponent {
  private destroyRef = inject(DestroyRef);

  constructor(private dataService: DataService) {
    this.dataService.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => console.log(data));
  }
}
```

#### Service Usage
Use in services for background tasks:

```typescript
@Injectable()
export class BackgroundService {
  private destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient) {
    // ✨ Auto-cleanup when service is destroyed
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.performHealthCheck());
  }
}
```

### SubscriptionManager Service

#### Component-Level Provider (Recommended)
Always provide SubscriptionManager at the component level for proper lifecycle management:

```typescript
@Component({
  selector: 'app-dashboard',
  providers: [SubscriptionManager] // 🔑 Key: Component-level provider
})
export class DashboardComponent implements OnInit {
  constructor(private subManager: SubscriptionManager) {}

  ngOnInit() {
    // ✨ Add multiple subscriptions at once
    this.subManager.add(
      this.userService.getProfile().subscribe(profile => this.profile = profile),
      this.notificationService.getAlerts().subscribe(alerts => this.alerts = alerts),
      interval(30000).subscribe(() => this.refreshData())
    );
  }
  
  // ✨ Automatic cleanup on component destroy - no ngOnDestroy needed!
}
```

#### Dynamic Subscription Management
Add and remove subscriptions based on user interactions:

```typescript
@Component({
  providers: [SubscriptionManager]
})
export class InteractiveComponent {
  private currentStreamSub?: Subscription;

  constructor(private subManager: SubscriptionManager) {}

  startMonitoring(streamId: string) {
    // ✨ Add new subscription
    this.currentStreamSub = this.dataService.getStream(streamId).subscribe();
    this.subManager.add(this.currentStreamSub);
  }

  stopMonitoring() {
    // ✨ Remove specific subscription
    if (this.currentStreamSub) {
      this.subManager.remove(this.currentStreamSub);
      this.currentStreamSub.unsubscribe();
    }
  }

  getStatus() {
    return `Managing ${this.subManager.activeCount} active subscriptions`;
  }
}
```

#### Method Chaining
Fluent API for readable subscription management:

```typescript
ngOnInit() {
  this.subManager
    .add(stream1$.subscribe())
    .add(stream2$.subscribe())
    .add(stream3$.subscribe());
}
```

### Module Import (Optional)

If you want to use `SubscriptionManager` globally across your application:

```typescript
import { NgModule } from '@angular/core';
import { NgTerminusModule } from '@fivexlabs/ng-terminus';

@NgModule({
  imports: [NgTerminusModule.forRoot()],
  // ...
})
export class AppModule { }

// For feature modules
@NgModule({
  imports: [NgTerminusModule.forFeature()],
  // ...
})
export class FeatureModule { }
```

### Advanced Usage

#### Combining with RxJS Operators
Always place `takeUntilDestroyed` as the last operator in your pipe:

```typescript
this.dataService.getSearchResults(query)
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => this.http.get(`/api/search?q=${query}`)),
    map(response => response.data),
    takeUntilDestroyed() // ✨ Always last
  )
  .subscribe(results => this.searchResults = results);
```

#### Error Handling
ng-terminus plays well with RxJS error handling:

```typescript
this.dataService.getRiskyData()
  .pipe(
    retry(3),
    catchError(error => of([])),
    takeUntilDestroyed()
  )
  .subscribe(data => this.handleData(data));
```

### Utility Functions

Advanced utilities for edge cases and complex scenarios:

#### Safe Unsubscription
```typescript
import { safeUnsubscribe } from '@fivexlabs/ng-terminus';

let subscription: Subscription | undefined;
safeUnsubscribe(subscription); // ✨ Never throws
```

#### Functional Observable Management
```typescript
import { createManagedObservable, manageManyObservables } from '@fivexlabs/ng-terminus';

// Single observable
const managed$ = createManagedObservable(this.http.get('/api/data'));

// Multiple observables
const [users$, posts$] = manageManyObservables([
  this.http.get('/api/users'),
  this.http.get('/api/posts')
]);
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