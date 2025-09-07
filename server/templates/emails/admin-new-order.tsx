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

interface AdminNewOrderEmailProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  orderTotal: number;
  itemCount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    variantName?: string;
  }>;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  priority: 'normal' | 'high' | 'express';
  specialInstructions?: string;
}

export const AdminNewOrderEmail: React.FC<AdminNewOrderEmailProps> = ({
  orderNumber,
  orderDate,
  customerName,
  customerEmail,
  orderTotal,
  itemCount,
  items,
  shippingAddress,
  paymentMethod,
  priority,
  specialInstructions
}) => {
  const preview = `New order ${orderNumber} from ${customerName} - $${orderTotal.toFixed(2)} (${itemCount} items)`;
  const isPriority = priority === 'high' || priority === 'express';

  return (
    <BaseEmailLayout title={`[ADMIN] New Order ${orderNumber}`} preview={preview}>
      {/* Header Alert */}
      <Section style={isPriority ? alertHeaderStyle : normalHeaderStyle}>
        <Text style={alertIconStyle}>
          {isPriority ? '🚨' : '📦'}
        </Text>
        <Text style={alertTitleStyle}>
          {isPriority ? 'PRIORITY ORDER RECEIVED!' : 'New Order Received'}
        </Text>
        <Text style={alertSubtitleStyle}>
          Order #{orderNumber} needs your attention
        </Text>
      </Section>

      {/* Quick Actions */}
      <Section style={quickActionsStyle}>
        <Button href={`${process.env.BASE_URL}/admin/orders/${orderNumber}`} style={primaryActionStyle}>
          📋 View Order Details
        </Button>
        <Button href={`${process.env.BASE_URL}/admin/orders/${orderNumber}/fulfill`} style={fulfillActionStyle}>
          📦 Start Fulfillment
        </Button>
        {isPriority && (
          <Button href={`${process.env.BASE_URL}/admin/orders/${orderNumber}/priority`} style={priorityActionStyle}>
            ⚡ Priority Processing
          </Button>
        )}
      </Section>

      {/* Order Summary */}
      <Section style={orderSummaryStyle}>
        <Text style={sectionTitleStyle}>📊 Order Summary</Text>
        
        <Row style={summaryGridStyle}>
          <Column style={summaryColStyle}>
            <Text style={summaryLabelStyle}>Order Number:</Text>
            <Text style={summaryValueStyle}>#{orderNumber}</Text>
          </Column>
          <Column style={summaryColStyle}>
            <Text style={summaryLabelStyle}>Total Amount:</Text>
            <Text style={summaryAmountStyle}>${orderTotal.toFixed(2)}</Text>
          </Column>
        </Row>

        <Row style={summaryGridStyle}>
          <Column style={summaryColStyle}>
            <Text style={summaryLabelStyle}>Items:</Text>
            <Text style={summaryValueStyle}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
          </Column>
          <Column style={summaryColStyle}>
            <Text style={summaryLabelStyle}>Order Date:</Text>
            <Text style={summaryValueStyle}>
              {new Date(orderDate).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Column>
        </Row>

        <Row style={summaryGridStyle}>
          <Column style={summaryColStyle}>
            <Text style={summaryLabelStyle}>Payment:</Text>
            <Text style={summaryValueStyle}>{paymentMethod}</Text>
          </Column>
          <Column style={summaryColStyle}>
            <Text style={summaryLabelStyle}>Priority:</Text>
            <Text style={priority === 'express' ? priorityExpressStyle : priority === 'high' ? priorityHighStyle : priorityNormalStyle}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Customer Information */}
      <Section style={customerInfoStyle}>
        <Text style={sectionTitleStyle}>👤 Customer Information</Text>
        
        <Row>
          <Column style={customerColStyle}>
            <Text style={customerLabelStyle}>Name:</Text>
            <Text style={customerValueStyle}>{customerName}</Text>
            
            <Text style={customerLabelStyle}>Email:</Text>
            <Text style={customerEmailStyle}>
              <a href={`mailto:${customerEmail}`} style={linkStyle}>
                {customerEmail}
              </a>
            </Text>
          </Column>
          <Column style={addressColStyle}>
            <Text style={customerLabelStyle}>Shipping Address:</Text>
            <Text style={addressTextStyle}>
              {shippingAddress.name}<br />
              {shippingAddress.line1}<br />
              {shippingAddress.line2 && `${shippingAddress.line2}<br />`}
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
              {shippingAddress.country}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Order Items */}
      <Section style={itemsStyle}>
        <Text style={sectionTitleStyle}>📦 Items to Fulfill</Text>
        
        {items.map((item, index) => (
          <Row key={index} style={itemRowStyle}>
            <Column style={itemQtyStyle}>
              <Text style={itemQtyTextStyle}>{item.quantity}x</Text>
            </Column>
            <Column style={itemDetailsStyle}>
              <Text style={itemNameStyle}>{item.name}</Text>
              {item.variantName && (
                <Text style={itemVariantStyle}>{item.variantName}</Text>
              )}
            </Column>
            <Column style={itemPriceStyle}>
              <Text style={itemPriceTextStyle}>${(item.price * item.quantity).toFixed(2)}</Text>
            </Column>
          </Row>
        ))}

        <Row style={totalRowStyle}>
          <Column>
            <Text style={totalTextStyle}>
              Total: <strong>${orderTotal.toFixed(2)}</strong>
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Special Instructions */}
      {specialInstructions && (
        <Section style={instructionsStyle}>
          <Text style={instructionsTitleStyle}>📝 Special Instructions</Text>
          <Text style={instructionsTextStyle}>{specialInstructions}</Text>
        </Section>
      )}

      {/* Fulfillment Checklist */}
      <Section style={checklistStyle}>
        <Text style={checklistTitleStyle}>✅ Fulfillment Checklist</Text>
        <Text style={checklistItemStyle}>
          □ Verify inventory availability for all items
        </Text>
        <Text style={checklistItemStyle}>
          □ Check address format and completeness
        </Text>
        <Text style={checklistItemStyle}>
          □ Print packing slip and shipping label
        </Text>
        <Text style={checklistItemStyle}>
          □ Pack items securely with band branding materials
        </Text>
        <Text style={checklistItemStyle}>
          □ Include any promotional materials or thank you notes
        </Text>
        <Text style={checklistItemStyle}>
          □ Update order status and add tracking information
        </Text>
        <Text style={checklistItemStyle}>
          □ Send shipping notification to customer
        </Text>
      </Section>

      {/* Admin Actions */}
      <Section style={adminActionsStyle}>
        <Text style={actionsTitleStyle}>⚡ Quick Admin Actions</Text>
        <Row>
          <Column style={actionColStyle}>
            <Button href={`${process.env.BASE_URL}/admin/orders`} style={adminButtonStyle}>
              📋 All Orders
            </Button>
          </Column>
          <Column style={actionColStyle}>
            <Button href={`${process.env.BASE_URL}/admin/inventory`} style={adminButtonStyle}>
              📦 Check Inventory
            </Button>
          </Column>
          <Column style={actionColStyle}>
            <Button href={`${process.env.BASE_URL}/admin/shipping`} style={adminButtonStyle}>
              🚚 Shipping Labels
            </Button>
          </Column>
        </Row>
      </Section>

      {/* Analytics Context */}
      <Section style={analyticsStyle}>
        <Text style={analyticsTitleStyle}>📊 Context & Analytics</Text>
        <Text style={analyticsTextStyle}>
          • This order brings today's total to: [Daily sales will be calculated]
        </Text>
        <Text style={analyticsTextStyle}>
          • Customer type: {customerEmail.includes('gmail') ? 'Consumer' : 'Business'}
        </Text>
        <Text style={analyticsTextStyle}>
          • Ship to location: {shippingAddress.state}, {shippingAddress.country}
        </Text>
        {isPriority && (
          <Text style={priorityAnalyticsStyle}>
            • ⚡ PRIORITY ORDER - Expedited processing required
          </Text>
        )}
      </Section>

      {/* Footer Note */}
      <Section style={footerNoteStyle}>
        <Text style={footerNoteTitleStyle}>🦸‍♂️ From Your Anxious Admin System</Text>
        <Text style={footerNoteTextStyle}>
          This notification was automatically generated when a new order was placed. 
          The sooner this order is processed, the calmer our collective superhero anxiety becomes! 
          Remember: happy customers = less anxious band members.
        </Text>
        <Text style={footerNoteTextStyle}>
          <strong>Response Time Goal:</strong> {isPriority ? '2 hours' : '24 hours'}
        </Text>
      </Section>
    </BaseEmailLayout>
  );
};

