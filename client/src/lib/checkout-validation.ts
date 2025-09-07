import { z } from 'zod';

// Country/State validation data
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  // Add more countries as needed
];

// Custom validation functions
const validatePostalCode = (postalCode: string, country: string) => {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
    GB: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
  };
  
  const pattern = patterns[country];
  if (!pattern) return true; // Allow unknown countries
  
  return pattern.test(postalCode);
};

// Base address schema
const baseAddressSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  
  address1: z.string()
    .min(1, 'Address is required')
    .max(100, 'Address must be less than 100 characters'),
  
  address2: z.string()
    .max(100, 'Address line 2 must be less than 100 characters')
    .optional(),
  
  city: z.string()
    .min(1, 'City is required')
    .max(50, 'City must be less than 50 characters'),
  
  state: z.string()
    .min(1, 'State/Province is required')
    .max(50, 'State/Province must be less than 50 characters'),
  
  postalCode: z.string()
    .min(1, 'Postal/ZIP code is required')
    .max(20, 'Postal/ZIP code must be less than 20 characters'),
  
  country: z.string()
    .min(1, 'Country is required')
    .refine(
      (country) => COUNTRIES.some(c => c.value === country),
      'Please select a valid country'
    ),
  
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number')
    .optional(),
});

// Add postal code validation that depends on country
export const shippingAddressSchema = baseAddressSchema.refine(
  (data) => validatePostalCode(data.postalCode, data.country),
  {
    message: 'Please enter a valid postal/ZIP code for the selected country',
    path: ['postalCode'],
  }
);

// Billing address schema (extends shipping with same-as-shipping option)
export const billingAddressSchema = z.union([
  z.object({
    sameAsShipping: z.literal(true),
  }),
  baseAddressSchema.extend({
    sameAsShipping: z.literal(false),
  }).refine(
    (data) => validatePostalCode(data.postalCode, data.country),
    {
      message: 'Please enter a valid postal/ZIP code for the selected country',
      path: ['postalCode'],
    }
  ),
]);

