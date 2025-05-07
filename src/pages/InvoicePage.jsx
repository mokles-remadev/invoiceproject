import React, { useState } from 'react';
import { Button, Layout, message, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import InvoiceForm from '../components/invoice/InvoiceForm';
import InvoiceList from '../components/invoice/InvoiceList';
import InvoiceDetails from '../components/invoice/InvoiceDetails';
import FinancialDashboard from '../components/dashboard/FinancialDashboard';
import { useInvoices } from '../contexts/InvoiceContext';
import { generateInvoiceId } from '../data/mockData';

const { Title } = Typography;
const { Header, Content } = Layout;
const { TabPane } = Tabs;

const View = {
  LIST: 'list',
  FORM: 'form',
  DETAILS: 'details',
};

const InvoicePage = () => {
  const [currentView, setCurrentView] = useState(View.LIST);
  const [activeTab, setActiveTab] = useState('1');
  const { 
    selectedInvoice, 
    addInvoice, 
    updateInvoice, 
    clearSelectedInvoice 
  } = useInvoices();

  const handleCreateClick = () => {
    clearSelectedInvoice();
    setCurrentView(View.FORM);
  };

  const handleEditClick = (invoice) => {
    setCurrentView(View.FORM);
  };

  const handleViewClick = (invoice) => {
    setCurrentView(View.DETAILS);
  };

  const handleFormSubmit = (invoice) => {
    if (selectedInvoice) {
      updateInvoice(invoice);
      message.success('Invoice updated successfully');
    } else {
      const newInvoice = {
        ...invoice,
        id: generateInvoiceId(),
      };
      addInvoice(newInvoice);
      message.success('Invoice created successfully');
    }
    setCurrentView(View.LIST);
  };

  const handleFormCancel = () => {
    setCurrentView(View.LIST);
    clearSelectedInvoice();
  };

  const renderContent = () => {
    switch (currentView) {
      case View.FORM:
        return (
          <InvoiceForm 
            initialValues={selectedInvoice || undefined} 
            onSubmit={handleFormSubmit} 
            onCancel={handleFormCancel}
          />
        );
      case View.DETAILS:
        return selectedInvoice ? (
          <InvoiceDetails 
            invoice={selectedInvoice} 
            onEdit={handleEditClick} 
          />
        ) : (
          <div>No invoice selected</div>
        );
      case View.LIST:
      default:
        return (
          <InvoiceList 
            onEdit={handleEditClick} 
            onView={handleViewClick} 
          />
        );
    }
  };

  return (
    <Layout className="invoice-page" style={{ minHeight: '100vh' }}>
      <Header className="header" style={{ background: '#fff', padding: '0 24px', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>Invoice Management</Title>
          {currentView === View.LIST && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreateClick}
            >
              Create Invoice
            </Button>
          )}
        </div>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          className="invoice-tabs"
          style={{ background: '#fff', padding: '16px' }}
        >
          <TabPane tab="Dashboard" key="1">
            <FinancialDashboard />
          </TabPane>
          <TabPane tab="Invoices" key="2">
            {renderContent()}
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default InvoicePage;