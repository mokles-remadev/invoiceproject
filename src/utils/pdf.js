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

  // Create PDF with A4 format and a professional font
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
  pdf.setFont('Times');

  // Define constant values for layout
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;

  // Define a consistent color palette (all valid RGB arrays)
  const colors = {
    primary: [0, 32, 96],
    secondary: [102, 102, 102],
    accent: [0, 112, 192],
    border: [220, 220, 220],
    lightGray: [245, 245, 245]
  };

  const safeColor = (color) =>
    Array.isArray(color) && color.length === 3 ? color : [0, 0, 0];

  // ------------------------------------------------
  // Header Section (Company Logo/Name & Details)
  // ------------------------------------------------
  // Left side: Company Logo/Name in a colored rectangle
  const logoWidth = 50;
  const logoHeight = 20;
  pdf.setFillColor(...safeColor(colors.primary));
  pdf.rect(margin, margin, logoWidth, logoHeight, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(company.name.substring(0, 15), margin + logoWidth / 2, margin + logoHeight / 2 + 4, { align: 'center' });

  // Right side: Company Details aligned to top-right
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
    pdf.setTextColor(...safeColor(colors.secondary));
    pdf.text(detail, pageWidth - margin, margin + (index * 5), { align: 'right' });
  });

  // ------------------------------------------------
  // Invoice Title Section
  // ------------------------------------------------
  pdf.setTextColor(...safeColor(colors.primary));
  pdf.setFont('Times', 'bold');
  pdf.setFontSize(24);
  pdf.text('INVOICE', margin, margin + logoHeight + 15);

  // ------------------------------------------------
  // Invoice Information Box
  // ------------------------------------------------
  const infoBoxY = margin + logoHeight + 25;
  pdf.setDrawColor(...safeColor(colors.border));
  pdf.setLineWidth(0.1);
  pdf.rect(margin, infoBoxY, pageWidth - (margin * 2), 30);
  pdf.setFont('Times', 'normal');
  pdf.setFontSize(10);

  // Compute additional progress metrics if not directly available
  const totalActualProgress = invoice.totalActualProgress || invoice.progressPercentage; // adjust as needed
  const lastClaimedProgress = invoice.lastClaimedProgress || invoice.lastClaimedPercentage || 0;
  const progressToBePaid = invoice.progressToBePaid || (invoice.progressPercentage - lastClaimedProgress);

  const infoColumns = [
    [
      ['Invoice No:', invoice.invoiceNumber],
      ['Project Name:', project.name],
    ],
    [
      ['Date:', invoice.date],
      ['Contract No:', invoice.contractNumber],
    ]
  ];

  infoColumns.forEach((column, colIndex) => {
    column.forEach((item, rowIndex) => {
      const x = margin + (colIndex * 85) + 5;
      let y = infoBoxY + 12 + (rowIndex * 10); // Increase spacing to accommodate wrapped lines
      pdf.setTextColor(...safeColor(colors.secondary));
      pdf.text(String(item[0]), x, y);
      pdf.setTextColor(0, 0, 0);
      // If the label is "Project Name:", wrap the text
      if (String(item[0]).trim() === 'Project Name:') {
        const maxWidth = 50; // set maximum width in mm
        const wrappedText = pdf.splitTextToSize(String(item[1]), maxWidth);
        pdf.text(wrappedText, x + 35, y);
      } else {
        pdf.text(String(item[1]), x + 35, y);
      }
    });
  });

  // ------------------------------------------------
  // Client & Project Details Section
  // ------------------------------------------------
  const addressY = infoBoxY + 50;
  // Client details on left
  pdf.setTextColor(...safeColor(colors.primary));
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
    pdf.text(String(detail), margin, addressY + 7 + (index * 5));
  });

  // Project details on right
  pdf.setTextColor(...safeColor(colors.primary));
  pdf.text('PROJECT DETAILS', pageWidth / 2 + 10, addressY);
  pdf.setTextColor(0, 0, 0);
  const projectDetails = [
    `Total Actual Progress: ${invoice.progressPercentage}%`,
    `Cutoff Date: ${invoice.cutOffDate}`,
    `Last Claimed Progress: ${lastClaimedProgress}%`,
    `Progress to be Paid: ${progressToBePaid}%`,
    `Total Project Amount: ${formatCurrency(project.totalAmount, invoice.currency)}`
  ];
  projectDetails.forEach((detail, index) => {
    pdf.text(String(detail), pageWidth / 2 + 10, addressY + 7 + (index * 5));
  });

  // ------------------------------------------------
  // Line Items Table
  // ------------------------------------------------
  const tableY = addressY + 35;
  autoTable(pdf, {
    startY: tableY,
    margin: { left: margin, right: margin },
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
      cellPadding: 4,
      lineColor: safeColor(colors.border),
      lineWidth: 0.1,
      halign: 'center'
    },
    headStyles: {
      fillColor: safeColor(colors.primary),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 60, halign: 'left' },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });

  // ------------------------------------------------
  // Summary Section (smaller)
  // ------------------------------------------------
  const finalY = pdf.lastAutoTable.finalY + 10;
  // Reduced summary box dimensions: width = 70, height = 50
  pdf.setDrawColor(...safeColor(colors.border));
  pdf.setFillColor(250, 250, 250);
  pdf.rect(pageWidth - margin - 70, finalY, 70, 50, 'FD');

  pdf.setTextColor(...safeColor(colors.primary));
  pdf.setFontSize(9);
  pdf.setFont('Times', 'bold');
  pdf.text('SUMMARY', pageWidth - margin - 65, finalY + 8);

  const summaryItems = [
    ['Subtotal:', invoice.currentInvoiceAmount],
    ['Deductions:', invoice.deductions],
    ['Retentions:', invoice.retentions],
    ['Total:', invoice.currentInvoiceAmount - invoice.deductions - invoice.retentions]
  ];
  summaryItems.forEach(([label, amount], i) => {
    const y = finalY + 20 + (i * 10);
    if (i === summaryItems.length - 1) {
      pdf.setDrawColor(...safeColor(colors.border));
      pdf.line(pageWidth - margin - 65, y - 3, pageWidth - margin - 5, y - 3);
    }
    pdf.setTextColor(...(i === summaryItems.length - 1 ? safeColor(colors.primary) : safeColor(colors.secondary)));
    pdf.setFont('Times', i === summaryItems.length - 1 ? 'bold' : 'normal');
    pdf.setFontSize(8);
    pdf.text(label, pageWidth - margin - 65, y);
    pdf.text(formatCurrency(amount, invoice.currency), pageWidth - margin - 5, y, { align: 'right' });
  });

  // ------------------------------------------------
  // Amount in Words Section
  // ------------------------------------------------
  const amountInWords = convertAmountToWords(invoice.currentInvoiceAmount - invoice.deductions - invoice.retentions, invoice.currency);
  pdf.setTextColor(...safeColor(colors.primary));
  pdf.setFontSize(10);
  pdf.text('Amount in Words:', margin, finalY + 10);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  const wrappedAmount = pdf.splitTextToSize(amountInWords, pageWidth - (margin * 2) - 90);
  wrappedAmount.forEach((line, index) => {
    pdf.text(line, margin, finalY + 20 + (index * 5));
  });

  // ------------------------------------------------
  // Payment Instructions Section
  // ------------------------------------------------
  pdf.setTextColor(...safeColor(colors.primary));
  pdf.setFont('Times', 'bold');
  pdf.setFontSize(10);
  pdf.text('Payment Instructions', margin, finalY + 45);

  const selectedBank = company.bankAccounts?.find(acc => acc.currency === invoice.currency) || company.bankAccounts?.[0];
  if (selectedBank) {
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Times', 'normal');
    pdf.setFontSize(9);
    const bankDetails = [
      'Please transfer via bank transfer to:',
      `Bank: ${selectedBank.bankName}`,
      `Account: ${selectedBank.accountNumber}`,
      `SWIFT: ${selectedBank.swiftCode}`,
      `IBAN: ${selectedBank.iban}`,
    ];
    bankDetails.forEach((detail, index) => {
      pdf.text(detail, margin, finalY + 55 + (index * 5));
    });
  }



  // ------------------------------------------------
  // Footer Section
  // ------------------------------------------------
  pdf.setFillColor(...safeColor(colors.lightGray));
  pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  pdf.setTextColor(...safeColor(colors.secondary));
  pdf.setFontSize(8);
  pdf.text(`${company.name} | Reg No: ${company.id} | VAT No: ${company.id}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  pdf.text('Page 1 of 1', pageWidth - margin, pageHeight - 10, { align: 'right' });

  return pdf;
};

export const downloadInvoicePDF = (invoice) => {
  const pdf = generateInvoicePDF(invoice);
  pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};