/**
 * Security Testing and Audit Suite
 * 
 * Comprehensive security testing including:
 * - SQL Injection testing
 * - XSS vulnerability scanning
 * - Authentication and authorization testing
 * - Input validation testing
 * - API security testing
 * - OWASP compliance checking
 */

import fetch from 'node-fetch';
import { URL } from 'url';

interface SecurityTestConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  skipCertificateValidation?: boolean;
}

interface SecurityVulnerability {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  endpoint: string;
  description: string;
  payload?: string;
  recommendation: string;
}

interface SecurityAuditResult {
  timestamp: string;
  totalTests: number;
  vulnerabilities: SecurityVulnerability[];
  securityScore: number;
  passed: boolean;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

class SecurityAuditor {
  private config: SecurityTestConfig;
  private vulnerabilities: SecurityVulnerability[] = [];
  private testCount: number = 0;

  // Common attack payloads
  private readonly SQL_PAYLOADS = [
    "' OR 1=1--",
    "'; DROP TABLE users;--",
    "' UNION SELECT * FROM users--",
    "1' AND 1=1--",
    "admin'--",
    "' OR 'a'='a",
    "1; UPDATE users SET admin=1--"
  ];

  private readonly XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    "'><script>alert('XSS')</script>",
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ];

  private readonly COMMAND_INJECTION_PAYLOADS = [
    '; ls -la',
    '| whoami',
    '&& cat /etc/passwd',
    '`rm -rf /`',
    '$(cat /etc/passwd)',
    '; sleep 10;'
  ];

  constructor(config: SecurityTestConfig) {
    this.config = config;
  }

  public async runAudit(): Promise<SecurityAuditResult> {
    console.log('🔒 Starting security audit...');
    this.vulnerabilities = [];
    this.testCount = 0;

    try {
      await this.testSQLInjection();
      await this.testXSS();
      await this.testCSRF();
      await this.testAuthenticationBypass();
      await this.testAuthorizationFlaws();
      await this.testInputValidation();
      await this.testDirectoryTraversal();
      await this.testCommandInjection();
      await this.testInsecureDirectObjectReferences();
      await this.testSecurityHeaders();
      await this.testSSLConfiguration();
      await this.testRateLimiting();
      await this.testAPIVulnerabilities();
    } catch (error) {
      console.error('Error during security audit:', error);
    }

    return this.generateReport();
  }