// Styles
const alertHeaderStyle = {
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '2px solid #ef4444',
  marginBottom: '30px',
};

const normalHeaderStyle = {
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  border: '2px solid #10b981',
  marginBottom: '30px',
};

const alertIconStyle = {
  fontSize: '32px',
  margin: '0 0 10px 0',
  display: 'block',
};

const alertTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#991b1b',
  margin: '0 0 8px 0',
};

const alertSubtitleStyle = {
  fontSize: '16px',
  color: '#991b1b',
  margin: '0',
};

const quickActionsStyle = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const primaryActionStyle = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '5px',
  display: 'inline-block',
};

const fulfillActionStyle = {
  backgroundColor: '#059669',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '5px',
  display: 'inline-block',
};

const priorityActionStyle = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  margin: '5px',
  display: 'inline-block',
  animation: 'pulse 1s infinite',
};

const orderSummaryStyle = {
  backgroundColor: '#f8fafc',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '30px',
  border: '1px solid #e2e8f0',
};

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 20px 0',
  borderBottom: '2px solid #3b82f6',
  paddingBottom: '5px',
};

const summaryGridStyle = {
  marginBottom: '15px',
};

const summaryColStyle = {
  width: '50%',
  paddingRight: '10px',
};

const summaryLabelStyle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 5px 0',
  fontWeight: '500',
};

