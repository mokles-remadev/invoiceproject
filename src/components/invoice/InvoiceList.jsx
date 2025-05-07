import React, { useState } from 'react';
import { Table, Tag, Button, Space, Input, Select, Tooltip, Card, Typography, Row, Col, message } from 'antd';
import { 
  SearchOutlined, 
  EditOutlined,
  DeleteOutlined, 
  FileTextOutlined,
  EyeOutlined,
  FilterOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useInvoices } from '../../contexts/InvoiceContext';
import { companies, clients, projects } from '../../data/mockData';
import { downloadInvoicePDF } from '../../utils/pdf';
import PaymentConfirmation from './PaymentConfirmation';

const { Title } = Typography;
const { Option } = Select;

const InvoiceList = ({ onEdit, onView }) => {
  const { 
    invoices, 
    deleteInvoice, 
    filteredStatus, 
    setFilteredStatus,
    updateInvoice 
  } = useInvoices();
  
  const [searchText, setSearchText] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handlePaymentClick = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalVisible(true);
  };

  const handlePaymentConfirm = async (paymentData) => {
    try {
      const updatedInvoice = {
        ...selectedInvoice,
        status: 'Paid',
        payments: [...(selectedInvoice.payments || []), paymentData],
      };
      
      await updateInvoice(updatedInvoice);
      setPaymentModalVisible(false);
      setSelectedInvoice(null);
      message.success('Payment recorded successfully');
    } catch (error) {
      message.error('Failed to record payment');
    }
  };

  // Filter invoices based on status and search text
  const filteredInvoices = invoices
    .filter(invoice => filteredStatus === 'All' || invoice.status === filteredStatus)
    .filter(invoice => {
      const invoiceNumber = invoice.invoiceNumber.toLowerCase();
      const clientName = clients.find(c => c.id === invoice.clientId)?.name.toLowerCase() || '';
      const projectName = projects.find(p => p.id === invoice.projectId)?.name.toLowerCase() || '';
      const search = searchText.toLowerCase();
      
      return invoiceNumber.includes(search) || 
             clientName.includes(search) || 
             projectName.includes(search);
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Unpaid':
        return 'warning';
      case 'Canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get client name by ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown';
  };

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  // Get company name by ID
  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown';
  };

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      sorter: (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Client',
      key: 'clientId',
      render: (text, record) => getClientName(record.clientId),
      sorter: (a, b) => 
        getClientName(a.clientId).localeCompare(getClientName(b.clientId)),
    },
    {
      title: 'Project',
      key: 'projectId',
      render: (text, record) => getProjectName(record.projectId),
      sorter: (a, b) => 
        getProjectName(a.projectId).localeCompare(getProjectName(b.projectId)),
    },
    {
      title: 'Amount',
      dataIndex: 'currentInvoiceAmount',
      key: 'currentInvoiceAmount',
      render: (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sorter: (a, b) => a.currentInvoiceAmount - b.currentInvoiceAmount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => onView(record)} 
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(record)} 
            />
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button 
              type="text" 
              icon={<FileTextOutlined />} 
              onClick={() => downloadInvoicePDF(record)} 
            />
          </Tooltip>
          {record.status === 'Unpaid' && (
            <Tooltip title="Confirm Payment">
              <Button 
                type="text" 
                icon={<DollarOutlined />} 
                onClick={() => handlePaymentClick(record)}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => deleteInvoice(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} className="invoice-list-card">
        <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>Invoices</Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Input
                placeholder="Search invoices"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
              <Select
                style={{ width: 120 }}
                placeholder="Filter by status"
                value={filteredStatus}
                onChange={value => setFilteredStatus(value)}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="All">All</Option>
                <Option value="Paid">Paid</Option>
                <Option value="Unpaid">Unpaid</Option>
                <Option value="Canceled">Canceled</Option>
              </Select>
            </Space>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} invoices`,
          }}
          bordered
          className="invoice-table"
        />
      </Card>

      {selectedInvoice && (
        <PaymentConfirmation
          invoice={selectedInvoice}
          visible={paymentModalVisible}
          onCancel={() => {
            setPaymentModalVisible(false);
            setSelectedInvoice(null);
          }}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </>
  );
};

export default InvoiceList;