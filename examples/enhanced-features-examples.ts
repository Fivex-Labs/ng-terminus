import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { interval, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

// Import all the new ng-terminus features
import {
  // Route-based operators
  takeUntilRoute,
  takeWhileOnRoute,
  
  // HTTP operators
  HttpRequestManager,
  cancelOnDestroy,
  cancelPrevious,
  retryWithBackoff,
  logHttpRequests,
  
  // Visibility operators
  takeWhileVisible,
  takeUntilHidden,
  bufferWhileHidden,
  throttleWhileHidden,
  
  // Forms operators
  takeUntilFormDestroyed,
  takeWhileFormValid,
  FormSubscriptionManager,
  
  // Memory optimization
  MemoryOptimizer,
  optimizeMemory,
  shareWithAutoCleanup,
  limitEmissionRate,
  MemoryUtils,
  
  // Enhanced debugging
  SubscriptionDebuggerService,
  
  // Testing utilities
  TestObservable,
  SubscriptionTester,
  MemoryLeakDetector,
  TestScenarios
} from '@fivexlabs/ng-terminus';

/**
 * Example component demonstrating all enhanced ng-terminus features
 */
@Component({
  selector: 'app-enhanced-features-demo',
  template: `
    <div class="demo-container">
      <h1>🎯 ng-terminus Enhanced Features Demo</h1>
      
      <!-- Route-based Subscriptions -->
      <section class="feature-section">
        <h2>🛣️ Route-based Subscription Management</h2>
        <button (click)="startRouteBasedSubscriptions()">Start Route-based Subscriptions</button>
        <div class="output" id="route-output"></div>
      </section>

      <!-- HTTP Request Management -->
      <section class="feature-section">
        <h2>🌐 HTTP Request Management</h2>
        <button (click)="demonstrateHttpFeatures()">Demo HTTP Features</button>
        <button (click)="cancelAllRequests()">Cancel All Requests</button>
        <div class="output" id="http-output"></div>
      </section>

      <!-- Visibility-based Subscriptions -->
      <section class="feature-section">
        <h2>👁️ Visibility-based Subscriptions</h2>
        <button (click)="startVisibilitySubscriptions()">Start Visibility Subscriptions</button>
        <p>Try switching tabs or minimizing the browser to see the effect!</p>
        <div class="output" id="visibility-output"></div>
      </section>

      <!-- Forms Integration -->
      <section class="feature-section">
        <h2>📝 Reactive Forms Integration</h2>
        <form [formGroup]="demoForm">
          <input formControlName="name" placeholder="Enter name">
          <input formControlName="email" placeholder="Enter email">
          <button type="button" (click)="startFormSubscriptions()">Start Form Subscriptions</button>
        </form>
        <div class="output" id="forms-output"></div>
      </section>

      <!-- Memory Optimization -->
      <section class="feature-section">
        <h2>🧠 Memory Optimization</h2>
        <button (click)="demonstrateMemoryOptimization()">Demo Memory Optimization</button>
        <button (click)="showMemoryStats()">Show Memory Stats</button>
        <div class="output" id="memory-output"></div>
      </section>

      <!-- Enhanced Debugging -->
      <section class="feature-section">
        <h2>🔍 Enhanced Debugging</h2>
        <button (click)="enableDebugging()">Enable Debugging</button>
        <button (click)="showDebugStatus()">Show Debug Status</button>
        <button (click)="exportDebugInfo()">Export Debug Info</button>
        <div class="output" id="debug-output"></div>
      </section>

      <!-- Testing Utilities -->
      <section class="feature-section">
        <h2>🧪 Testing Utilities Demo</h2>
        <button (click)="demonstrateTestingUtils()">Demo Testing Utils</button>
        <div class="output" id="testing-output"></div>
      </section>
    </div>
  `,
  styles: [`
    .demo-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .feature-section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .feature-section h2 { color: #333; margin-bottom: 15px; }
    .output { margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; min-height: 50px; }
    button { margin: 5px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #0056b3; }
    input { margin: 5px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    form { margin-bottom: 15px; }
  `]
})
export class EnhancedFeaturesDemoComponent implements OnInit {
  private httpRequestManager = new HttpRequestManager();
  private formSubscriptionManager = new FormSubscriptionManager();
  private memoryOptimizer = MemoryOptimizer.getInstance();
  private subscriptionTester = new SubscriptionTester();
  private memoryLeakDetector = new MemoryLeakDetector();
  
  demoForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private subscriptionDebugger: SubscriptionDebuggerService
  ) {
    this.demoForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.memoryOptimizer.enable();
    this.memoryLeakDetector.startMonitoring();
    this.log('🎯 Enhanced features demo initialized');
  }

  /**
   * Demonstrate route-based subscription management
   */
  startRouteBasedSubscriptions() {
    this.log('🛣️ Starting route-based subscriptions...', 'route-output');

    // Example 1: Unsubscribe on any route change
    interval(1000).pipe(
      takeUntilRoute(),
      map(i => `Route subscription ${i}`)
    ).subscribe(value => {
      this.log(value, 'route-output');
    });

    // Example 2: Only active on specific route
    interval(2000).pipe(
      takeWhileOnRoute('/dashboard/**'),
      map(i => `Dashboard-only subscription ${i}`)
    ).subscribe(value => {
      this.log(value, 'route-output');
    });

    this.log('✅ Route-based subscriptions started', 'route-output');
  }

  /**
   * Demonstrate HTTP request management features
   */
  demonstrateHttpFeatures() {
    this.log('🌐 Demonstrating HTTP features...', 'http-output');

    // Example 1: Cancellable request
    const { request$, cancel } = this.httpRequestManager.createCancellableRequest(
      () => this.http.get('https://jsonplaceholder.typicode.com/posts/1').pipe(delay(2000)),
      'demo-request'
    );

    request$.pipe(
      logHttpRequests('Demo API Call'),
      retryWithBackoff(2, 1000)
    ).subscribe({
      next: (data: any) => this.log(`✅ Request successful: ${JSON.stringify(data).substring(0, 100)}...`, 'http-output'),
      error: (error: any) => this.log(`❌ Request failed: ${error.message}`, 'http-output')
    });

    // Cancel after 3 seconds for demo
    setTimeout(() => {
      cancel();
      this.log('🚫 Request cancelled after 3 seconds', 'http-output');
    }, 3000);

    // Example 2: Cancel previous requests
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        of(`Request ${i + 1}`).pipe(
          delay(1000),
          cancelPrevious()
        ).subscribe(value => {
          this.log(`📦 ${value} completed`, 'http-output');
        });
      }, i * 500);
    }
  }

  cancelAllRequests() {
    this.httpRequestManager.cancelAllRequests();
    this.log('🚫 All HTTP requests cancelled', 'http-output');
  }

  /**
   * Demonstrate visibility-based subscriptions
   */
  startVisibilitySubscriptions() {
    this.log('👁️ Starting visibility-based subscriptions...', 'visibility-output');

    // Example 1: Pause when hidden
    interval(1000).pipe(
      takeWhileVisible(),
      map(i => `Visible subscription ${i}`)
    ).subscribe(value => {
      this.log(value, 'visibility-output');
    });

    // Example 2: Buffer while hidden
    interval(2000).pipe(
      bufferWhileHidden(3),
      map((values: any[]) => `Buffered: [${values.join(', ')}]`)
    ).subscribe(value => {
      this.log(value, 'visibility-output');
    });

    // Example 3: Throttle when hidden
    interval(500).pipe(
      throttleWhileHidden(5000),
      map(i => `Throttled subscription ${i}`)
    ).subscribe(value => {
      this.log(value, 'visibility-output');
    });

    this.log('✅ Visibility subscriptions started', 'visibility-output');
  }

  /**
   * Demonstrate forms integration
   */
  startFormSubscriptions() {
    this.log('📝 Starting form subscriptions...', 'forms-output');

    // Example 1: Form value changes with automatic cleanup
    this.demoForm.valueChanges.pipe(
      takeUntilFormDestroyed()
    ).subscribe(value => {
      this.log(`Form changed: ${JSON.stringify(value)}`, 'forms-output');
    });

    // Example 2: Only emit when form is valid
    this.demoForm.valueChanges.pipe(
      takeWhileFormValid(() => this.demoForm.valid)
    ).subscribe(value => {
      this.log(`Valid form: ${JSON.stringify(value)}`, 'forms-output');
    });

    // Example 3: Managed form subscription
    const managedSub = this.formSubscriptionManager.manage(
      this.demoForm.get('name')!.valueChanges,
      'name-changes'
    );

    managedSub.subscribe((value: any) => {
      this.log(`Name changed: ${value}`, 'forms-output');
    });

    this.log('✅ Form subscriptions started', 'forms-output');
  }

  /**
   * Demonstrate memory optimization features
   */
  demonstrateMemoryOptimization() {
    this.log('🧠 Demonstrating memory optimization...', 'memory-output');

    // Example 1: Optimized observable with sharing
    const optimizedObs = interval(1000).pipe(
      optimizeMemory({ share: true, name: 'demo-optimized' }),
      map(i => `Optimized: ${i}`)
    );

    // Multiple subscriptions to the same optimized observable
    optimizedObs.subscribe(value => this.log(`Sub 1: ${value}`, 'memory-output'));
    optimizedObs.subscribe(value => this.log(`Sub 2: ${value}`, 'memory-output'));

    // Example 2: Auto-cleanup sharing
    const autoCleanupObs = interval(2000).pipe(
      shareWithAutoCleanup(3000),
      map(i => `Auto-cleanup: ${i}`)
    );

    const sub = autoCleanupObs.subscribe(value => this.log(value, 'memory-output'));
    
    // Unsubscribe after 5 seconds to demo cleanup
    setTimeout(() => {
      sub.unsubscribe();
      this.log('🧹 Unsubscribed - auto cleanup will trigger in 3 seconds', 'memory-output');
    }, 5000);

    // Example 3: Rate limiting
    interval(100).pipe(
      limitEmissionRate(2), // Max 2 emissions per second
      map(i => `Rate limited: ${i}`)
    ).subscribe(value => this.log(value, 'memory-output'));

    this.log('✅ Memory optimization demo started', 'memory-output');
  }

  showMemoryStats() {
    MemoryUtils.logMemoryStats();
    const stats = this.memoryOptimizer.getMemoryStats();
    this.log(`📊 Memory Stats: ${JSON.stringify(stats, null, 2)}`, 'memory-output');
  }

  /**
   * Demonstrate enhanced debugging features
   */
  enableDebugging() {
    this.subscriptionDebugger.enable();
    this.log('🔍 Debugging enabled', 'debug-output');

    // Create debuggable subscriptions
    const debugObs = this.subscriptionDebugger.debugSubscription(
      interval(1000).pipe(map(i => `Debug ${i}`)),
      {
        name: 'DebugDemo',
        componentName: 'EnhancedFeaturesDemoComponent',
        logEmissions: true,
        captureStackTrace: true
      }
    );

    debugObs.subscribe((value: any) => {
      this.log(`🐛 ${value}`, 'debug-output');
    });
  }

  showDebugStatus() {
    this.subscriptionDebugger.logStatus();
    const metrics = this.subscriptionDebugger.getPerformanceMetrics();
    this.log(`📈 Debug Metrics: ${JSON.stringify(metrics, null, 2)}`, 'debug-output');
  }

  exportDebugInfo() {
    const debugInfo = this.subscriptionDebugger.exportDebugInfo();
    this.log('📋 Debug info exported to console', 'debug-output');
    console.log('Debug Export:', debugInfo);
  }

  /**
   * Demonstrate testing utilities
   */
  demonstrateTestingUtils() {
    this.log('🧪 Demonstrating testing utilities...', 'testing-output');

    // Example 1: Test Observable
    const testObs = new TestObservable<string>();
    
    this.subscriptionTester.subscribe(
      testObs,
      'test-observable',
      {
        onNext: (value: any) => this.log(`Test emission: ${value}`, 'testing-output'),
        onComplete: () => this.log('Test completed', 'testing-output')
      }
    );

    // Emit test values
    setTimeout(() => testObs.emit('Hello'), 1000);
    setTimeout(() => testObs.emit('World'), 2000);
    setTimeout(() => testObs.complete(), 3000);

    // Example 2: Test scenarios
    const intervalObs = TestScenarios.createIntervalObservable(500, 5);
    this.subscriptionTester.subscribe(intervalObs, 'interval-test');

    const errorObs = TestScenarios.createErrorObservable(2000);
    this.subscriptionTester.subscribe(
      errorObs,
      'error-test',
      {
        onError: (error: any) => this.log(`Test error: ${error.message}`, 'testing-output')
      }
    );

    // Show stats after 4 seconds
    setTimeout(() => {
      this.log(`📊 Test Stats:
        - Interval emissions: ${this.subscriptionTester.getEmissionCount('interval-test')}
        - Error count: ${this.subscriptionTester.getErrorCount('error-test')}
        - Active subscriptions: ${this.subscriptionTester.getActiveSubscriptionCount()}`, 'testing-output');
    }, 4000);

    this.log('✅ Testing utilities demo started', 'testing-output');
  }

  private log(message: string, outputId: string = 'general') {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log(logMessage);
    
    const outputElement = document.getElementById(outputId);
    if (outputElement) {
      outputElement.innerHTML += `<div>${logMessage}</div>`;
      outputElement.scrollTop = outputElement.scrollHeight;
    }
  }

  ngOnDestroy() {
    // Cleanup all managed subscriptions
    this.formSubscriptionManager.unsubscribeAll();
    this.httpRequestManager.cancelAllRequests();
    this.subscriptionTester.reset();
    this.memoryLeakDetector.cleanup();
    
    console.log('🧹 Enhanced features demo component destroyed');
  }
} 