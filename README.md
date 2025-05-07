# Invoice Management System (IMS)

A comprehensive React-based system for creating, managing, and tracking invoices for businesses. This application allows users to manage clients, projects, invoices, and payments with an intuitive user interface.

![Invoice Management System](https://via.placeholder.com/800x400?text=Invoice+Management+System)

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technical Stack](#technical-stack)
- [Setup and Installation](#setup-and-installation)
- [ERP Integration Guide](#erp-integration-guide)
- [Usage Guide](#usage-guide)
- [Known Issues](#known-issues)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

### Dashboard
- Financial overview with key metrics
- Invoice aging analysis
- Client-wise payment statistics
- Monthly payment trends
- Exportable reports

### Invoice Management
- Create, view, edit and delete invoices
- Support for multiple clients and projects
- Progress-based invoice generation
- Retention and deduction calculations
- PDF export with professional formatting
- Payment tracking and confirmation

### Client & Project Management
- Client database with contact information
- Project tracking with financial details
- Multiple currency support

## Project Structure

```
/
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── dashboard/     # Dashboard-related components
│   │   └── invoice/       # Invoice-related components
│   ├── contexts/          # React context providers
│   ├── data/              # Mock data and data utilities
│   ├── pages/             # Page components
│   ├── types/             # Type definitions and utilities
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.jsx           # Application entry point
├── .gitignore             # Git ignore file
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── package.json           # Project dependencies
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── vite.config.js         # Vite configuration
```

## Technical Stack

### Frontend Framework
- React 18
- React Router v6

### UI Components
- Ant Design v5
- Tailwind CSS

### State Management
- React Context API

### PDF Generation
- jsPDF
- jspdf-autotable

### Development Tools
- Vite
- ESLint
- PostCSS
- Autoprefixer

## Setup and Installation

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd invoicemokles
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Building for Production

```bash
npm run build
```

This will generate optimized production files in the `dist` directory.

## ERP Integration Guide

### Overview
This module can be integrated into your existing ERP system as an invoice management component. Instead of using React Context for state management, we'll implement a service-based architecture with RESTful APIs.

### Integration Steps

1. **Module Installation**

   Add the invoice module to your ERP project:
   ```bash
   # From your ERP project root
   npm install --save ./path/to/invoicemokles
   ```
   
   Or add it as a Git submodule:
   ```bash
   git submodule add <repository-url> modules/invoicemokles
   ```

2. **API Implementation**

   Create an API service layer in your ERP project that will replace the InvoiceContext:

   ```javascript
   // /api/invoiceService.js
   
   // Example API implementation with fetch or axios
   export const invoiceService = {
     // Fetch all invoices with optional filtering
     getInvoices: async (filters = {}) => {
       const queryParams = new URLSearchParams(filters).toString();
       const response = await fetch(`/api/invoices?${queryParams}`);
       return response.json();
     },
     
     // Get a single invoice by ID
     getInvoiceById: async (id) => {
       const response = await fetch(`/api/invoices/${id}`);
       return response.json();
     },
     
     // Create a new invoice
     createInvoice: async (invoice) => {
       const response = await fetch('/api/invoices', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(invoice)
       });
       return response.json();
     },
     
     // Update an existing invoice
     updateInvoice: async (invoice) => {
       const response = await fetch(`/api/invoices/${invoice.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(invoice)
       });
       return response.json();
     },
     
     // Delete an invoice
     deleteInvoice: async (id) => {
       await fetch(`/api/invoices/${id}`, {
         method: 'DELETE'
       });
     },
     
     // Record payment for an invoice
     recordPayment: async (invoiceId, payment) => {
       const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payment)
       });
       return response.json();
     }
   };
   ```

3. **Component Modification**

   Modify the invoice components to use the API service instead of the InvoiceContext:

   ```javascript
   // Example modification for InvoiceList.jsx
   import React, { useState, useEffect } from 'react';
   import { invoiceService } from '../../api/invoiceService';
   
   const InvoiceList = () => {
     const [invoices, setInvoices] = useState([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     
     useEffect(() => {
       fetchInvoices();
     }, []);
     
     const fetchInvoices = async () => {
       try {
         setLoading(true);
         const data = await invoiceService.getInvoices();
         setInvoices(data);
       } catch (err) {
         setError('Failed to fetch invoices');
         console.error(err);
       } finally {
         setLoading(false);
       }
     };
     
     // Rest of component implementation...
   };
   ```

4. **Backend API Endpoints**

   Implement the following API endpoints in your ERP backend system:

   - `GET /api/invoices` - List all invoices with filtering options
   - `GET /api/invoices/:id` - Get a specific invoice
   - `POST /api/invoices` - Create a new invoice
   - `PUT /api/invoices/:id` - Update an existing invoice
   - `DELETE /api/invoices/:id` - Delete an invoice
   - `POST /api/invoices/:id/payments` - Record a payment for an invoice
   - `GET /api/clients` - List all clients
   - `GET /api/projects` - List all projects
   - `GET /api/companies` - List all companies

5. **Database Schema**

   Ensure your ERP database includes the following tables:

   - `invoices`: Invoice header information
   - `invoice_line_items`: Line items for each invoice
   - `payments`: Payment records
   - `clients`: Client information
   - `projects`: Project details
   - `companies`: Company information

6. **Calculation Utilities**

   The existing calculation utilities (`calculations.js`) can be reused in your backend to ensure consistent calculations:

   ```javascript
   // Server-side implementation example
   const { recalculateInvoice } = require('./path/to/calculations');
   
   app.post('/api/invoices', (req, res) => {
     const invoiceData = req.body;
     // Apply calculations
     const processedInvoice = recalculateInvoice(invoiceData);
     // Save to database
     db.invoices.create(processedInvoice)
       .then(result => res.json(result))
       .catch(err => res.status(500).json({ error: err.message }));
   });
   ```

7. **UI Integration**

   Integrate the invoice module UI into your ERP navigation:

   ```javascript
   // Example for React Router integration
   import { InvoicePage } from 'invoicemokles/src/pages/InvoicePage';
   
   // In your ERP routes configuration
   <Route path="/invoices/*" element={<InvoicePage />} />
   ```

### Data Exchange Format

The invoice object should conform to the following structure:

```javascript
{
  id: String,
  invoiceNumber: String,
  date: String, // YYYY-MM-DD format
  dueDate: String, // YYYY-MM-DD format
  companyId: String,
  clientId: String,
  projectId: String,
  status: String, // "Draft", "Sent", "Paid", "Overdue", etc.
  totalAmount: Number,
  progressPercentage: Number,
  currentInvoiceAmount: Number,
  lineItems: [
    {
      id: String,
      description: String,
      amount: Number,
      deductionPercentage: Number,
      deductionAmount: Number,
      retentionPercentage: Number,
      retentionAmount: Number,
      netAmount: Number
    }
  ],
  payments: Array<String>, // Array of payment IDs
  deductions: Number,
  retentions: Number,
  advancePayment: Number,
  remainingBalance: Number,
  notes: String,
  documents: Array
}
```

### Security Considerations

- Implement proper authentication and authorization
- Validate all user inputs both client and server side
- Use HTTPS for all API communications
- Implement rate limiting to prevent abuse
- Add audit logging for sensitive operations

### Performance Optimization

- Implement pagination for invoice listings
- Use caching for frequently accessed data
- Consider implementing GraphQL for more efficient data fetching

## Usage Guide

### Creating an Invoice

1. Navigate to the "Invoices" tab
2. Click the "Create Invoice" button
3. Fill in the required information:
   - Select company, client, and project
   - Set progress percentage and cut-off date
   - Add line items with appropriate deductions/retentions
   - Add any notes or attachments
4. Click "Create Invoice" to save

### Managing Invoices

- **View Invoice**: Click the eye icon on any invoice row
- **Edit Invoice**: Click the edit icon on any invoice row
- **Delete Invoice**: Click the delete icon on any invoice row
- **Download PDF**: Click the file icon to generate and download a PDF

### Recording Payments

1. Locate the invoice in the list
2. Click the payment icon (dollar sign)
3. Enter payment details (date, amount, method, reference)
4. Upload any supporting documents
5. Click "Confirm Payment"

### Using the Dashboard

- Use filters at the top to select date ranges, clients, or projects
- View summary statistics at the top
- Review aging analysis in the middle section
- Examine client-specific data in the table
- Export reports using the "Export Report" button

## Known Issues

- **Invoice Selection Issue**: Sometimes shows "No invoice selected" even when an invoice is selected. This occurs due to a function call issue in the `handleViewClick` method. Fix is currently in progress.
- The PDF generation may show placeholder images instead of actual company logos.
- Currency conversion rates are static and need to be updated manually.

## Troubleshooting

### Common Issues

**Issue: No invoice selected message appears when viewing an invoice**
- Solution: This is a known issue related to how the selected invoice is managed in the context. A fix is in progress.

**Issue: PDF generation fails**
- Solution: Ensure that all required invoice data fields are correctly populated. Missing data can cause PDF generation to fail.

**Issue: Application doesn't load**
- Solution: Check browser console for errors. Ensure all dependencies are properly installed with `npm install`.

## Future Enhancements

- User authentication and role-based access
- Multi-language support
- Integration with accounting software
- Email notifications for invoice events
- Client portal for invoice access
- Mobile application

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2025 Invoice Management System. All rights reserved.