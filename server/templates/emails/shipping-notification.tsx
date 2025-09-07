import React from 'react';
import {
  Section,
  Row,
  Column,
  Text,
  Button,
  Img,
} from '@react-email/components';
import { BaseEmailLayout } from './components/base-layout';

interface ShippingNotificationEmailProps {
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl?: string;
  carrier: string;
  estimatedDelivery: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippedItems?: Array<{
    name: string;
    quantity: number;
    imageUrl?: string;
  }>;
}

export const ShippingNotificationEmail: React.FC<ShippingNotificationEmailProps> = ({
  customerName,
  orderNumber,
  trackingNumber,
  trackingUrl,
  carrier,
  estimatedDelivery,
  shippingAddress,
  shippedItems = []
}) => {
  const preview = `Your order ${orderNumber} has shipped! Track your superhero gear on its way to you! 📦✈️`;

  return (
    <BaseEmailLayout title="Order Shipped - Panickin' Skywalker" preview={preview}>
      {/* Hero Section */}
      <Section style={heroStyle}>
        <Text style={heroIconStyle}>🚚</Text>
        <Text style={heroTitleStyle}>
          Your Order Has Shipped!
        </Text>
        <Text style={heroSubtitleStyle}>
          Don't panic, {customerName}! Your superhero gear is now flying through the air (well, in a truck) on its way to you!
        </Text>
      </Section>

      {/* Tracking Information */}
      <Section style={trackingStyle}>
        <Text style={sectionTitleStyle}>📦 Tracking Information</Text>
        
        <Row style={trackingRowStyle}>
          <Column>
            <Text style={trackingLabelStyle}>Order Number:</Text>
            <Text style={trackingValueStyle}>#{orderNumber}</Text>
          </Column>
        </Row>

        <Row style={trackingRowStyle}>
          <Column>
            <Text style={trackingLabelStyle}>Tracking Number:</Text>
            <Text style={trackingNumberStyle}>{trackingNumber}</Text>
          </Column>
        </Row>

        <Row style={trackingRowStyle}>
          <Column>
            <Text style={trackingLabelStyle}>Carrier:</Text>
            <Text style={trackingValueStyle}>{carrier}</Text>
          </Column>
        </Row>

        <Row style={trackingRowStyle}>
          <Column>
            <Text style={trackingLabelStyle}>Estimated Delivery:</Text>
            <Text style={deliveryDateStyle}>
              {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </Column>
        </Row>

        {trackingUrl && (
          <Section style={trackingButtonStyle}>
            <Button href={trackingUrl} style={primaryButtonStyle}>
              🔍 Track Your Package
            </Button>
          </Section>
        )}
      </Section>

      {/* Shipping Address */}
      <Section style={addressSectionStyle}>
        <Text style={sectionTitleStyle}>📍 Shipping To</Text>
        <Text style={addressStyle}>
          {shippingAddress.name}<br />
          {shippingAddress.line1}<br />
          {shippingAddress.line2 && `${shippingAddress.line2}<br />`}
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
          {shippingAddress.country}
        </Text>
      </Section>

      {/* Shipped Items */}
      {shippedItems.length > 0 && (
        <Section style={itemsSectionStyle}>
          <Text style={sectionTitleStyle}>📦 Items on the Way</Text>
          {shippedItems.map((item, index) => (
            <Row key={index} style={itemRowStyle}>
              <Column style={itemImageColumnStyle}>
                {item.imageUrl && (
                  <Img
                    src={item.imageUrl}
                    alt={item.name}
                    width={60}
                    height={60}
                    style={itemImageStyle}
                  />
                )}
              </Column>
              <Column style={itemDetailsColumnStyle}>
                <Text style={itemNameStyle}>{item.name}</Text>
                <Text style={itemQuantityStyle}>Quantity: {item.quantity}</Text>
              </Column>
            </Row>
          ))}
        </Section>
      )}

      {/* Delivery Tips */}
      <Section style={tipsStyle}>
        <Text style={tipsTitleStyle}>📋 Delivery Tips from Your Anxious Heroes</Text>
        <Text style={tipStyle}>
          🏠 <strong>Be Home if Possible:</strong> Packages get nervous when no one's around to receive them (we relate!)
        </Text>
        <Text style={tipStyle}>
          📱 <strong>Keep Tracking:</strong> Check your tracking number regularly - it helps calm our collective anxiety
        </Text>
        <Text style={tipStyle}>
          🔒 <strong>Secure Location:</strong> If you're not home, make sure there's a safe place for delivery
        </Text>
        <Text style={tipStyle}>
          📞 <strong>Contact Carrier:</strong> Having issues? Contact {carrier} directly with your tracking number
        </Text>
      </Section>

      {/* Action Buttons */}
      <Section style={actionsStyle}>
        {trackingUrl && (
          <Button href={trackingUrl} style={primaryButtonStyle}>
            📍 Track Package
          </Button>
        )}
        <Button href={`${process.env.BASE_URL}/account/orders/${orderNumber}`} style={secondaryButtonStyle}>
          📋 View Order Details
        </Button>
        <Button href={`${process.env.BASE_URL}/help/shipping`} style={tertiaryButtonStyle}>
          ❓ Shipping Help
        </Button>
      </Section>

      {/* Status Timeline */}
      <Section style={timelineStyle}>
        <Text style={timelineTitleStyle}>📈 Your Order Journey</Text>
        <Text style={timelineStepCompletedStyle}>
          ✅ Order Placed & Confirmed
        </Text>
        <Text style={timelineStepCompletedStyle}>
          ✅ Payment Processed
        </Text>
        <Text style={timelineStepCompletedStyle}>
          ✅ Items Packed with Care
        </Text>
        <Text style={timelineStepCurrentStyle}>
          🚚 <strong>In Transit</strong> - Your package is on the move!
        </Text>
        <Text style={timelineStepPendingStyle}>
          📦 Out for Delivery
        </Text>
        <Text style={timelineStepPendingStyle}>
          🎉 Delivered to Your Door
        </Text>
      </Section>

      {/* Problems Section */}
      <Section style={problemsStyle}>
        <Text style={problemsTitleStyle}>😰 Package Problems? Don't Panic!</Text>
        <Text style={problemsTextStyle}>
          Sometimes packages get as anxious as we do and take unexpected detours. If your package seems lost, 
          delayed, or arrives damaged, we're here to help! Our support team understands shipping anxiety and 
          will work with you to make things right.
        </Text>
        <Section style={problemsActionsStyle}>
          <Button href="mailto:shipping@panickinskywalker.com" style={supportButtonStyle}>
            📧 Contact Shipping Support
          </Button>
        </Section>
      </Section>

      {/* Excited Message */}
      <Section style={messageStyle}>
        <Text style={messageTitleStyle}>We're Excited (and a Little Nervous)!</Text>
        <Text style={messageTextStyle}>
          Your superhero gear is now making its way to you! We packed everything with extra care 
          (our anxiety actually helps with attention to detail). We hope you love your new merch as 
          much as we loved creating it for you!
        </Text>
        <Text style={messageTextStyle}>
          Don't forget to share photos of your new gear on social media and tag us - 
          it really helps calm our nerves when we see happy customers! 📸
        </Text>
        <Text style={messageSignatureStyle}>
          Nervously excited,<br />
          <strong>The Panickin' Skywalker Team</strong> 🦸‍♂️💙
        </Text>
      </Section>

      {/* Support */}
      <Section style={supportStyle}>
        <Text style={supportTitleStyle}>Questions About Your Shipment?</Text>
        <Text style={supportTextStyle}>
          📧 <a href="mailto:shipping@panickinskywalker.com" style={linkStyle}>shipping@panickinskywalker.com</a>
        </Text>
        <Text style={supportTextStyle}>
          🌐 <a href={`${process.env.BASE_URL}/help/shipping`} style={linkStyle}>Shipping FAQ</a>
        </Text>
        <Text style={supportTextStyle}>
          📱 Text Support: Available for urgent shipping questions
        </Text>
      </Section>
    </BaseEmailLayout>
  );
};

// Styles
const heroStyle = {
  textAlign: 'center' as const,
  padding: '30px 0',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  marginBottom: '30px',
  border: '2px solid #10b981',
};

const heroIconStyle = {
  fontSize: '48px',
  margin: '0 0 15px 0',
  display: 'block',
};

const heroTitleStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#047857',
  margin: '0 0 15px 0',
  lineHeight: '1.2',
};

