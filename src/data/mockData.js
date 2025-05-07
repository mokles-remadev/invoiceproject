import { v4 as uuidv4 } from 'uuid';

export const companies = [
  {
    id: '1',
    name: 'Tech Solutions Inc.',
    logo: 'https://via.placeholder.com/150',
    address: '123 Tech Ave, San Francisco, CA 94107',
    contactPerson: 'John Smith',
    email: 'john@techsolutions.com',
    phone: '(415) 555-1234',
    bankAccounts: [
      {
        id: 'ba1',
        bankName: 'Bank of America',
        accountNumber: '1234567890',
        swiftCode: 'BOFAUS3N',
        iban: 'US12345678901234567890',
        currency: 'USD'
      },
      {
        id: 'ba2',
        bankName: 'Deutsche Bank',
        accountNumber: '0987654321',
        swiftCode: 'DEUTDEFF',
        iban: 'DE12345678901234567890',
        currency: 'EUR'
      }
    ]
  },
  {
    id: '2',
    name: 'Digital Innovations LLC',
    logo: 'https://via.placeholder.com/150',
    address: '456 Innovation Blvd, Austin, TX 78701',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@digitalinnovations.com',
    phone: '(512) 555-6789',
    bankAccounts: []
  },
  {
    id: '3',
    name: 'Creative Designs Co.',
    logo: 'https://via.placeholder.com/150',
    address: '789 Creative St, New York, NY 10012',
    contactPerson: 'Michael Wong',
    email: 'michael@creativedesigns.com',
    phone: '(212) 555-9012',
    bankAccounts: []
  },
];

export const clients = [
  {
    id: '1',
    name: 'Global Enterprises',
    address: '100 Business Park, Chicago, IL 60601',
    contactPerson: 'Emily Chen',
    email: 'emily@globalenterprises.com',
    phone: '(312) 555-3456',
  },
  {
    id: '2',
    name: 'Modern Retail Group',
    address: '200 Retail Row, Seattle, WA 98101',
    contactPerson: 'David Kim',
    email: 'david@modernretail.com',
    phone: '(206) 555-7890',
  },
  {
    id: '3',
    name: 'Healthcare Innovations',
    address: '300 Medical Dr, Boston, MA 02115',
    contactPerson: 'Lisa Patel',
    email: 'lisa@healthcareinnovations.com',
    phone: '(617) 555-2345',
  },
];

export const projects = [
  {
    id: '1',
    name: 'E-commerce Platform Redesign E-commerce Platform Redesign E-commerce Platform Redesign',
    clientId: '2',
    totalAmount: 120000,
    startDate: '2023-01-15',
    endDate: '2023-06-30',
    description: 'Complete redesign of e-commerce platform including UX/UI and backend systems.',
  },
  {
    id: '2',
    name: 'Healthcare Management System',
    clientId: '3',
    totalAmount: 200000,
    startDate: '2023-02-10',
    endDate: '2023-12-15',
    description: 'Development of comprehensive healthcare management system with patient portal.',
  },
  {
    id: '3',
    name: 'Corporate Website Overhaul',
    clientId: '1',
    totalAmount: 85000,
    startDate: '2023-03-01',
    endDate: '2023-07-31',
    description: 'Complete redesign and development of corporate website with CMS integration.',
  },
];

export const payments = [
  {
    id: '1',
    date: '2023-02-15',
    amount: 24000,
    reference: 'PMT-2023-001',
  },
  {
    id: '2',
    date: '2023-03-20',
    amount: 40000,
    reference: 'PMT-2023-002',
  },
  {
    id: '3',
    date: '2023-04-12',
    amount: 17000,
    reference: 'PMT-2023-003',
  },
];

export const invoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2025-001',
    date: '2025-05-01',
    dueDate: '2025-05-03',
    companyId: '1',
    clientId: '2',
    projectId: '1',
    status: 'Paid',
    totalAmount: 120000,
    progressPercentage: 20,
    currentInvoiceAmount: 24000,
    lineItems: [
      {
        id: '1-1',
        description: 'UX/UI Design - Phase 1',
        amount: 24000,
        deductionPercentage: 0,
        deductionAmount: 0,
        retentionPercentage: 5,
        retentionAmount: 1200,
        netAmount: 22800,
      },
    ],
    payments: ['1'],
    deductions: 0,
    retentions: 1200,
    advancePayment: 0,
    remainingBalance: 96000,
    notes: 'First invoice for the e-commerce platform redesign project.',
    documents: [],
  },
  {
    id: '2',
    invoiceNumber: 'INV-2023-002',
    date: '2023-03-01',
    dueDate: '2023-04-01',
    companyId: '2',
    clientId: '3',
    projectId: '2',
    status: 'Unpaid',
    totalAmount: 50000,
    progressPercentage: 0,
    currentInvoiceAmount: 0,
    lineItems: [
      {
        id: '2-1',
        description: 'Development Services - Initial',
        amount: 50000,
        deductionPercentage: 0,
        deductionAmount: 0,
        retentionPercentage: 0,
        retentionAmount: 0,
        netAmount: 50000,
      },
    ],
    payments: [],
    deductions: 0,
    retentions: 0,
    advancePayment: 0,
    remainingBalance: 50000,
    notes: 'Mock unpaid invoice for testing',
    documents: [],
  },
];

export const generateInvoiceId = () => uuidv4();
export const generateLineItemId = () => uuidv4();