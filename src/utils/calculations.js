export const calculateLineItemNetAmount = (amount, deductionPercentage, retentionPercentage) => {
  const deductionAmount = calculateDeductionAmount(amount, deductionPercentage);
  const retentionAmount = calculateRetentionAmount(amount, retentionPercentage);
  return amount - deductionAmount - retentionAmount;
};

export const calculateDeductionAmount = (amount, percentage) => {
  return amount * (percentage / 100);
};

export const calculateRetentionAmount = (amount, percentage) => {
  return amount * (percentage / 100);
};

export const calculateTotalDeductions = (lineItems) => {
  return lineItems.reduce((total, item) => total + item.deductionAmount, 0);
};

export const calculateTotalRetentions = (lineItems) => {
  return lineItems.reduce((total, item) => total + item.retentionAmount, 0);
};

export const calculateRemainingBalance = (totalAmount, currentInvoiceAmount, previousPayments) => {
  return totalAmount - currentInvoiceAmount - previousPayments;
};

export const calculateNetInvoiceAmount = (currentInvoiceAmount, totalDeductions, totalRetentions, advancePayment) => {
  return currentInvoiceAmount - totalDeductions - totalRetentions - advancePayment;
};

export const updateLineItemCalculations = (lineItem, progressToBePaid, totalAmount) => {
  const amount = progressToBePaid && totalAmount 
    ? totalAmount * (progressToBePaid / 100)
    : lineItem.amount;
    
  const deductionAmount = calculateDeductionAmount(amount, lineItem.deductionPercentage);
  const retentionAmount = calculateRetentionAmount(amount, lineItem.retentionPercentage);
  const netAmount = amount - deductionAmount - retentionAmount;

  return {
    ...lineItem,
    amount,
    deductionAmount,
    retentionAmount,
    netAmount,
  };
};

export const recalculateInvoice = (invoice) => {
  const deductions = calculateTotalDeductions(invoice.lineItems);
  const retentions = calculateTotalRetentions(invoice.lineItems);
  const previousPayments = 0;
  
  const remainingBalance = calculateRemainingBalance(
    invoice.totalAmount,
    invoice.currentInvoiceAmount,
    previousPayments
  );

  return {
    ...invoice,
    deductions,
    retentions,
    remainingBalance,
  };
};