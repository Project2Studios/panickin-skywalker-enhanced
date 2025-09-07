import React from 'react';
import {
  Section,
  Row,
  Column,
  Text,
  Button,
} from '@react-email/components';
import { BaseEmailLayout } from './components/base-layout';

interface PaymentConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  paymentAmount: number;
  paymentMethod: string;
  lastFourDigits?: string;
  transactionId: string;
  paymentDate: string;
}

export const PaymentConfirmationEmail: React.FC<PaymentConfirmationEmailProps> = ({
  customerName,
  orderNumber,
  paymentAmount,
  paymentMethod,
  lastFourDigits,
  transactionId,
  paymentDate
}) => {
  const preview = `Payment of $${paymentAmount.toFixed(2)} confirmed for order ${orderNumber}! Your superhero gear is being prepared! 💳✨`;

  return (
    <BaseEmailLayout title="Payment Confirmed - Panickin' Skywalker" preview={preview}>
      {/* Hero Section */}
      <Section style={heroStyle}>
        <Text style={heroTitleStyle}>
          💳 Payment Successful! Don't Panic!
        </Text>
        <Text style={heroSubtitleStyle}>
          Hey {customerName}! Your payment has gone through smoothly - even our anxious payment system is celebrating! 🎉
        </Text>
      </Section>

      {/* Payment Details */}
      <Section style={paymentDetailsStyle}>
        <Text style={sectionTitleStyle}>Payment Confirmation</Text>
        
        <Row style={detailRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Order Number:</Text>
          </Column>
          <Column style={valueColumnStyle}>
            <Text style={valueStyle}>#{orderNumber}</Text>
          </Column>
        </Row>

        <Row style={detailRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Payment Amount:</Text>
          </Column>
          <Column style={valueColumnStyle}>
            <Text style={amountStyle}>${paymentAmount.toFixed(2)}</Text>
          </Column>
        </Row>

        <Row style={detailRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Payment Method:</Text>
          </Column>
          <Column style={valueColumnStyle}>
            <Text style={valueStyle}>
              {paymentMethod}{lastFourDigits && ` ending in ${lastFourDigits}`}
            </Text>
          </Column>
        </Row>

        <Row style={detailRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Transaction ID:</Text>
          </Column>
          <Column style={valueColumnStyle}>
            <Text style={transactionIdStyle}>{transactionId}</Text>
          </Column>
        </Row>

        <Row style={detailRowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>Payment Date:</Text>
          </Column>
          <Column style={valueColumnStyle}>
            <Text style={valueStyle}>
              {new Date(paymentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Status Update */}
      <Section style={statusStyle}>
        <Text style={statusTitleStyle}>🚀 What's Next?</Text>
        <Text style={statusTextStyle}>
          Your order is now being prepared by our superhero fulfillment team! Here's what happens next:
        </Text>
        <Text style={stepStyle}>
          ✅ <strong>Payment Confirmed</strong> - We've got your payment (thanks for trusting us!)
        </Text>
        <Text style={stepStyle}>
          📦 <strong>Order Processing</strong> - Our team is carefully packing your items
        </Text>
        <Text style={stepStyle}>
          🚚 <strong>Shipping Soon</strong> - You'll get a tracking number when it ships
        </Text>
        <Text style={stepStyle}>
          🎉 <strong>Delivery</strong> - Your superhero gear arrives at your door!
        </Text>
      </Section>

      {/* Action Buttons */}
      <Section style={actionsStyle}>
        <Button href={`${process.env.BASE_URL}/track/${orderNumber}`} style={primaryButtonStyle}>
          🔍 Track Your Order
        </Button>
        <Button href={`${process.env.BASE_URL}/account/orders/${orderNumber}`} style={secondaryButtonStyle}>
          📋 View Order Details
        </Button>
      </Section>

      {/* Security Note */}
      <Section style={securityStyle}>
        <Text style={securityTitleStyle}>🔐 Your Payment is Secure</Text>
        <Text style={securityTextStyle}>
          We use bank-level encryption to protect your payment information. Your card details are never stored on our servers - 
          we're anxious about security, which means we take extra precautions to keep you safe!
        </Text>
        <Text style={securitySubtextStyle}>
          Transaction processed securely through Stripe
        </Text>
      </Section>

      {/* Anxious Superhero Message */}
      <Section style={messageStyle}>
        <Text style={messageTitleStyle}>A Note from Your Anxious Heroes</Text>
        <Text style={messageTextStyle}>
          We know money stuff can be scary (we get anxious about it too!), but rest assured your payment 
          is safe and your order is in good hands. If you have any questions about this transaction, 
          our support team is here to help ease any worries.
        </Text>
        <Text style={messageSignatureStyle}>
          Gratefully yours (and slightly less anxious now),<br />
          <strong>The Panickin' Skywalker Team</strong> 🦸‍♂️💙
        </Text>
      </Section>

      {/* Support */}
      <Section style={supportStyle}>
        <Text style={supportTitleStyle}>Questions About Your Payment?</Text>
        <Text style={supportTextStyle}>
          📧 Email: <a href="mailto:billing@panickinskywalker.com" style={linkStyle}>billing@panickinskywalker.com</a>
        </Text>
        <Text style={supportTextStyle}>
          💬 Live Chat: Available on our website 24/7
        </Text>
        <Text style={supportTextStyle}>
          🌐 Help Center: <a href={`${process.env.BASE_URL}/help/payments`} style={linkStyle}>Payment FAQ</a>
        </Text>
      </Section>
    </BaseEmailLayout>
  );
};

// Styles
const heroStyle = {
  textAlign: 'center' as const,
  padding: '0 0 30px 0',
  borderBottom: '2px solid #10b981',
  marginBottom: '30px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  margin: '0 0 30px 0',
};

const heroTitleStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#047857',
  margin: '20px 0 15px 0',
  lineHeight: '1.2',
};

const heroSubtitleStyle = {
  fontSize: '18px',
  color: '#065f46',
  margin: '0 0 20px 0',
  lineHeight: '1.4',
};

const paymentDetailsStyle = {
  backgroundColor: '#f8fafc',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '30px',
  border: '2px solid #e2e8f0',
};

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 20px 0',
  borderBottom: '2px solid #3b82f6',
  paddingBottom: '5px',
};

const detailRowStyle = {
  marginBottom: '15px',
  paddingBottom: '10px',
  borderBottom: '1px solid #f1f5f9',
};

const labelColumnStyle = {
  width: '40%',
  verticalAlign: 'top',
};

const valueColumnStyle = {
  width: '60%',
  verticalAlign: 'top',
};

const labelStyle = {
  fontSize: '16px',
  color: '#64748b',
  margin: '0',
  fontWeight: '500',
};

const valueStyle = {
  fontSize: '16px',
  color: '#1e293b',
  margin: '0',
  fontWeight: '600',
};

const amountStyle = {
  fontSize: '20px',
  color: '#059669',
  margin: '0',
  fontWeight: 'bold',
};

const transactionIdStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  fontFamily: 'monospace',
  backgroundColor: '#f1f5f9',
  padding: '4px 8px',
  borderRadius: '4px',
  display: 'inline-block',
};

const statusStyle = {
  backgroundColor: '#fef3c7',
  padding: '25px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
  marginBottom: '30px',
};

const statusTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 15px 0',
};

const statusTextStyle = {
  fontSize: '16px',
  color: '#92400e',
  margin: '0 0 15px 0',
  lineHeight: '1.5',
};

const stepStyle = {
  fontSize: '15px',
  color: '#92400e',
  margin: '8px 0',
  lineHeight: '1.4',
};

const actionsStyle = {
  textAlign: 'center' as const,
  marginBottom: '40px',
};

const primaryButtonStyle = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '0 10px 10px 0',
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
  margin: '0 10px 10px 0',
  display: 'inline-block',
};

const securityStyle = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #0ea5e9',
  marginBottom: '30px',
};

const securityTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0c4a6e',
  margin: '0 0 10px 0',
};

const securityTextStyle = {
  fontSize: '14px',
  color: '#0c4a6e',
  lineHeight: '1.5',
  margin: '0 0 8px 0',
};

const securitySubtextStyle = {
  fontSize: '12px',
  color: '#0369a1',
  margin: '0',
  fontStyle: 'italic',
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

export default PaymentConfirmationEmail;