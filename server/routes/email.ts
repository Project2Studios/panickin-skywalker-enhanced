import { Router } from 'express';
import emailService from '../services/email';
import emailTemplateService from '../services/email-templates';
import { storage } from '../storage';
import type { Request, Response } from 'express';

const router = Router();

/**
 * Email tracking endpoint - tracks opens and clicks
 */
router.get('/track', async (req: Request, res: Response) => {
  try {
    const { type, recipient, data } = req.query;

    if (!type || !recipient) {
      return res.status(400).json({ error: 'Missing tracking parameters' });
    }

    const decodedRecipient = Buffer.from(recipient as string, 'base64').toString('utf8');
    
    console.log(`📧 Email ${type} tracked:`, {
      type,
      recipient: decodedRecipient,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });

    // Store tracking data in database (optional - implement if needed)
    // await storage.trackEmailEvent(type, decodedRecipient, data);

    if (type === 'open') {
      // Return 1x1 transparent pixel
      const pixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      );
      res.set('Content-Type', 'image/png');
      res.set('Content-Length', pixel.length.toString());
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(pixel);
    } else if (type === 'click' && data) {
      // Decode and redirect to original URL
      const decodedData = JSON.parse(Buffer.from(data as string, 'base64').toString('utf8'));
      if (decodedData.url) {
        res.redirect(302, decodedData.url);
      } else {
        res.status(400).json({ error: 'Invalid click tracking data' });
      }
    } else {
      res.json({ success: true, tracked: true });
    }
  } catch (error) {
    console.error('Error tracking email:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

/**
 * Test email system endpoint (admin only)
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    // In a real implementation, add admin authentication here
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Test endpoint disabled in production' });
    }

    console.log('🧪 Testing email system...');
    
    const testResult = await emailTemplateService.testEmailSystem();
    
    if (testResult) {
      res.json({ 
        success: true, 
        message: 'Email system test passed!',
        emailService: emailService.isReady(),
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Email system test failed',
        emailService: emailService.isReady(),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error testing email system:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Send manual order confirmation email (admin only)
 */
router.post('/send/order-confirmation', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.body;
    
    if (!orderNumber) {
      return res.status(400).json({ error: 'Order number is required' });
    }

    console.log(`📧 Manually sending order confirmation for ${orderNumber}...`);

    const orderData = await emailTemplateService.getOrderEmailData(orderNumber);
    
    if (!orderData) {
      return res.status(404).json({ error: 'Order not found or invalid' });
    }

    await emailTemplateService.sendOrderConfirmation(orderData);

    res.json({ 
      success: true, 
      message: `Order confirmation email sent to ${orderData.customerEmail}`,
      orderNumber,
      recipient: orderData.customerEmail
    });
  } catch (error) {
    console.error('Error sending manual order confirmation:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    });
  }
});

/**
 * Send shipping notification email (admin only)
 */
router.post('/send/shipping-notification', async (req: Request, res: Response) => {
  try {
    const { orderNumber, trackingNumber, carrier, estimatedDelivery } = req.body;
    
    if (!orderNumber || !trackingNumber || !carrier) {
      return res.status(400).json({ 
        error: 'Order number, tracking number, and carrier are required' 
      });
    }

    console.log(`📧 Sending shipping notification for ${orderNumber}...`);

    const orderData = await emailTemplateService.getOrderEmailData(orderNumber);
    
    if (!orderData) {
      return res.status(404).json({ error: 'Order not found or invalid' });
    }

    // Create tracking URL (you can customize this based on carrier)
    const trackingUrls = {
      'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'FedEx': `https://www.fedex.com/fedextrack/?tracknumber=${trackingNumber}`,
      'USPS': `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
      'DHL': `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`
    };

    const trackingUrl = trackingUrls[carrier as keyof typeof trackingUrls] || `${process.env.BASE_URL}/track/${orderNumber}`;

    const shippingData = {
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      orderNumber,
      trackingNumber,
      trackingUrl,
      carrier,
      estimatedDelivery: estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Default to 5 days
      shippingAddress: orderData.shippingAddress,
      shippedItems: orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      }))
    };

    await emailTemplateService.sendShippingNotification(shippingData);

    res.json({ 
      success: true, 
      message: `Shipping notification email sent to ${orderData.customerEmail}`,
      orderNumber,
      trackingNumber,
      recipient: orderData.customerEmail
    });
  } catch (error) {
    console.error('Error sending shipping notification:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    });
  }
});

/**
 * Send order status update email (admin only)
 */
router.post('/send/status-update', async (req: Request, res: Response) => {
  try {
    const { orderNumber, status, additionalInfo } = req.body;
    
    if (!orderNumber || !status) {
      return res.status(400).json({ 
        error: 'Order number and status are required' 
      });
    }

    console.log(`📧 Sending status update for ${orderNumber}: ${status}`);

    const orderData = await emailTemplateService.getOrderEmailData(orderNumber);
    
    if (!orderData) {
      return res.status(404).json({ error: 'Order not found or invalid' });
    }

    await emailTemplateService.sendOrderStatusUpdate(
      orderNumber, 
      status, 
      orderData.customerEmail,
      orderData.customerName,
      additionalInfo
    );

    res.json({ 
      success: true, 
      message: `Status update email sent to ${orderData.customerEmail}`,
      orderNumber,
      status,
      recipient: orderData.customerEmail
    });
  } catch (error) {
    console.error('Error sending status update:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    });
  }
});

/**
 * Get email service status (admin only)
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const isReady = emailService.isReady();
    const config = emailService.getConfig();
    const connectionTest = await emailService.testConnection();

    res.json({
      ready: isReady,
      connectionTest,
      provider: config?.provider || 'unknown',
      configured: {
        smtp: !!config?.smtp?.host,
        fromAddress: !!config?.fromAddress,
        adminEmail: !!config?.adminEmail
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking email status:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Status check failed' 
    });
  }
});

/**
 * Unsubscribe endpoint for email compliance
 */
router.get('/unsubscribe', (req: Request, res: Response) => {
  // In a real implementation, you'd handle unsubscribe logic here
  // For now, just show a simple page
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Unsubscribe - Panickin' Skywalker</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .header { text-align: center; background: #1e293b; color: white; padding: 30px; border-radius: 8px; }
        .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .anxious-note { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🦸‍♂️ Don't Leave Us!</h1>
        <p>Unsubscribe from Panickin' Skywalker emails</p>
      </div>
      
      <div class="content">
        <h2>We're Sorry to See You Go!</h2>
        <p>We understand - sometimes even superheroes need a break from emails. If you're sure you want to unsubscribe from our emails, we respect that decision.</p>
        
        <div class="anxious-note">
          <p><strong>But wait!</strong> We're a bit anxious about this... Are you sure? We promise to only send you the good stuff:</p>
          <ul>
            <li>🎵 New music releases and tour dates</li>
            <li>🛍️ Exclusive merch drops and fan club perks</li>
            <li>📦 Order confirmations and shipping updates</li>
            <li>🎉 Special events and behind-the-scenes content</li>
          </ul>
        </div>
        
        <p>If you're having trouble with our emails or want to change your preferences instead of unsubscribing completely, please contact our support team at <a href="mailto:support@panickinskywalker.com">support@panickinskywalker.com</a>.</p>
        
        <p style="text-align: center; margin-top: 30px;">
          <strong>Still want to unsubscribe?</strong><br>
          We'll implement the full unsubscribe functionality soon. For now, please email us at 
          <a href="mailto:unsubscribe@panickinskywalker.com">unsubscribe@panickinskywalker.com</a>.
        </p>
      </div>
      
      <div style="text-align: center; color: #64748b; font-size: 14px;">
        <p>Thanks for being part of the Panickin' Skywalker community!</p>
        <p>🦸‍♂️ The Anxious Superhero Team</p>
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

export default router;