import { convertAmountToWords } from './numberToWords';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { companies, clients, projects } from '../data/mockData';
import { CURRENCIES, formatCurrency } from '../types/invoice';

export const generateInvoicePDF = (invoice) => {
  const company = companies.find((c) => c.id === invoice.companyId);
  const client = clients.find((c) => c.id === invoice.clientId);
  const project = projects.find((p) => p.id === invoice.projectId);

  if (!company || !client || !project) {
    throw new Error('Company, client, or project data not found');
  }

  // Create PDF with A4 format and professional font
  const pdf = new jsPDF({
    format: 'a4',
    unit: 'mm'
  });
  
  pdf.setFont('helvetica');

  // Professional color scheme
  const colors = {
    primary: [0, 32, 96],
    secondary: [102, 102, 102],
    accent: [0, 112, 192],
    success: [0, 176, 80],
    warning: [255, 192, 0],
    danger: [192, 0, 0],
    border: [220, 220, 220]
  };

  // A4 dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;

  // Header section with improved layout
  pdf.setFillColor(...colors.primary);
  pdf.rect(margin, margin, 50, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(company.name.substring(0, 10), margin + 25, margin + 12, { align: 'center' });

  // Company details with registration numbers
  pdf.setTextColor(...colors.secondary);
  pdf.setFontSize(9);
  const companyDetails = [
    company.name,
    company.address,
    `Tel: ${company.phone}`,
    `Email: ${company.email}`,
    `Reg No: ${company.id}`,
    `VAT No: ${company.id}`
  ];
  
  companyDetails.forEach((detail, index) => {
    pdf.text(detail, pageWidth - margin, margin + (index * 5), { align: 'right' });
  });

  // Invoice title and reference numbers
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', margin, margin + 45);

  // Invoice details box
  const infoBoxY = margin + 55;
  pdf.setDrawColor(...colors.border);
  pdf.setLineWidth(0.1);
  pdf.rect(margin, infoBoxY, pageWidth - (margin * 2), 40);

  // Invoice information
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const infoColumns = [
    [
      ['Invoice No:', invoice.invoiceNumber],
      ['Date:', invoice.date],
      ['Due Date:', invoice.dueDate],
      ['Currency:', invoice.currency || 'USD']
    ],
    [
      ['Project Ref:', project.id],
      ['Progress:', `${invoice.progressPercentage}%`],
      ['Status:', invoice.status],
      ['Terms:', '30 Days']
    ]
  ];

  infoColumns.forEach((column, colIndex) => {
    column.forEach((item, rowIndex) => {
      const x = margin + (colIndex * 85) + 5;
      const y = infoBoxY + 12 + (rowIndex * 8);
      
      pdf.setTextColor(...colors.secondary);
      pdf.text(item[0], x, y);
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(item[1], x + 35, y);
    });
  });

  // Client and project information
  const addressY = infoBoxY + 50;
  
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(10);
  pdf.text('BILL TO', margin, addressY);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  const clientDetails = [
    client.name,
    client.address,
    `Contact: ${client.contactPerson}`,
    `Tel: ${client.phone}`,
    `Email: ${client.email}`
  ];
  
  clientDetails.forEach((detail, index) => {
    pdf.text(detail, margin, addressY + 10 + (index * 5));
  });

  // Project details
  pdf.setTextColor(...colors.primary);
  pdf.text('PROJECT DETAILS', pageWidth - margin - 80, addressY);
  
  pdf.setTextColor(0, 0, 0);
  const projectDetails = [
    project.name,
    `Start Date: ${project.startDate}`,
    `End Date: ${project.endDate}`,
    `Total Amount: ${formatCurrency(project.totalAmount, invoice.currency)}`
  ];
  
  projectDetails.forEach((detail, index) => {
    pdf.text(detail, pageWidth - margin - 80, addressY + 10 + (index * 5));
  });

  // Line items table
  const tableY = addressY + 60;
  
  autoTable(pdf, {
    startY: tableY,
    head: [['Description', 'Amount', 'Deduction', 'Retention', 'Net Amount']],
    body: invoice.lineItems.map(item => [
      item.description,
      formatCurrency(item.amount, invoice.currency),
      `${item.deductionPercentage}%\n${formatCurrency(item.deductionAmount, invoice.currency)}`,
      `${item.retentionPercentage}%\n${formatCurrency(item.retentionAmount, invoice.currency)}`,
      formatCurrency(item.netAmount, invoice.currency)
    ]),
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 5,
      lineColor: colors.border,
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: colors.primary[0],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });

  // Summary box
  const finalY = pdf.lastAutoTable.finalY + 10;
  
  pdf.setDrawColor(...colors.border);
  pdf.setFillColor(250, 250, 250);
  pdf.rect(pageWidth - margin - 85, finalY, 85, 70, 'FD');

  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SUMMARY', pageWidth - margin - 80, finalY + 10);

  const summaryItems = [
    ['Subtotal:', invoice.currentInvoiceAmount],
    ['Deductions:', invoice.deductions],
    ['Retentions:', invoice.retentions],
    ['Total:', invoice.currentInvoiceAmount - invoice.deductions - invoice.retentions]
  ];

  summaryItems.forEach(([label, amount], i) => {
    const y = finalY + 25 + (i * 12);
    const isTotal = i === summaryItems.length - 1;

    if (isTotal) {
      pdf.setDrawColor(...colors.border);
      pdf.line(pageWidth - margin - 80, y - 4, pageWidth - margin - 5, y - 4);
    }

    pdf.setTextColor(...(isTotal ? colors.primary : colors.secondary));
    pdf.setFont('helvetica', isTotal ? 'bold' : 'normal');
    pdf.setFontSize(9);
    
    pdf.text(label, pageWidth - margin - 80, y);
    pdf.text(
      formatCurrency(amount, invoice.currency),
      pageWidth - margin - 5,
      y,
      { align: 'right' }
    );
  });

  // Amount in words
  const amountInWords = convertAmountToWords(
    invoice.currentInvoiceAmount - invoice.deductions - invoice.retentions,
    invoice.currency
  );
  
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(10);
  pdf.text('Amount in Words:', margin, finalY + 10);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  const wrappedAmountInWords = pdf.splitTextToSize(amountInWords, pageWidth - (margin * 2) - 90);
  wrappedAmountInWords.forEach((line, index) => {
    pdf.text(line, margin, finalY + 20 + (index * 5));
  });

  // Payment instructions
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Instructions', margin, finalY + 45);

  const selectedBank = company.bankAccounts?.find(acc => acc.currency === invoice.currency) || company.bankAccounts?.[0];
  
  if (selectedBank) {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    const bankDetails = [
      'Please make payment via bank transfer to:',
      `Bank: ${selectedBank.bankName}`,
      `Account: ${selectedBank.accountNumber}`,
      `SWIFT: ${selectedBank.swiftCode}`,
      `IBAN: ${selectedBank.iban}`,
      'Please quote invoice number as payment reference'
    ];
    
    bankDetails.forEach((detail, index) => {
      pdf.text(detail, margin, finalY + 55 + (index * 5));
    });
  }

  // Terms and conditions
  if (invoice.notes) {
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Terms & Conditions', margin, pageHeight - 60);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const wrappedNotes = pdf.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
    wrappedNotes.forEach((line, index) => {
      if (index < 4) { // Limit to 4 lines to avoid overflow
        pdf.text(line, margin, pageHeight - 50 + (index * 5));
      }
    });
  }

  // Footer
  pdf.setFillColor(245, 245, 245);
  pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');

  pdf.setTextColor(...colors.secondary);
  pdf.setFontSize(8);
  pdf.text(
    `${company.name} | Reg No: ${company.id} | VAT No: ${company.id}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Page numbers
  pdf.setFontSize(8);
  pdf.text(
    `Page 1 of 1`,
    pageWidth - margin,
    pageHeight - 10,
    { align: 'right' }
  );

  return pdf;
};

export const downloadInvoicePDF = (invoice) => {
  const pdf = generateInvoicePDF(invoice);
  pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};