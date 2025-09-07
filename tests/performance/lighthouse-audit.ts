/**
 * Lighthouse Performance Audit
 * 
 * Automated performance auditing using Lighthouse to measure Core Web Vitals
 * and other performance metrics in a CI/CD pipeline.
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

interface LighthouseOptions {
  port?: number;
  chromeFlags?: string[];
  logLevel?: 'info' | 'error' | 'warn';
  output?: string[];
  preset?: 'perf' | 'desktop';
}

interface AuditResult {
  url: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    totalBlockingTime: number;
    speedIndex: number;
    timeToFirstByte: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    savings: number;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
  }>;
  passed: boolean;
}

class LighthouseAuditor {
  private options: LighthouseOptions;
  private thresholds: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    lcp: number;
    fid: number;
    cls: number;
  };

  constructor(options: LighthouseOptions = {}) {
    this.options = {
      logLevel: 'info',
      output: ['json', 'html'],
      preset: 'perf',
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
      ...options
    };

    // Performance thresholds (scores are 0-100)
    this.thresholds = {
      performance: 90,
      accessibility: 90,
      bestPractices: 90,
      seo: 90,
      lcp: 2500, // milliseconds
      fid: 100,  // milliseconds
      cls: 0.1   // cumulative layout shift
    };
  }

  public async auditUrl(url: string, outputDir?: string): Promise<AuditResult> {
    console.log(`🔍 Starting Lighthouse audit for: ${url}`);
    
    const chrome = await chromeLauncher.launch({
      chromeFlags: this.options.chromeFlags
    });

    const lighthouseOptions = {
      logLevel: this.options.logLevel,
      output: this.options.output,
      port: chrome.port,
      preset: this.options.preset
    };

    try {
      const runnerResult = await lighthouse(url, lighthouseOptions);
      
      if (!runnerResult || !runnerResult.lhr) {
        throw new Error('Failed to run Lighthouse audit');
      }

      const lhr = runnerResult.lhr;
      
      // Extract core metrics
      const metrics = {
        firstContentfulPaint: this.getMetricValue(lhr, 'first-contentful-paint'),
        largestContentfulPaint: this.getMetricValue(lhr, 'largest-contentful-paint'),
        firstInputDelay: this.getMetricValue(lhr, 'max-potential-fid'),
        cumulativeLayoutShift: this.getMetricValue(lhr, 'cumulative-layout-shift'),
        totalBlockingTime: this.getMetricValue(lhr, 'total-blocking-time'),
        speedIndex: this.getMetricValue(lhr, 'speed-index'),
        timeToFirstByte: this.getMetricValue(lhr, 'server-response-time')
      };

      // Extract scores
      const scores = {
        performance: Math.round((lhr.categories.performance?.score || 0) * 100),
        accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((lhr.categories.seo?.score || 0) * 100),
        pwa: Math.round((lhr.categories.pwa?.score || 0) * 100)
      };

      // Extract optimization opportunities
      const opportunities = Object.values(lhr.audits)
        .filter(audit => audit.scoreDisplayMode === 'numeric' && audit.score !== null && audit.score < 1)
        .map(audit => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: Math.round((audit.score || 0) * 100),
          savings: this.extractSavings(audit)
        }))
        .sort((a, b) => b.savings - a.savings)
        .slice(0, 10); // Top 10 opportunities

      // Extract diagnostic information
      const diagnostics = Object.values(lhr.audits)
        .filter(audit => audit.scoreDisplayMode === 'informative' && audit.score !== null && audit.score < 1)
        .map(audit => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: Math.round((audit.score || 0) * 100)
        }))
        .slice(0, 5); // Top 5 diagnostics

      const result: AuditResult = {
        url,
        timestamp: new Date().toISOString(),
        scores,
        metrics,
        opportunities,
        diagnostics,
        passed: this.evaluateResults(scores, metrics)
      };

      // Save reports if output directory is specified
      if (outputDir) {
        await this.saveReports(runnerResult, result, outputDir);
      }

      await chrome.kill();
      return result;
      
    } catch (error) {
      await chrome.kill();
      throw error;
    }
  }

  private getMetricValue(lhr: any, metricId: string): number {
    const metric = lhr.audits[metricId];
    if (!metric || !metric.numericValue) return 0;
    
    // Convert some metrics to more readable units
    switch (metricId) {
      case 'server-response-time':
        return metric.numericValue; // Already in ms
      case 'cumulative-layout-shift':
        return Math.round(metric.numericValue * 1000) / 1000; // Round to 3 decimal places
      default:
        return Math.round(metric.numericValue);
    }
  }

  private extractSavings(audit: any): number {
    if (audit.details && audit.details.overallSavingsMs) {
      return audit.details.overallSavingsMs;
    }
    if (audit.details && audit.details.overallSavingsBytes) {
      return Math.round(audit.details.overallSavingsBytes / 1024); // Convert to KB
    }
    return 0;
  }

  private evaluateResults(scores: AuditResult['scores'], metrics: AuditResult['metrics']): boolean {
    return (
      scores.performance >= this.thresholds.performance &&
      scores.accessibility >= this.thresholds.accessibility &&
      scores.bestPractices >= this.thresholds.bestPractices &&
      scores.seo >= this.thresholds.seo &&
      metrics.largestContentfulPaint <= this.thresholds.lcp &&
      metrics.firstInputDelay <= this.thresholds.fid &&
      metrics.cumulativeLayoutShift <= this.thresholds.cls
    );
  }

  private async saveReports(runnerResult: any, result: AuditResult, outputDir: string): Promise<void> {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Save HTML report
      if (runnerResult.report && Array.isArray(runnerResult.report)) {
        const htmlReport = runnerResult.report.find((report: any) => typeof report === 'string' && report.includes('<!DOCTYPE html>'));
        if (htmlReport) {
          const htmlPath = path.join(outputDir, `lighthouse-report-${timestamp}.html`);
          fs.writeFileSync(htmlPath, htmlReport);
          console.log(`📄 HTML report saved: ${htmlPath}`);
        }
      }

      // Save JSON summary
      const jsonPath = path.join(outputDir, `lighthouse-summary-${timestamp}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
      console.log(`📊 JSON summary saved: ${jsonPath}`);

      // Save CSV for trend analysis
      const csvPath = path.join(outputDir, 'lighthouse-trends.csv');
      const csvRow = [
        result.timestamp,
        result.url,
        result.scores.performance,
        result.scores.accessibility,
        result.scores.bestPractices,
        result.scores.seo,
        result.metrics.firstContentfulPaint,
        result.metrics.largestContentfulPaint,
        result.metrics.firstInputDelay,
        result.metrics.cumulativeLayoutShift,
        result.metrics.totalBlockingTime,
        result.metrics.speedIndex,
        result.passed ? 'PASS' : 'FAIL'
      ].join(',');

      if (!fs.existsSync(csvPath)) {
        const csvHeader = [
          'timestamp',
          'url',
          'performance_score',
          'accessibility_score',
          'best_practices_score',
          'seo_score',
          'first_contentful_paint',
          'largest_contentful_paint',
          'first_input_delay',
          'cumulative_layout_shift',
          'total_blocking_time',
          'speed_index',
          'status'
        ].join(',');
        fs.writeFileSync(csvPath, csvHeader + '\n');
      }
      
      fs.appendFileSync(csvPath, csvRow + '\n');

    } catch (error) {
      console.warn('Failed to save reports:', error);
    }
  }

  public async auditMultipleUrls(urls: string[], outputDir?: string): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    
    for (const url of urls) {
      try {
        const result = await this.auditUrl(url, outputDir);
        results.push(result);
        
        // Brief pause between audits to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to audit ${url}:`, error);
        // Continue with other URLs
      }
    }
    
    return results;
  }

  public printSummary(results: AuditResult | AuditResult[]): void {
    const resultArray = Array.isArray(results) ? results : [results];
    
    console.log('\n🎯 LIGHTHOUSE AUDIT SUMMARY');
    console.log('=' .repeat(50));
    
    resultArray.forEach((result, index) => {
      if (resultArray.length > 1) {
        console.log(`\n📍 URL ${index + 1}: ${result.url}`);
      }
      
      console.log(`\n📊 Scores:`);
      console.log(`  Performance: ${result.scores.performance}/100 ${result.scores.performance >= this.thresholds.performance ? '✅' : '❌'}`);
      console.log(`  Accessibility: ${result.scores.accessibility}/100 ${result.scores.accessibility >= this.thresholds.accessibility ? '✅' : '❌'}`);
      console.log(`  Best Practices: ${result.scores.bestPractices}/100 ${result.scores.bestPractices >= this.thresholds.bestPractices ? '✅' : '❌'}`);
      console.log(`  SEO: ${result.scores.seo}/100 ${result.scores.seo >= this.thresholds.seo ? '✅' : '❌'}`);
      
      console.log(`\n⚡ Core Web Vitals:`);
      console.log(`  LCP: ${result.metrics.largestContentfulPaint}ms ${result.metrics.largestContentfulPaint <= this.thresholds.lcp ? '✅' : '❌'}`);
      console.log(`  FID: ${result.metrics.firstInputDelay}ms ${result.metrics.firstInputDelay <= this.thresholds.fid ? '✅' : '❌'}`);
      console.log(`  CLS: ${result.metrics.cumulativeLayoutShift} ${result.metrics.cumulativeLayoutShift <= this.thresholds.cls ? '✅' : '❌'}`);
      
      console.log(`\n🚀 Additional Metrics:`);
      console.log(`  FCP: ${result.metrics.firstContentfulPaint}ms`);
      console.log(`  TBT: ${result.metrics.totalBlockingTime}ms`);
      console.log(`  Speed Index: ${result.metrics.speedIndex}ms`);
      console.log(`  TTFB: ${result.metrics.timeToFirstByte}ms`);
      
      if (result.opportunities.length > 0) {
        console.log(`\n🔧 Top Optimization Opportunities:`);
        result.opportunities.slice(0, 3).forEach((opp, i) => {
          console.log(`  ${i + 1}. ${opp.title} (${opp.savings}ms potential savings)`);
        });
      }
      
      console.log(`\n${result.passed ? '✅ PASSED' : '❌ FAILED'} - Overall assessment`);
    });
    
    if (resultArray.length > 1) {
      const passCount = resultArray.filter(r => r.passed).length;
      console.log(`\n📈 Summary: ${passCount}/${resultArray.length} URLs passed the audit`);
    }
  }
}

// Predefined audit configurations
const auditConfigs = {
  ci: {
    chromeFlags: [
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-gpu'
    ]
  },
  
  mobile: {
    preset: 'perf' as const,
    chromeFlags: [
      '--headless',
      '--no-sandbox', 
      '--disable-dev-shm-usage'
    ]
  },
  
  desktop: {
    preset: 'desktop' as const,
    chromeFlags: [
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080'
    ]
  }
};

// CLI interface
async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  const configType = (process.argv[2] as keyof typeof auditConfigs) || 'mobile';
  const outputDir = process.argv[3] || './lighthouse-reports';
  
  const config = auditConfigs[configType];
  if (!config) {
    console.error('Invalid config type. Available: ci, mobile, desktop');
    process.exit(1);
  }
  
  // URLs to audit
  const urls = [
    baseUrl,
    `${baseUrl}/products`,
    `${baseUrl}/cart`,
    `${baseUrl}/checkout`
  ];
  
  console.log(`🚀 Running Lighthouse audit with ${configType} configuration`);
  console.log(`📁 Reports will be saved to: ${outputDir}`);
  
  const auditor = new LighthouseAuditor(config);
  
  try {
    const results = await auditor.auditMultipleUrls(urls, outputDir);
    auditor.printSummary(results);
    
    // Exit with appropriate code
    const allPassed = results.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('Lighthouse audit failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { LighthouseAuditor, AuditResult, LighthouseOptions };

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}