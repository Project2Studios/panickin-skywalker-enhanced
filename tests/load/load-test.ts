/**
 * Load Testing Suite
 * 
 * Tests the application under various load conditions to ensure
 * performance and stability under high traffic scenarios.
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

interface LoadTestConfig {
  baseUrl: string;
  concurrentUsers: number;
  duration: number; // in seconds
  rampUpTime: number; // in seconds
  thinkTime: number; // milliseconds between requests
}

interface RequestResult {
  statusCode: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  throughput: number;
  errorRate: number;
  percentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  errors: { [key: string]: number };
}

class LoadTester {
  private config: LoadTestConfig;
  private results: RequestResult[] = [];
  private startTime: number = 0;
  private activeUsers: number = 0;
  private isRunning: boolean = false;

  constructor(config: LoadTestConfig) {
    this.config = config;
  }

  private async makeRequest(path: string, method: string = 'GET', body?: any): Promise<RequestResult> {
    return new Promise((resolve) => {
      const url = new URL(path, this.config.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const startTime = Date.now();
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LoadTester/1.0'
        }
      };

      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode || 0,
            responseTime,
            success: res.statusCode ? res.statusCode < 400 : false
          });
        });
      });

      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: 0,
          responseTime,
          success: false,
          error: error.message
        });
      });

      req.setTimeout(30000, () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: 0,
          responseTime,
          success: false,
          error: 'Request timeout'
        });
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      
      req.end();
    });
  }

  private async simulateUser(userId: number): Promise<void> {
    const scenarios = [
      () => this.browseProducts(),
      () => this.addToCartAndCheckout(),
      () => this.searchProducts(),
      () => this.viewProductDetails(),
      () => this.apiHealthCheck()
    ];

    while (this.isRunning) {
      try {
        // Select random scenario
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        await scenario();
        
        // Think time between requests
        if (this.config.thinkTime > 0) {
          await this.sleep(this.config.thinkTime + Math.random() * this.config.thinkTime);
        }
      } catch (error) {
        console.warn(`User ${userId} encountered error:`, error);
      }
    }
  }

  private async browseProducts(): Promise<void> {
    // Home page
    const homeResult = await this.makeRequest('/');
    this.results.push(homeResult);

    // Products API
    const productsResult = await this.makeRequest('/api/products');
    this.results.push(productsResult);
  }

  private async addToCartAndCheckout(): Promise<void> {
    // Get products
    const productsResult = await this.makeRequest('/api/products');
    this.results.push(productsResult);

    if (productsResult.success) {
      // Simulate adding to cart
      const addToCartResult = await this.makeRequest('/api/cart', 'POST', {
        productId: 1,
        quantity: 1
      });
      this.results.push(addToCartResult);

      // View cart
      const cartResult = await this.makeRequest('/api/cart');
      this.results.push(cartResult);
    }
  }

  private async searchProducts(): Promise<void> {
    const searchTerms = ['t-shirt', 'hoodie', 'poster', 'vinyl', 'merch'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const searchResult = await this.makeRequest(`/api/search?q=${term}`);
    this.results.push(searchResult);
  }

  private async viewProductDetails(): Promise<void> {
    const productId = Math.floor(Math.random() * 10) + 1;
    const productResult = await this.makeRequest(`/api/products/${productId}`);
    this.results.push(productResult);
  }

  private async apiHealthCheck(): Promise<void> {
    const healthResult = await this.makeRequest('/health');
    this.results.push(healthResult);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private analyzeResults(): LoadTestResult {
    const responseTimes = this.results.map(r => r.responseTime);
    const successfulResults = this.results.filter(r => r.success);
    const failedResults = this.results.filter(r => !r.success);
    
    const errors: { [key: string]: number } = {};
    failedResults.forEach(result => {
      const error = result.error || `HTTP ${result.statusCode}`;
      errors[error] = (errors[error] || 0) + 1;
    });

    const totalTime = Date.now() - this.startTime;
    const totalTimeSeconds = totalTime / 1000;

    return {
      totalRequests: this.results.length,
      successfulRequests: successfulResults.length,
      failedRequests: failedResults.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      requestsPerSecond: this.results.length / totalTimeSeconds,
      throughput: successfulResults.length / totalTimeSeconds,
      errorRate: (failedResults.length / this.results.length) * 100,
      percentiles: {
        p50: this.calculatePercentile(responseTimes, 50),
        p90: this.calculatePercentile(responseTimes, 90),
        p95: this.calculatePercentile(responseTimes, 95),
        p99: this.calculatePercentile(responseTimes, 99)
      },
      errors
    };
  }

  public async run(): Promise<LoadTestResult> {
    console.log(`Starting load test with ${this.config.concurrentUsers} users for ${this.config.duration}s`);
    console.log(`Base URL: ${this.config.baseUrl}`);
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.results = [];

    // Ramp up users gradually
    const rampUpInterval = (this.config.rampUpTime * 1000) / this.config.concurrentUsers;
    
    for (let i = 0; i < this.config.concurrentUsers; i++) {
      setTimeout(() => {
        if (this.isRunning) {
          this.activeUsers++;
          this.simulateUser(i).catch(console.error);
        }
      }, i * rampUpInterval);
    }

    // Run for specified duration
    await this.sleep(this.config.duration * 1000);
    
    this.isRunning = false;
    
    // Wait a bit for ongoing requests to complete
    await this.sleep(5000);
    
    console.log(`Load test completed. Processed ${this.results.length} requests.`);
    
    const results = this.analyzeResults();
    this.printResults(results);
    
    return results;
  }

  private printResults(results: LoadTestResult): void {
    console.log('\n=== LOAD TEST RESULTS ===');
    console.log(`Duration: ${this.config.duration}s`);
    console.log(`Concurrent Users: ${this.config.concurrentUsers}`);
    console.log(`\nRequests:`);
    console.log(`  Total: ${results.totalRequests}`);
    console.log(`  Successful: ${results.successfulRequests}`);
    console.log(`  Failed: ${results.failedRequests}`);
    console.log(`  Error Rate: ${results.errorRate.toFixed(2)}%`);
    
    console.log(`\nPerformance:`);
    console.log(`  Requests/sec: ${results.requestsPerSecond.toFixed(2)}`);
    console.log(`  Successful Requests/sec: ${results.throughput.toFixed(2)}`);
    console.log(`  Avg Response Time: ${results.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Min Response Time: ${results.minResponseTime}ms`);
    console.log(`  Max Response Time: ${results.maxResponseTime}ms`);
    
    console.log(`\nPercentiles:`);
    console.log(`  50th percentile: ${results.percentiles.p50.toFixed(2)}ms`);
    console.log(`  90th percentile: ${results.percentiles.p90.toFixed(2)}ms`);
    console.log(`  95th percentile: ${results.percentiles.p95.toFixed(2)}ms`);
    console.log(`  99th percentile: ${results.percentiles.p99.toFixed(2)}ms`);
    
    if (Object.keys(results.errors).length > 0) {
      console.log(`\nErrors:`);
      Object.entries(results.errors).forEach(([error, count]) => {
        console.log(`  ${error}: ${count}`);
      });
    }
    
    // Performance assessment
    console.log(`\n=== PERFORMANCE ASSESSMENT ===`);
    
    if (results.errorRate < 1) {
      console.log('✅ Error Rate: Excellent (< 1%)');
    } else if (results.errorRate < 5) {
      console.log('⚠️  Error Rate: Acceptable (< 5%)');
    } else {
      console.log('❌ Error Rate: Poor (> 5%)');
    }
    
    if (results.averageResponseTime < 200) {
      console.log('✅ Avg Response Time: Excellent (< 200ms)');
    } else if (results.averageResponseTime < 1000) {
      console.log('⚠️  Avg Response Time: Acceptable (< 1s)');
    } else {
      console.log('❌ Avg Response Time: Poor (> 1s)');
    }
    
    if (results.percentiles.p95 < 500) {
      console.log('✅ 95th Percentile: Excellent (< 500ms)');
    } else if (results.percentiles.p95 < 2000) {
      console.log('⚠️  95th Percentile: Acceptable (< 2s)');
    } else {
      console.log('❌ 95th Percentile: Poor (> 2s)');
    }
  }
}

// Predefined test scenarios
const scenarios = {
  smoke: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    concurrentUsers: 5,
    duration: 30,
    rampUpTime: 10,
    thinkTime: 1000
  },
  
  light: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    concurrentUsers: 25,
    duration: 120,
    rampUpTime: 30,
    thinkTime: 2000
  },
  
  moderate: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    concurrentUsers: 100,
    duration: 300,
    rampUpTime: 60,
    thinkTime: 3000
  },
  
  heavy: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    concurrentUsers: 500,
    duration: 600,
    rampUpTime: 120,
    thinkTime: 5000
  },
  
  spike: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    concurrentUsers: 200,
    duration: 60,
    rampUpTime: 5, // Quick ramp up for spike testing
    thinkTime: 1000
  },
  
  endurance: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    concurrentUsers: 50,
    duration: 1800, // 30 minutes
    rampUpTime: 60,
    thinkTime: 5000
  }
};

// CLI interface
async function main() {
  const scenario = process.argv[2] || 'smoke';
  const config = scenarios[scenario as keyof typeof scenarios];
  
  if (!config) {
    console.error('Invalid scenario. Available scenarios:', Object.keys(scenarios).join(', '));
    process.exit(1);
  }
  
  console.log(`Running ${scenario} load test scenario...`);
  
  const tester = new LoadTester(config);
  
  try {
    const results = await tester.run();
    
    // Exit with error code if performance is poor
    const performanceScore = 
      (results.errorRate < 5 ? 25 : 0) +
      (results.averageResponseTime < 1000 ? 25 : 0) +
      (results.percentiles.p95 < 2000 ? 25 : 0) +
      (results.requestsPerSecond > 10 ? 25 : 0);
    
    console.log(`\nOverall Performance Score: ${performanceScore}/100`);
    
    if (performanceScore < 75) {
      console.log('❌ Performance test FAILED');
      process.exit(1);
    } else {
      console.log('✅ Performance test PASSED');
      process.exit(0);
    }
  } catch (error) {
    console.error('Load test failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { LoadTester, LoadTestConfig, LoadTestResult };

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}