const heroSubtitleStyle = {
  fontSize: '18px',
  color: '#065f46',
  margin: '0',
  lineHeight: '1.4',
  padding: '0 20px',
};

const trackingStyle = {
  backgroundColor: '#f8fafc',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '30px',
  border: '1px solid #e2e8f0',
};

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 20px 0',
  borderBottom: '2px solid #3b82f6',
  paddingBottom: '5px',
};

const trackingRowStyle = {
  marginBottom: '15px',
};

const trackingLabelStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 5px 0',
  fontWeight: '500',
};

const trackingValueStyle = {
  fontSize: '16px',
  color: '#1e293b',
  margin: '0',
  fontWeight: '600',
};

const trackingNumberStyle = {
  fontSize: '18px',
  color: '#1e293b',
  margin: '0',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  backgroundColor: '#f1f5f9',
  padding: '8px 12px',
  borderRadius: '6px',
  display: 'inline-block',
  border: '1px solid #e2e8f0',
};

const deliveryDateStyle = {
  fontSize: '18px',
  color: '#059669',
  margin: '0',
  fontWeight: 'bold',
};

const trackingButtonStyle = {
  textAlign: 'center' as const,
  marginTop: '20px',
};

const addressSectionStyle = {
  marginBottom: '30px',
};

const addressStyle = {
  fontSize: '16px',
  color: '#475569',
  lineHeight: '1.5',
  margin: '0',
  backgroundColor: '#f8fafc',
  padding: '15px',
  borderRadius: '6px',
  borderLeft: '4px solid #3b82f6',
};

