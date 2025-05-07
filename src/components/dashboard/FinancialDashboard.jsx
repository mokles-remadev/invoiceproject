import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Button, Table, Space } from 'antd';
import { 
  DollarOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useInvoices } from '../../contexts/InvoiceContext';
import { clients, projects } from '../../data/mockData';
import { formatCurrency } from '../../types/invoice';

const { RangePicker } = DatePicker;

const FinancialDashboard = () => {
  const { invoices } = useInvoices();
  const [dateRange, setDateRange] = useState(null);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');

  // Filter invoices based on selected filters
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesClient = selectedClient === 'all' || invoice.clientId === selectedClient;
      const matchesProject = selectedProject === 'all' || invoice.projectId === selectedProject;
      const matchesDate = !dateRange || (
        new Date(invoice.date) >= dateRange[0].toDate() &&
        new Date(invoice.date) <= dateRange[1].toDate()
      );
      return matchesClient && matchesProject && matchesDate;
    });
  }, [invoices, selectedClient, selectedProject, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const paidInvoices = filteredInvoices.filter(inv => inv.status === 'Paid');
    const unpaidInvoices = filteredInvoices.filter(inv => inv.status === 'Unpaid');
    
    return {
      totalPaidAmount: paidInvoices.reduce((sum, inv) => sum + inv.currentInvoiceAmount, 0),
      totalUnpaidAmount: unpaidInvoices.reduce((sum, inv) => sum + inv.currentInvoiceAmount, 0),
      paidCount: paidInvoices.length,
      unpaidCount: unpaidInvoices.length,
    };
  }, [filteredInvoices]);

  // Calculate aging analysis
  const agingAnalysis = useMemo(() => {
    const now = new Date();
    const unpaidInvoices = filteredInvoices.filter(inv => inv.status === 'Unpaid');
    
    return {
      '0-30': unpaidInvoices.filter(inv => (now - new Date(inv.dueDate)) <= 30 * 24 * 60 * 60 * 1000).length,
      '31-60': unpaidInvoices.filter(inv => (now - new Date(inv.dueDate)) > 30 * 24 * 60 * 60 * 1000 && (now - new Date(inv.dueDate)) <= 60 * 24 * 60 * 60 * 1000).length,
      '61-90': unpaidInvoices.filter(inv => (now - new Date(inv.dueDate)) > 60 * 24 * 60 * 60 * 1000 && (now - new Date(inv.dueDate)) <= 90 * 24 * 60 * 60 * 1000).length,
      '90+': unpaidInvoices.filter(inv => (now - new Date(inv.dueDate)) > 90 * 24 * 60 * 60 * 1000).length,
    };
  }, [filteredInvoices]);

  // Calculate client statistics
  const clientStats = useMemo(() => {
    const stats = {};
    filteredInvoices.forEach(invoice => {
      if (!stats[invoice.clientId]) {
        stats[invoice.clientId] = {
          clientName: clients.find(c => c.id === invoice.clientId)?.name || 'Unknown',
          totalAmount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          invoiceCount: 0,
        };
      }
      
      stats[invoice.clientId].totalAmount += invoice.currentInvoiceAmount;
      stats[invoice.clientId].invoiceCount++;
      
      if (invoice.status === 'Paid') {
        stats[invoice.clientId].paidAmount += invoice.currentInvoiceAmount;
      } else {
        stats[invoice.clientId].unpaidAmount += invoice.currentInvoiceAmount;
      }
    });
    
    return Object.values(stats).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredInvoices]);

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const trends = {};
    filteredInvoices.forEach(invoice => {
      const month = new Date(invoice.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!trends[month]) {
        trends[month] = {
          paid: 0,
          unpaid: 0,
        };
      }
      if (invoice.status === 'Paid') {
        trends[month].paid += invoice.currentInvoiceAmount;
      } else {
        trends[month].unpaid += invoice.currentInvoiceAmount;
      }
    });
    return trends;
  }, [filteredInvoices]);

  const clientColumns = [
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: amount => formatCurrency(amount),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: amount => formatCurrency(amount),
    },
    {
      title: 'Unpaid Amount',
      dataIndex: 'unpaidAmount',
      key: 'unpaidAmount',
      render: amount => formatCurrency(amount),
    },
    {
      title: 'Invoice Count',
      dataIndex: 'invoiceCount',
      key: 'invoiceCount',
    },
  ];

  const exportData = () => {
    const csvContent = [
      ['Client', 'Total Amount', 'Paid Amount', 'Unpaid Amount', 'Invoice Count'],
      ...clientStats.map(stat => [
        stat.clientName,
        stat.totalAmount,
        stat.paidAmount,
        stat.unpaidAmount,
        stat.invoiceCount,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="financial-dashboard">
      <Row gutter={[16, 16]} className="dashboard-filters">
        <Col span={8}>
          <RangePicker 
            onChange={setDateRange}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Select Client"
            style={{ width: '100%' }}
            value={selectedClient}
            onChange={setSelectedClient}
          >
            <Select.Option value="all">All Clients</Select.Option>
            {clients.map(client => (
              <Select.Option key={client.id} value={client.id}>
                {client.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            placeholder="Select Project"
            style={{ width: '100%' }}
            value={selectedProject}
            onChange={setSelectedProject}
          >
            <Select.Option value="all">All Projects</Select.Option>
            {projects.map(project => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={exportData}
            style={{ width: '100%' }}
          >
            Export Report
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-stats">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Paid Invoices"
              value={stats.paidCount}
              prefix={<FileTextOutlined />}
              suffix={`/ ${stats.paidCount + stats.unpaidCount}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Paid Amount"
              value={stats.totalPaidAmount}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Outstanding Amount"
              value={stats.totalUnpaidAmount}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Payment Time"
              value={30}
              prefix={<ClockCircleOutlined />}
              suffix="days"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-aging">
        <Col span={24}>
          <Card title="Aging Analysis">
            <Row gutter={16}>
              {Object.entries(agingAnalysis).map(([range, count]) => (
                <Col span={6} key={range}>
                  <Statistic
                    title={`${range} Days`}
                    value={count}
                    suffix={`Invoice${count !== 1 ? 's' : ''}`}
                  />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-clients">
        <Col span={24}>
          <Card title="Client Analysis">
            <Table
              dataSource={clientStats}
              columns={clientColumns}
              rowKey="clientName"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-trends">
        <Col span={24}>
          <Card title="Monthly Payment Trends">
            <Table
              dataSource={Object.entries(monthlyTrends).map(([month, data]) => ({
                month,
                ...data,
                total: data.paid + data.unpaid,
              }))}
              columns={[
                {
                  title: 'Month',
                  dataIndex: 'month',
                  key: 'month',
                },
                {
                  title: 'Paid Amount',
                  dataIndex: 'paid',
                  key: 'paid',
                  render: amount => formatCurrency(amount),
                },
                {
                  title: 'Unpaid Amount',
                  dataIndex: 'unpaid',
                  key: 'unpaid',
                  render: amount => formatCurrency(amount),
                },
                {
                  title: 'Total Amount',
                  dataIndex: 'total',
                  key: 'total',
                  render: amount => formatCurrency(amount),
                },
              ]}
              rowKey="month"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancialDashboard;