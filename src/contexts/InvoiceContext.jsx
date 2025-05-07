import React, { createContext, useContext, useState } from 'react';
import { invoices as mockInvoices } from '../data/mockData';
import { recalculateInvoice } from '../utils/calculations';

const InvoiceContext = createContext(undefined);

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState('All');

  const addInvoice = (invoice) => {
    const recalculated = recalculateInvoice(invoice);
    setInvoices([...invoices, recalculated]);
  };

  const updateInvoice = (invoice) => {
    const recalculated = recalculateInvoice(invoice);
    setInvoices(invoices.map((inv) => (inv.id === invoice.id ? recalculated : inv)));
    if (selectedInvoice && selectedInvoice.id === invoice.id) {
      setSelectedInvoice(recalculated);
    }
  };

  const deleteInvoice = (id) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id));
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice(null);
    }
  };

  const selectInvoice = (id) => {
    const invoice = invoices.find((inv) => inv.id === id);
    if (invoice) {
      setSelectedInvoice(invoice);
    }
  };

  const clearSelectedInvoice = () => setSelectedInvoice(null);

  const value = {
    invoices,
    selectedInvoice,
    filteredStatus,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    selectInvoice,
    clearSelectedInvoice,
    setFilteredStatus,
  };

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
};