  private async makeRequest(
    path: string,
    method: string = 'GET',
    body?: any,
    headers?: Record<string, string>
  ): Promise<Response | null> {
    try {
      const url = new URL(path, this.config.baseUrl);
      const response = await fetch(url.toString(), {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Security-Auditor/1.0',
          ...headers
        }
      });
      return response;
    } catch (error) {
      console.warn(`Request failed for ${path}:`, error);
      return null;
    }
  }

  private addVulnerability(
    severity: SecurityVulnerability['severity'],
    type: string,
    endpoint: string,
    description: string,
    payload?: string,
    recommendation: string = 'Review and fix the vulnerability'
  ) {
    this.vulnerabilities.push({
      severity,
      type,
      endpoint,
      description,
      payload,
      recommendation
    });
  }

  // SQL Injection Testing
  private async testSQLInjection(): Promise<void> {
    console.log('Testing SQL Injection vulnerabilities...');
    
    const endpoints = [
      '/api/products',
      '/api/users',
      '/api/orders',
      '/api/search'
    ];

    for (const endpoint of endpoints) {
      for (const payload of this.SQL_PAYLOADS) {
        this.testCount++;
        
        // Test query parameters
        const queryResponse = await this.makeRequest(`${endpoint}?id=${encodeURIComponent(payload)}`);
        if (await this.detectSQLInjection(queryResponse, payload)) {
          this.addVulnerability(
            'critical',
            'SQL Injection',
            endpoint,
            'SQL injection vulnerability detected in query parameters',
            payload,
            'Use parameterized queries and input validation'
          );
        }

        // Test POST body
        if (endpoint !== '/api/search') {
          const bodyResponse = await this.makeRequest(endpoint, 'POST', { id: payload });
          if (await this.detectSQLInjection(bodyResponse, payload)) {
            this.addVulnerability(
              'critical',
              'SQL Injection',
              endpoint,
              'SQL injection vulnerability detected in POST body',
              payload,
              'Use parameterized queries and input validation'
            );
          }
        }
      }
    }
  }

  private async detectSQLInjection(response: Response | null, payload: string): Promise<boolean> {
    if (!response) return false;

    const text = await response.text().catch(() => '');
    const sqlErrors = [
      'sql syntax',
      'mysql error',
      'postgresql error',
      'sqlite error',
      'oracle error',
      'syntax error',
      'database error'
    ];

    return sqlErrors.some(error => text.toLowerCase().includes(error));
  }

  // XSS Testing
  private async testXSS(): Promise<void> {
    console.log('Testing XSS vulnerabilities...');
    
    const endpoints = [
      '/api/search',
      '/api/comments',
      '/api/feedback'
    ];

    for (const endpoint of endpoints) {
      for (const payload of this.XSS_PAYLOADS) {
        this.testCount++;
        
        // Test reflected XSS
        const response = await this.makeRequest(`${endpoint}?q=${encodeURIComponent(payload)}`);
        if (await this.detectXSS(response, payload)) {
          this.addVulnerability(
            'high',
            'Cross-Site Scripting (XSS)',
            endpoint,
            'XSS vulnerability detected - user input reflected without proper encoding',
            payload,
            'Implement proper input validation and output encoding'
          );
        }
      }
    }
  }

  private async detectXSS(response: Response | null, payload: string): Promise<boolean> {
    if (!response) return false;

    const text = await response.text().catch(() => '');
    // Check if payload is reflected in response without proper encoding
    return text.includes(payload) || text.includes(payload.replace(/</g, '&lt;'));
  }

  // CSRF Testing
  private async testCSRF(): Promise<void> {
    console.log('Testing CSRF vulnerabilities...');
    
    const endpoints = [
      { path: '/api/users', method: 'POST' },
      { path: '/api/orders', method: 'POST' },
      { path: '/api/cart', method: 'POST' }
    ];

    for (const { path, method } of endpoints) {
      this.testCount++;
      
      // Test without CSRF token
      const response = await this.makeRequest(path, method, { test: 'data' });
      if (response && response.status === 200) {
        this.addVulnerability(
          'medium',
          'Cross-Site Request Forgery (CSRF)',
          path,
          'Endpoint accepts requests without CSRF protection',
          undefined,
          'Implement CSRF tokens for state-changing operations'
        );
      }
    }
  }

  // Authentication Bypass Testing
  private async testAuthenticationBypass(): Promise<void> {
    console.log('Testing authentication bypass...');
    
    const protectedEndpoints = [
      '/api/admin/users',
      '/api/admin/orders',
      '/api/profile',
      '/api/orders'
    ];

    for (const endpoint of protectedEndpoints) {
      this.testCount++;
      
      // Test without authentication
      const response = await this.makeRequest(endpoint);
      if (response && response.status === 200) {
        this.addVulnerability(
          'critical',
          'Authentication Bypass',
          endpoint,
          'Protected endpoint accessible without authentication',
          undefined,
          'Implement proper authentication middleware'
        );
      }
    }
  }

  // Authorization Testing
  private async testAuthorizationFlaws(): Promise<void> {
    console.log('Testing authorization flaws...');
    
    // Test horizontal privilege escalation
    const userEndpoints = [
      '/api/users/1',
      '/api/orders/1',
      '/api/profile/1'
    ];

    for (const endpoint of userEndpoints) {
      this.testCount++;
      
      // Test with different user IDs
      for (let i = 2; i <= 5; i++) {
        const testEndpoint = endpoint.replace('/1', `/${i}`);
        const response = await this.makeRequest(testEndpoint);
        
        if (response && response.status === 200) {
          this.addVulnerability(
            'high',
            'Insecure Direct Object Reference',
            testEndpoint,
            'User can access resources belonging to other users',
            undefined,
            'Implement proper authorization checks'
          );
        }
      }
    }
  }

  // Input Validation Testing
  private async testInputValidation(): Promise<void> {
    console.log('Testing input validation...');
    
    const testCases = [
      { field: 'email', value: 'invalid-email', expected: 400 },
      { field: 'phone', value: '123', expected: 400 },
      { field: 'quantity', value: -1, expected: 400 },
      { field: 'price', value: 'abc', expected: 400 }
    ];

    const endpoints = ['/api/products', '/api/users', '/api/orders'];

    for (const endpoint of endpoints) {
      for (const testCase of testCases) {
        this.testCount++;
        
        const response = await this.makeRequest(endpoint, 'POST', {
          [testCase.field]: testCase.value
        });

        if (response && response.status !== testCase.expected) {
          this.addVulnerability(
            'medium',
            'Input Validation',
            endpoint,
            `Inadequate input validation for field: ${testCase.field}`,
            testCase.value,
            'Implement comprehensive input validation'
          );
        }
      }
    }
  }

  // Directory Traversal Testing
  private async testDirectoryTraversal(): Promise<void> {
    console.log('Testing directory traversal...');
    
    const payloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2f%etc%2fpasswd'
    ];

    const endpoints = ['/api/files', '/api/download', '/api/assets'];

    for (const endpoint of endpoints) {
      for (const payload of payloads) {
        this.testCount++;
        
        const response = await this.makeRequest(`${endpoint}?file=${encodeURIComponent(payload)}`);
        if (await this.detectDirectoryTraversal(response)) {
          this.addVulnerability(
            'high',
            'Directory Traversal',
            endpoint,
            'Directory traversal vulnerability detected',
            payload,
            'Validate and sanitize file paths'
          );
        }
      }
    }
  }

  private async detectDirectoryTraversal(response: Response | null): Promise<boolean> {
    if (!response) return false;
    
    const text = await response.text().catch(() => '');
    const indicators = ['root:x:', 'daemon:', 'bin:', 'sys:', 'localhost'];
    
    return indicators.some(indicator => text.includes(indicator));
  }

  // Command Injection Testing
  private async testCommandInjection(): Promise<void> {
    console.log('Testing command injection...');
    
    const endpoints = ['/api/system', '/api/tools', '/api/utils'];

    for (const endpoint of endpoints) {
      for (const payload of this.COMMAND_INJECTION_PAYLOADS) {
        this.testCount++;
        
        const response = await this.makeRequest(endpoint, 'POST', {
          command: payload
        });

        if (await this.detectCommandInjection(response)) {
          this.addVulnerability(
            'critical',
            'Command Injection',
            endpoint,
            'Command injection vulnerability detected',
            payload,
            'Never execute user input as system commands'
          );
        }
      }
    }
  }

  private async detectCommandInjection(response: Response | null): Promise<boolean> {
    if (!response) return false;
    
    const text = await response.text().catch(() => '');
    const indicators = ['uid=', 'gid=', 'root', 'admin', 'directory', 'volume'];
    
    return indicators.some(indicator => text.toLowerCase().includes(indicator));
  }

  // Insecure Direct Object References
  private async testInsecureDirectObjectReferences(): Promise<void> {
    console.log('Testing insecure direct object references...');
    
    const endpoints = [
      '/api/users/{id}',
      '/api/orders/{id}',
      '/api/documents/{id}'
    ];

    for (const endpoint of endpoints) {
      for (let id = 1; id <= 10; id++) {
        this.testCount++;
        
        const testEndpoint = endpoint.replace('{id}', id.toString());
        const response = await this.makeRequest(testEndpoint);
        
        if (response && response.status === 200) {
          // This is a basic check - in practice, you'd need authentication context
          console.log(`Accessible: ${testEndpoint}`);
        }
      }
    }
  }

  // Security Headers Testing
  private async testSecurityHeaders(): Promise<void> {
    console.log('Testing security headers...');
    
    this.testCount++;
    const response = await this.makeRequest('/');
    
    if (response) {
      const headers = response.headers;
      
      const requiredHeaders = [
        { name: 'X-Content-Type-Options', expected: 'nosniff' },
        { name: 'X-Frame-Options', expected: ['DENY', 'SAMEORIGIN'] },
        { name: 'X-XSS-Protection', expected: '1; mode=block' },
        { name: 'Strict-Transport-Security', expected: null },
        { name: 'Content-Security-Policy', expected: null }
      ];

      for (const header of requiredHeaders) {
        const value = headers.get(header.name);
        
        if (!value) {
          this.addVulnerability(
            'medium',
            'Missing Security Header',
            '/',
            `Missing security header: ${header.name}`,
            undefined,
            `Add ${header.name} header to responses`
          );
        } else if (header.expected && !Array.isArray(header.expected) && value !== header.expected) {
          this.addVulnerability(
            'low',
            'Insecure Security Header',
            '/',
            `Insecure value for header: ${header.name}`,
            value,
            `Set ${header.name} to recommended value`
          );
        }
      }
    }
  }

  // SSL Configuration Testing
  private async testSSLConfiguration(): Promise<void> {
    console.log('Testing SSL configuration...');
    
    if (!this.config.baseUrl.startsWith('https://')) {
      this.addVulnerability(
        'high',
        'Insecure Transport',
        '/',
        'Application not using HTTPS',
        undefined,
        'Enable HTTPS for all communications'
      );
    }
  }

  // Rate Limiting Testing
  private async testRateLimiting(): Promise<void> {
    console.log('Testing rate limiting...');
    
    const endpoint = '/api/login';
    const requests = [];
    
    // Send multiple requests rapidly
    for (let i = 0; i < 20; i++) {
      requests.push(this.makeRequest(endpoint, 'POST', {
        username: 'test',
        password: 'test'
      }));
    }
    
    this.testCount += requests.length;
    const responses = await Promise.all(requests);
    
    // Check if any requests were rate limited
    const rateLimited = responses.some(response => 
      response && response.status === 429
    );
    
    if (!rateLimited) {
      this.addVulnerability(
        'medium',
        'Missing Rate Limiting',
        endpoint,
        'No rate limiting detected on sensitive endpoint',
        undefined,
        'Implement rate limiting for authentication endpoints'
      );
    }
  }

  // API Security Testing
  private async testAPIVulnerabilities(): Promise<void> {
    console.log('Testing API security...');
    
    // Test API versioning
    const versionTests = ['/api/v1/users', '/api/v2/users', '/api/users'];
    
    for (const endpoint of versionTests) {
      this.testCount++;
      
      const response = await this.makeRequest(endpoint);
      if (response && response.status === 200) {
        // Check for information disclosure
        const text = await response.text().catch(() => '');
        if (text.includes('password') || text.includes('token')) {
          this.addVulnerability(
            'high',
            'Information Disclosure',
            endpoint,
            'API response contains sensitive information',
            undefined,
            'Remove sensitive data from API responses'
          );
        }
      }
    }
  }

  private generateReport(): SecurityAuditResult {
    const summary = this.vulnerabilities.reduce(
      (acc, vuln) => {
        acc[vuln.severity]++;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );

    // Calculate security score (0-100)
    const securityScore = Math.max(0, 100 - (
      summary.critical * 25 +
      summary.high * 10 +
      summary.medium * 5 +
      summary.low * 1
    ));

    const passed = summary.critical === 0 && summary.high === 0;

    const result: SecurityAuditResult = {
      timestamp: new Date().toISOString(),
      totalTests: this.testCount,
      vulnerabilities: this.vulnerabilities,
      securityScore,
      passed,
      summary
    };

    this.printReport(result);
    return result;
  }

  private printReport(result: SecurityAuditResult): void {
    console.log('\n🔒 SECURITY AUDIT REPORT');
    console.log('='.repeat(50));
    console.log(`Tests Run: ${result.totalTests}`);
    console.log(`Security Score: ${result.securityScore}/100`);
    console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log('\n📊 Vulnerability Summary:');
    console.log(`  Critical: ${result.summary.critical}`);
    console.log(`  High: ${result.summary.high}`);
    console.log(`  Medium: ${result.summary.medium}`);
    console.log(`  Low: ${result.summary.low}`);
    
    if (result.vulnerabilities.length > 0) {
      console.log('\n🚨 Vulnerabilities Found:');
      result.vulnerabilities.forEach((vuln, index) => {
        console.log(`\n${index + 1}. ${vuln.type} (${vuln.severity.toUpperCase()})`);
        console.log(`   Endpoint: ${vuln.endpoint}`);
        console.log(`   Description: ${vuln.description}`);
        if (vuln.payload) {
          console.log(`   Payload: ${vuln.payload}`);
        }
        console.log(`   Recommendation: ${vuln.recommendation}`);
      });
    }
  }
}

// CLI interface
async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  
  console.log(`🔒 Starting security audit for: ${baseUrl}`);
  
  const auditor = new SecurityAuditor({ baseUrl });
  
  try {
    const result = await auditor.runAudit();
    
    // Exit with error code if security issues found
    process.exit(result.passed ? 0 : 1);
    
  } catch (error) {
    console.error('Security audit failed:', error);
    process.exit(1);
  }
}

export { SecurityAuditor, SecurityTestConfig, SecurityAuditResult, SecurityVulnerability };

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}