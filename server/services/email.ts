import * as nodemailer from 'nodemailer';
import { Transporter, SendMailOptions } from 'nodemailer';
import { render } from '@react-email/render';
import * as React from 'react';

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
  fromAddress: string;
  replyTo: string;
  adminEmail: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  template?: {
    component: React.ComponentType<any>;
    props: any;
  };
  tracking?: {
    openTracking?: boolean;
    clickTracking?: boolean;
    unsubscribeTracking?: boolean;
  };
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryTime?: number;
  provider: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.config = this.loadConfig();
    this.setupTransporter();
  }

  private loadConfig(): EmailConfig {
    return {
      provider: (process.env.EMAIL_PROVIDER as 'smtp' | 'sendgrid' | 'mailgun') || 'smtp',
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASSWORD || ''
        }
      },
      from: process.env.EMAIL_FROM || "Panickin' Skywalker Store <store@panickinskywalker.com>",
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'store@panickinskywalker.com',
      replyTo: process.env.EMAIL_REPLY_TO || 'support@panickinskywalker.com',
      adminEmail: process.env.ADMIN_EMAIL || 'admin@panickinskywalker.com'
    };
  }

  private async setupTransporter(): Promise<void> {
    try {
      if (this.config?.provider === 'smtp') {
        // For development, create test account if no SMTP credentials provided
        if (!this.config.smtp?.auth.user && process.env.NODE_ENV === 'development') {
          console.log('📧 Creating test email account for development...');
          const testAccount = await nodemailer.createTestAccount();
          
          if (this.config) {
            this.config.smtp = {
              host: 'smtp.ethereal.email',
              port: 587,
              secure: false,
              auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
          };
          
          console.log('📧 Test email account created:');
          console.log(`   User: ${testAccount.user}`);
          console.log(`   Pass: ${testAccount.pass}`);
          console.log('   View emails at: https://ethereal.email');
          }
        }

        if (this.config?.smtp) {
          this.transporter = nodemailer.createTransport({
            host: this.config.smtp.host,
            port: this.config.smtp.port,
            secure: this.config.smtp.secure,
            auth: {
              user: this.config.smtp.auth.user,
              pass: this.config.smtp.auth.pass
            }
          });
          
          // Verify connection
          if (this.transporter) {
            await this.transporter.verify();
            this.isConfigured = true;
          }
        }
        console.log('📧 Email service configured successfully');
        
      } else {
        console.warn('📧 Non-SMTP email providers not yet implemented');
        this.isConfigured = false;
      }
    } catch (error) {
      // Silently fail in development if email service can't be configured
      if (process.env.NODE_ENV === 'development') {
        console.warn('📧 Email service disabled (development mode) - emails will not be sent');
        this.isConfigured = false;
      } else {
        console.error('📧 Email service configuration failed:', error);
        this.isConfigured = false;
      }
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailDeliveryResult> {
    const startTime = Date.now();
    
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'Email service not configured',
        provider: this.config?.provider || 'unknown',
        deliveryTime: Date.now() - startTime
      };
    }

    try {
      let html = options.html;
      let text = options.text;

      // Render React email template if provided
      if (options.template) {
        const { component: Component, props } = options.template;
        html = await render(React.createElement(Component, props));
        text = text || await render(React.createElement(Component, props), { plainText: true });
      }

      // Add tracking pixels and links if enabled
      if (options.tracking?.openTracking) {
        html = this.addOpenTracking(html || '', options.to.toString());
      }

      if (options.tracking?.clickTracking) {
        html = this.addClickTracking(html || '');
      }

      // Prepare mail options
      const mailOptions: SendMailOptions = {
        from: this.config?.from || 'noreply@panickinskywalker.com',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        text,
        cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
        bcc: Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc,
        replyTo: this.config?.replyTo || 'noreply@panickinskywalker.com',
        attachments: options.attachments
      };

      // Send email
      if (!this.transporter) {
        throw new Error('Email transporter not configured');
      }
      const result = await this.transporter.sendMail(mailOptions);
      const deliveryTime = Date.now() - startTime;

      console.log(`📧 Email sent successfully to ${options.to} (${deliveryTime}ms)`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Message ID: ${result.messageId}`);
      
      // Log preview URL for development
      if (process.env.NODE_ENV === 'development' && result.messageId) {
        const previewUrl = nodemailer.getTestMessageUrl(result);
        if (previewUrl) {
          console.log(`   Preview: ${previewUrl}`);
        }
      }

      return {
        success: true,
        messageId: result.messageId,
        provider: this.config?.provider || 'unknown',
        deliveryTime
      };

    } catch (error) {
      const deliveryTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
      
      console.error('📧 Email sending failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        provider: this.config?.provider || 'unknown',
        deliveryTime
      };
    }
  }

  // Email tracking helpers
  private addOpenTracking(html: string, recipient: string): string {
    const trackingPixel = `<img src=\"${this.getTrackingUrl('open', recipient)}\" width=\"1\" height=\"1\" style=\"display:none;\" alt=\"\" />`;
    return html.replace('</body>', `${trackingPixel}</body>`);
  }

  private addClickTracking(html: string): string {
    // Simple click tracking - replace all links with tracked versions
    return html.replace(/href=\"([^\"]+)\"/g, (match, url) => {
      const trackedUrl = this.getTrackingUrl('click', '', { url });
      return `href=\"${trackedUrl}\"`;
    });
  }

  private getTrackingUrl(type: 'open' | 'click', recipient: string, data?: any): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const params = new URLSearchParams({
      type,
      recipient: Buffer.from(recipient).toString('base64'),
      data: data ? Buffer.from(JSON.stringify(data)).toString('base64') : ''
    });
    return `${baseUrl}/api/email/track?${params}`;
  }

  // Template helpers
  async renderTemplate(component: React.ComponentType<any>, props: any): Promise<{ html: string; text: string }> {
    const html = await render(React.createElement(component, props));
    const text = await render(React.createElement(component, props), { plainText: true });
    return { html, text };
  }

  // Bulk email helpers
  async sendBulkEmails(emails: EmailOptions[]): Promise<EmailDeliveryResult[]> {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email))
    );

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { success: false, error: result.reason?.message || 'Bulk email failed', provider: this.config?.provider || 'unknown' }
    );
  }

  // Configuration helpers
  getConfig(): EmailConfig | null {
    return this.config ? { ...this.config } : null;
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) return false;
    
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('📧 Email connection test failed:', error);
      return false;
    }
  }

  // Admin helpers
  async sendAdminNotification(subject: string, html: string, priority: 'low' | 'normal' | 'high' = 'normal'): Promise<EmailDeliveryResult> {
    const priorityPrefix = priority === 'high' ? '[URGENT] ' : priority === 'low' ? '[INFO] ' : '';
    
    return this.sendEmail({
      to: this.config?.adminEmail || 'admin@panickinskywalker.com',
      subject: `${priorityPrefix}${subject}`,
      html,
      tracking: {
        openTracking: false,
        clickTracking: false
      }
    });
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;