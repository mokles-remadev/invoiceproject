import React from 'react';
import { Card, Descriptions, Badge, Button, Space, Divider, Table, Typography, Row, Col } from 'antd';
import { FileTextOutlined, EditOutlined } from '@ant-design/icons';
import { companies, clients, projects } from '../../data/mockData';
import { downloadInvoicePDF } from '../../utils/pdf';

const { Title, Text } = Typography;

const InvoiceDetails = ({ invoice, onEdit }) => {
  // Get company, client, and project details
  const company = companies.find(c => c.id === invoice.companyId);
  const client = clients.find(c => c.id === invoice.clientId);
  const project = projects.find(p => p.id === invoice.projectId);

  // Get status color
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

  // Define columns for line items table
  const lineItemColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Deduction',
      key: 'deduction',
      render: (_, record) => (
        <>
          {record.deductionPercentage}% (${record.deductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
        </>
      ),
    },
    {
      title: 'Retention',
      key: 'retention',
      render: (_, record) => (
        <>
          {record.retentionPercentage}% (${record.retentionAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
        </>
      ),
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
  ];

  return (
    <Card 
      bordered={false} 
      className="invoice-details-card"
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Invoice #{invoice.invoiceNumber}</Title>
          <Space>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => onEdit(invoice)}
            >
              Edit
            </Button>
            <Button 
              type="primary" 
              icon={<FileTextOutlined />} 
              onClick={() => downloadInvoicePDF(invoice)}
            >
              Download PDF
            </Button>
          </Space>
        </div>
      }
    >
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card size="small" title="Company Information" bordered>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{company?.name}</Descriptions.Item>
              <Descriptions.Item label="Address">{company?.address}</Descriptions.Item>
              <Descriptions.Item label="Contact">{company?.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="Email">{company?.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{company?.phone}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title="Client Information" bordered>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{client?.name}</Descriptions.Item>
              <Descriptions.Item label="Address">{client?.address}</Descriptions.Item>
              <Descriptions.Item label="Contact">{client?.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="Email">{client?.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{client?.phone}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Descriptions
        title="Invoice Details"
        bordered
        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
      >
        <Descriptions.Item label="Invoice Number">{invoice.invoiceNumber}</Descriptions.Item>
        <Descriptions.Item label="Date">{invoice.date}</Descriptions.Item>
        <Descriptions.Item label="Due Date">{invoice.dueDate}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Badge status={getStatusColor(invoice.status)} text={invoice.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Project" span={2}>{project?.name}</Descriptions.Item>
        <Descriptions.Item label="Total Project Amount">
          ${invoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="Progress">{invoice.progressPercentage}%</Descriptions.Item>
        <Descriptions.Item label="Current Invoice Amount">
          ${invoice.currentInvoiceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="Remaining Balance">
          ${invoice.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Line Items</Divider>

      <Table
        dataSource={invoice.lineItems}
        columns={lineItemColumns}
        pagination={false}
        rowKey="id"
        bordered
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="right">
                <Text strong>Total:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong>
                  ${invoice.lineItems.reduce((sum, item) => sum + item.netAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      <Divider />

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card size="small" title="Summary" bordered>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Total Deductions">
                ${invoice.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Descriptions.Item>
              <Descriptions.Item label="Total Retentions">
                ${invoice.retentions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Descriptions.Item>
              <Descriptions.Item label="Advance Payment">
                ${invoice.advancePayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Descriptions.Item>
              <Descriptions.Item label="Net Amount">
                ${(invoice.currentInvoiceAmount - invoice.deductions - invoice.retentions - invoice.advancePayment).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          {invoice.notes && (
            <Card size="small" title="Notes" bordered>
              <Text>{invoice.notes}</Text>
            </Card>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default InvoiceDetails;