const summaryValueStyle = {
  fontSize: '16px',
  color: '#1e293b',
  margin: '0 0 15px 0',
  fontWeight: '600',
};

const summaryAmountStyle = {
  fontSize: '20px',
  color: '#059669',
  margin: '0 0 15px 0',
  fontWeight: 'bold',
};

const priorityNormalStyle = {
  fontSize: '16px',
  color: '#64748b',
  margin: '0 0 15px 0',
  fontWeight: '600',
};

const priorityHighStyle = {
  fontSize: '16px',
  color: '#f59e0b',
  margin: '0 0 15px 0',
  fontWeight: 'bold',
};

const priorityExpressStyle = {
  fontSize: '16px',
  color: '#dc2626',
  margin: '0 0 15px 0',
  fontWeight: 'bold',
};

const customerInfoStyle = {
  backgroundColor: '#f0f9ff',
  padding: '25px',
  borderRadius: '8px',
  borderLeft: '4px solid #0ea5e9',
  marginBottom: '30px',
};

const customerColStyle = {
  width: '40%',
  verticalAlign: 'top',
  paddingRight: '20px',
};

const addressColStyle = {
  width: '60%',
  verticalAlign: 'top',
};

const customerLabelStyle = {
  fontSize: '14px',
  color: '#0c4a6e',
  margin: '0 0 5px 0',
  fontWeight: '600',
};

const customerValueStyle = {
  fontSize: '16px',
  color: '#1e293b',
  margin: '0 0 15px 0',
  fontWeight: '500',
};

const customerEmailStyle = {
  fontSize: '16px',
  margin: '0 0 15px 0',
};

const addressTextStyle = {
  fontSize: '15px',
  color: '#1e293b',
  lineHeight: '1.5',
  margin: '0',
  backgroundColor: '#ffffff',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #e0f2fe',
};

const itemsStyle = {
  marginBottom: '30px',
};

const itemRowStyle = {
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '12px',
  marginBottom: '12px',
};

const itemQtyStyle = {
  width: '10%',
  verticalAlign: 'top',
};

const itemQtyTextStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#3b82f6',
  margin: '0',
};

const itemDetailsStyle = {
  width: '70%',
  verticalAlign: 'top',
  paddingLeft: '15px',
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
  margin: '0',
};

const itemPriceStyle = {
  width: '20%',
  textAlign: 'right' as const,
  verticalAlign: 'top',
};

const itemPriceTextStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0',
};

const totalRowStyle = {
  borderTop: '2px solid #e2e8f0',
  paddingTop: '15px',
  marginTop: '15px',
  textAlign: 'right' as const,
};

const totalTextStyle = {
  fontSize: '18px',
  color: '#1e293b',
  margin: '0',
};

const instructionsStyle = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
  marginBottom: '30px',
};

const instructionsTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 10px 0',
};

const instructionsTextStyle = {
  fontSize: '15px',
  color: '#92400e',
  margin: '0',
  lineHeight: '1.5',
  fontStyle: 'italic',
};

const checklistStyle = {
  backgroundColor: '#f0fdf4',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #22c55e',
  marginBottom: '30px',
};

const checklistTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '0 0 15px 0',
};

const checklistItemStyle = {
  fontSize: '14px',
  color: '#166534',
  margin: '8px 0',
  lineHeight: '1.4',
  fontFamily: 'monospace',
};

const adminActionsStyle = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '30px',
};

const actionsTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 15px 0',
  textAlign: 'center' as const,
};

const actionColStyle = {
  width: '33.33%',
  textAlign: 'center' as const,
  padding: '5px',
};

const adminButtonStyle = {
  backgroundColor: '#64748b',
  color: '#ffffff',
  padding: '10px 16px',
  borderRadius: '5px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  width: '90%',
  display: 'inline-block',
};

const analyticsStyle = {
  backgroundColor: '#f1f5f9',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '30px',
};

const analyticsTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 12px 0',
};

const analyticsTextStyle = {
  fontSize: '14px',
  color: '#475569',
  margin: '6px 0',
  lineHeight: '1.4',
};

const priorityAnalyticsStyle = {
  fontSize: '14px',
  color: '#dc2626',
  margin: '6px 0',
  lineHeight: '1.4',
  fontWeight: 'bold',
};

const footerNoteStyle = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
  textAlign: 'center' as const,
};

const footerNoteTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 12px 0',
};

const footerNoteTextStyle = {
  fontSize: '14px',
  color: '#92400e',
  margin: '8px 0',
  lineHeight: '1.4',
};

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'none',
};

export default AdminNewOrderEmail;