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

interface OrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  variantName?: string;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  orderNumber,
  orderDate,
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  trackingUrl,
  estimatedDelivery
}) => {
  const preview = `Order ${orderNumber} confirmed! Don't panic - your superhero merch is on the way! 🦸‍♂️`;

  return (
    <BaseEmailLayout title="Order Confirmation - Panickin' Skywalker" preview={preview}>
      {/* Hero Section */}
      <Section style={heroStyle}>
        <Text style={heroTitleStyle}>
          🦸‍♂️ Don't Panic! Your Order is Confirmed!
        </Text>
        <Text style={heroSubtitleStyle}>
          Hey {customerName}! Your superhero gear is being prepared by our anxious but efficient team.
        </Text>
      </Section>

      {/* Order Summary */}
      <Section style={orderSummaryStyle}>
        <Row>
          <Column style={summaryColumnStyle}>
            <Text style={sectionTitleStyle}>Order Details</Text>
            <Text style={orderInfoStyle}>
              <strong>Order #{orderNumber}</strong><br />
              Placed on {new Date(orderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </Column>
          <Column style={summaryColumnStyle}>
            <Text style={sectionTitleStyle}>Estimated Delivery</Text>
            <Text style={deliveryInfoStyle}>
              {estimatedDelivery ? 
                new Date(estimatedDelivery).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 
                '5-7 business days'
              }
            </Text>
            <Text style={deliveryNoteStyle}>
              Even our delivery is a bit anxious but always reliable! 📦
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Order Items */}
      <Section style={itemsSectionStyle}>
        <Text style={sectionTitleStyle}>Your Superhero Gear</Text>
        
        {items.map((item, index) => (
          <Row key={item.id || index} style={itemRowStyle}>
            <Column style={itemImageColumnStyle}>
              {item.imageUrl && (
                <Img
                  src={item.imageUrl}
                  alt={item.name}
                  width={80}
                  height={80}
                  style={itemImageStyle}
                />
              )}
            </Column>
            <Column style={itemDetailsColumnStyle}>
              <Text style={itemNameStyle}>{item.name}</Text>
              {item.variantName && (
                <Text style={itemVariantStyle}>{item.variantName}</Text>
              )}
              {item.description && (
                <Text style={itemDescriptionStyle}>{item.description}</Text>
              )}
              <Text style={itemQuantityStyle}>Qty: {item.quantity}</Text>
            </Column>
            <Column style={itemPriceColumnStyle}>
              <Text style={itemPriceStyle}>
                ${item.totalPrice.toFixed(2)}
              </Text>
              <Text style={itemUnitPriceStyle}>
                ${item.unitPrice.toFixed(2)} each
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Order Totals */}
      <Section style={totalsStyle}>
        <Row style={totalRowStyle}>
          <Column style={totalLabelColumnStyle}>
            <Text style={totalLabelStyle}>Subtotal:</Text>
          </Column>
          <Column style={totalValueColumnStyle}>
            <Text style={totalValueStyle}>${subtotal.toFixed(2)}</Text>
          </Column>
        </Row>
        <Row style={totalRowStyle}>
          <Column style={totalLabelColumnStyle}>
            <Text style={totalLabelStyle}>Shipping:</Text>
          </Column>
          <Column style={totalValueColumnStyle}>
            <Text style={totalValueStyle}>
              {shipping === 0 ? 'Free!' : `$${shipping.toFixed(2)}`}
            </Text>
          </Column>
        </Row>
        <Row style={totalRowStyle}>
          <Column style={totalLabelColumnStyle}>
            <Text style={totalLabelStyle}>Tax:</Text>
          </Column>
          <Column style={totalValueColumnStyle}>
            <Text style={totalValueStyle}>${tax.toFixed(2)}</Text>
          </Column>
        </Row>
        <Row style={grandTotalRowStyle}>
          <Column style={totalLabelColumnStyle}>
            <Text style={grandTotalLabelStyle}>Total:</Text>
          </Column>
          <Column style={totalValueColumnStyle}>
            <Text style={grandTotalValueStyle}>${total.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Shipping Address */}
      <Section style={shippingStyle}>
        <Text style={sectionTitleStyle}>Shipping To</Text>
        <Text style={addressStyle}>
          {shippingAddress.name}<br />
          {shippingAddress.line1}<br />
          {shippingAddress.line2 && `${shippingAddress.line2}<br />`}
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
          {shippingAddress.country}
        </Text>
      </Section>

      {/* Action Buttons */}
      <Section style={actionsStyle}>
        {trackingUrl && (
          <Button href={trackingUrl} style={primaryButtonStyle}>
            🚚 Track Your Order
          </Button>
        )}
        <Button href={`${process.env.BASE_URL}/account/orders`} style={secondaryButtonStyle}>
          📋 View Order History
        </Button>
      </Section>

      {/* Anxious Superhero Message */}
      <Section style={messageStyle}>
        <Text style={messageTitleStyle}>A Message from Your Anxious Superheroes</Text>
        <Text style={messageTextStyle}>
          Thanks for supporting Panickin' Skywalker! We're a bit nervous about getting your order perfect, 
          but that just means we care extra much. If you have any questions or concerns (we understand anxiety!), 
          don't hesitate to reach out to our support team. We're here to help!
        </Text>
        <Text style={messageSignatureStyle}>
          Rock on (nervously),<br />
          <strong>The Panickin' Skywalker Team</strong> 🦸‍♂️🎸
        </Text>
      </Section>

      {/* Support Information */}
      <Section style={supportStyle}>
        <Text style={supportTitleStyle}>Need Help? Don't Panic!</Text>
        <Text style={supportTextStyle}>
          📧 Email us at{' '}
          <a href="mailto:support@panickinskywalker.com" style={linkStyle}>
            support@panickinskywalker.com
          </a>
        </Text>
        <Text style={supportTextStyle}>
          🌐 Visit our help center at{' '}
          <a href={`${process.env.BASE_URL}/help`} style={linkStyle}>
            panickinskywalker.com/help
          </a>
        </Text>
      </Section>
    </BaseEmailLayout>
  );
};

// Styles
const heroStyle = {
  textAlign: 'center' as const,
  padding: '0 0 30px 0',
  borderBottom: '2px solid #e2e8f0',
  marginBottom: '30px',
};

const heroTitleStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 15px 0',
  lineHeight: '1.2',
};

const heroSubtitleStyle = {
  fontSize: '18px',
  color: '#64748b',
  margin: '0',
  lineHeight: '1.4',
};

const orderSummaryStyle = {
  marginBottom: '30px',
};

const summaryColumnStyle = {
  width: '50%',
  paddingRight: '15px',
};

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 15px 0',
  borderBottom: '2px solid #3b82f6',
  paddingBottom: '5px',
};

const orderInfoStyle = {
  fontSize: '16px',
  color: '#475569',
  margin: '0',
  lineHeight: '1.5',
};

const deliveryInfoStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#059669',
  margin: '0 0 8px 0',
};

const deliveryNoteStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  fontStyle: 'italic',
};

const itemsSectionStyle = {
  marginBottom: '30px',
};

const itemRowStyle = {
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '20px',
  marginBottom: '20px',
};

const itemImageColumnStyle = {
  width: '100px',
  verticalAlign: 'top',
  paddingRight: '15px',
};

const itemImageStyle = {
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const itemDetailsColumnStyle = {
  verticalAlign: 'top',
  paddingRight: '15px',
};

const itemNameStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 5px 0',
};

const itemVariantStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 5px 0',
};

const itemDescriptionStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
};

const itemQuantityStyle = {
  fontSize: '14px',
  color: '#475569',
  margin: '0',
};

const itemPriceColumnStyle = {
  width: '120px',
  textAlign: 'right' as const,
  verticalAlign: 'top',
};

const itemPriceStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 5px 0',
};

const itemUnitPriceStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
};

const totalsStyle = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '30px',
};

const totalRowStyle = {
  marginBottom: '8px',
};

const totalLabelColumnStyle = {
  width: '70%',
};

const totalValueColumnStyle = {
  width: '30%',
  textAlign: 'right' as const,
};

const totalLabelStyle = {
  fontSize: '16px',
  color: '#475569',
  margin: '0',
};

const totalValueStyle = {
  fontSize: '16px',
  color: '#475569',
  margin: '0',
};

const grandTotalRowStyle = {
  borderTop: '2px solid #e2e8f0',
  paddingTop: '10px',
  marginTop: '10px',
};

const grandTotalLabelStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0',
};

const grandTotalValueStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0',
};

const shippingStyle = {
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
  backgroundColor: '#64748b',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '0 10px 10px 0',
  display: 'inline-block',
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
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 15px 0',
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

export default OrderConfirmationEmail;