const itemsSectionStyle = {
  marginBottom: '30px',
};

const itemRowStyle = {
  marginBottom: '15px',
  paddingBottom: '15px',
  borderBottom: '1px solid #f1f5f9',
};

const itemImageColumnStyle = {
  width: '80px',
  verticalAlign: 'top',
  paddingRight: '15px',
};

const itemImageStyle = {
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
};

const itemDetailsColumnStyle = {
  verticalAlign: 'top',
};

const itemNameStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 5px 0',
};

const itemQuantityStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
};

const tipsStyle = {
  backgroundColor: '#fef3c7',
  padding: '25px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
  marginBottom: '30px',
};

const tipsTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 15px 0',
};

const tipStyle = {
  fontSize: '15px',
  color: '#92400e',
  margin: '10px 0',
  lineHeight: '1.4',
};

const actionsStyle = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const primaryButtonStyle = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '5px',
  display: 'inline-block',
};

const secondaryButtonStyle = {
  backgroundColor: '#059669',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '5px',
  display: 'inline-block',
};

const tertiaryButtonStyle = {
  backgroundColor: '#64748b',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '5px',
  display: 'inline-block',
};

const timelineStyle = {
  backgroundColor: '#f0f9ff',
  padding: '25px',
  borderRadius: '8px',
  borderLeft: '4px solid #0ea5e9',
  marginBottom: '30px',
};

const timelineTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0c4a6e',
  margin: '0 0 15px 0',
};

const timelineStepCompletedStyle = {
  fontSize: '15px',
  color: '#059669',
  margin: '8px 0',
  fontWeight: '500',
};

const timelineStepCurrentStyle = {
  fontSize: '16px',
  color: '#0ea5e9',
  margin: '8px 0',
  fontWeight: 'bold',
  backgroundColor: '#e0f2fe',
  padding: '8px 12px',
  borderRadius: '6px',
  display: 'inline-block',
};

const timelineStepPendingStyle = {
  fontSize: '15px',
  color: '#64748b',
  margin: '8px 0',
};

const problemsStyle = {
  backgroundColor: '#fef2f2',
  padding: '25px',
  borderRadius: '8px',
  borderLeft: '4px solid #ef4444',
  marginBottom: '30px',
};

const problemsTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#991b1b',
  margin: '0 0 15px 0',
};

const problemsTextStyle = {
  fontSize: '16px',
  color: '#991b1b',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const problemsActionsStyle = {
  textAlign: 'center' as const,
};

const supportButtonStyle = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
};

const messageStyle = {
  backgroundColor: '#fef3c7',
  padding: '25px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
  marginBottom: '30px',
};

const messageTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 15px 0',
};

const messageTextStyle = {
  fontSize: '16px',
  color: '#92400e',
  lineHeight: '1.6',
  margin: '0 0 15px 0',
};

const messageSignatureStyle = {
  fontSize: '16px',
  color: '#92400e',
  margin: '0',
};

const supportStyle = {
  textAlign: 'center' as const,
  backgroundColor: '#f1f5f9',
  padding: '20px',
  borderRadius: '8px',
};

const supportTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 12px 0',
};

const supportTextStyle = {
  fontSize: '14px',
  color: '#475569',
  margin: '5px 0',
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'none',
};

export default ShippingNotificationEmail;