// Customer information schema
export const customerInfoSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  createAccount: z.boolean().optional(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .optional(),
  
  confirmPassword: z.string().optional(),
  
  marketingEmails: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.createAccount && !data.password) {
      return false;
    }
    return true;
  },
  {
    message: 'Password is required when creating an account',
    path: ['password'],
  }
).refine(
  (data) => {
    if (data.createAccount && data.password && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// Shipping method schema
export const shippingMethodSchema = z.object({
  shippingMethodId: z.string()
    .min(1, 'Please select a shipping method'),
});

// Payment schema
export const paymentSchema = z.object({
  paymentMethod: z.enum(['card', 'paypal', 'apple_pay', 'google_pay'], {
    required_error: 'Please select a payment method',
  }),
  
  savePaymentMethod: z.boolean().optional(),
  
  // Card details (when using Stripe)
  cardholderName: z.string()
    .min(1, 'Cardholder name is required')
    .max(100, 'Cardholder name must be less than 100 characters')
    .optional(),
  
  // These would be handled by Stripe Elements in the frontend
  stripePaymentMethodId: z.string().optional(),
});

// Order notes and terms schema
export const orderDetailsSchema = z.object({
  orderNotes: z.string()
    .max(500, 'Order notes must be less than 500 characters')
    .optional(),
  
  termsAccepted: z.boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
  
  privacyPolicyAccepted: z.boolean()
    .refine((val) => val === true, 'You must accept the privacy policy'),
  
  marketingEmails: z.boolean().optional(),
});

// Complete checkout form schema
export const checkoutFormSchema = z.object({
  customer: customerInfoSchema,
  shippingAddress: shippingAddressSchema,
  billingAddress: billingAddressSchema,
  shippingMethod: shippingMethodSchema,
  payment: paymentSchema,
  orderDetails: orderDetailsSchema,
});

// Individual step schemas for validation
export const stepSchemas = {
  customer: customerInfoSchema,
  shipping: z.object({
    shippingAddress: shippingAddressSchema,
  }),
  payment: z.object({
    billingAddress: billingAddressSchema,
    shippingMethod: shippingMethodSchema,
    payment: paymentSchema,
  }),
  review: z.object({
    orderDetails: orderDetailsSchema,
  }),
};

// Type exports
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type BillingAddressFormData = z.infer<typeof billingAddressSchema>;
export type CustomerInfoFormData = z.infer<typeof customerInfoSchema>;
export type ShippingMethodFormData = z.infer<typeof shippingMethodSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type OrderDetailsFormData = z.infer<typeof orderDetailsSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Form defaults
export const defaultShippingAddress: Partial<ShippingAddressFormData> = {
  country: 'US',
  state: '',
};

export const defaultBillingAddress: BillingAddressFormData = {
  sameAsShipping: true,
};

export const defaultCustomerInfo: Partial<CustomerInfoFormData> = {
  createAccount: false,
  marketingEmails: true,
};

export const defaultPayment: Partial<PaymentFormData> = {
  paymentMethod: 'card',
  savePaymentMethod: false,
};

export const defaultOrderDetails: Partial<OrderDetailsFormData> = {
  termsAccepted: false,
  privacyPolicyAccepted: false,
  marketingEmails: true,
};

// Validation utilities
export const validateStep = (step: keyof typeof stepSchemas, data: any) => {
  const schema = stepSchemas[step];
  return schema.safeParse(data);
};

export const validateField = (schema: z.ZodSchema, fieldName: string, value: any) => {
  try {
    schema.parse({ [fieldName]: value });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path.includes(fieldName));
      return { 
        success: false, 
        error: fieldError?.message || 'Validation failed' 
      };
    }
    return { success: false, error: 'Validation failed' };
  }
};

// Address formatting utilities
export const formatAddress = (address: ShippingAddressFormData | BillingAddressFormData) => {
  if ('sameAsShipping' in address && address.sameAsShipping) {
    return 'Same as shipping address';
  }
  
  const addr = address as ShippingAddressFormData;
  const lines = [
    addr.company && addr.company,
    `${addr.firstName} ${addr.lastName}`,
    addr.address1,
    addr.address2 && addr.address2,
    `${addr.city}, ${addr.state} ${addr.postalCode}`,
    COUNTRIES.find(c => c.value === addr.country)?.label,
    addr.phone && addr.phone,
  ].filter(Boolean);
  
  return lines.join('\n');
};

// Get state options based on country
export const getStateOptions = (country: string) => {
  switch (country) {
    case 'US':
      return US_STATES;
    case 'CA':
      // Add Canadian provinces
      return [
        { value: 'AB', label: 'Alberta' },
        { value: 'BC', label: 'British Columbia' },
        { value: 'MB', label: 'Manitoba' },
        { value: 'NB', label: 'New Brunswick' },
        { value: 'NL', label: 'Newfoundland and Labrador' },
        { value: 'NS', label: 'Nova Scotia' },
        { value: 'ON', label: 'Ontario' },
        { value: 'PE', label: 'Prince Edward Island' },
        { value: 'QC', label: 'Quebec' },
        { value: 'SK', label: 'Saskatchewan' },
        { value: 'NT', label: 'Northwest Territories' },
        { value: 'NU', label: 'Nunavut' },
        { value: 'YT', label: 'Yukon' },
      ];
    default:
      return [];
  }
};

// Postal code formatting
export const formatPostalCode = (postalCode: string, country: string) => {
  switch (country) {
    case 'CA':
      // Format Canadian postal codes as "A1A 1A1"
      return postalCode.toUpperCase().replace(/^([A-Z]\d[A-Z])(\d[A-Z]\d)$/, '$1 $2');
    case 'US':
      // Format US ZIP codes
      if (postalCode.length === 9) {
        return postalCode.replace(/^(\d{5})(\d{4})$/, '$1-$2');
      }
      return postalCode;
    default:
      return postalCode;
  }
};