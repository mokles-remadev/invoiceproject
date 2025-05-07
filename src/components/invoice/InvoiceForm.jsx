import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, Card, Divider, Typography, Table, Space, Upload, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { companies, clients, projects, generateInvoiceId, generateLineItemId } from '../../data/mockData';
import { CURRENCIES } from '../../types/invoice';
import { 
  calculateLineItemNetAmount, 
  calculateDeductionAmount, 
  calculateRetentionAmount,
  updateLineItemCalculations
} from '../../utils/calculations';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const defaultLineItem = {
  id: '',
  description: '',
  amount: 0,
  deductionPercentage: 0,
  deductionAmount: 0,
  retentionPercentage: 5, // Default 5% retention
  retentionAmount: 0,
  netAmount: 0,
};

const uploadProps = {
  name: 'file',
  action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188', // Mock endpoint
  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

const InvoiceForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialValues?.companyId);
  const [selectedClientId, setSelectedClientId] = useState(initialValues?.clientId);
  const [selectedProjectId, setSelectedProjectId] = useState(initialValues?.projectId);
  const [totalProjectAmount, setTotalProjectAmount] = useState(initialValues?.totalAmount || 0);
  const [progressPercentage, setProgressPercentage] = useState(initialValues?.progressPercentage || 0);
  const [lineItems, setLineItems] = useState(initialValues?.lineItems || []);
  const [documents, setDocuments] = useState(initialValues?.documents || []);
  const [lastClaimedPercentage, setLastClaimedPercentage] = useState(initialValues?.lastClaimedPercentage || 0);
  const [cutOffDate, setCutOffDate] = useState(initialValues?.cutOffDate ? dayjs(initialValues.cutOffDate) : undefined);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : undefined,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined,
      });
      setSelectedCompanyId(initialValues.companyId);
      setSelectedClientId(initialValues.clientId);
      setSelectedProjectId(initialValues.projectId);
      setTotalProjectAmount(initialValues.totalAmount);
      setProgressPercentage(initialValues.progressPercentage);
      setLineItems(initialValues.lineItems);
      setDocuments(initialValues.documents);
    }
  }, [initialValues, form]);

  const filteredClients = clients;

  const filteredProjects = selectedClientId 
    ? projects.filter(project => project.clientId === selectedClientId)
    : projects;

  const handleProjectChange = (projectId) => {
    const selectedProject = projects.find(project => project.id === projectId);
    if (selectedProject) {
      setTotalProjectAmount(selectedProject.totalAmount);
      form.setFieldValue('totalAmount', selectedProject.totalAmount);
      
      const initialLineItem = {
        ...defaultLineItem,
        id: generateLineItemId(),
        amount: calculateCurrentInvoiceAmount(selectedProject.totalAmount, progressPercentage),
      };
      
      setLineItems([updateLineItemCalculations(initialLineItem)]);
      form.setFieldValue('lineItems', [updateLineItemCalculations(initialLineItem)]);
    }
  };

  const calculateCurrentInvoiceAmount = (total, progress) => {
    return total * (progress / 100);
  };

  const calculateProgressToBePaid = (currentProgress, lastClaimed) => {
    return Math.max(0, currentProgress - lastClaimed);
  };

  const handleProgressChange = (value) => {
    if (value !== null) {
      setProgressPercentage(value);
      
      const progressToBePaid = calculateProgressToBePaid(value, lastClaimedPercentage);
      
      const updatedItems = lineItems.map(item => {
        const amount = calculateCurrentInvoiceAmount(totalProjectAmount, progressToBePaid);
        return updateLineItemCalculations({
          ...item,
          amount,
        });
      });
      
      setLineItems(updatedItems);
      form.setFieldValue('lineItems', updatedItems);
      form.setFieldValue('currentInvoiceAmount', calculateCurrentInvoiceAmount(totalProjectAmount, progressToBePaid));
    }
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...lineItems];
    
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value,
    };
    
    if (field === 'deductionPercentage') {
      newLineItems[index].deductionAmount = calculateDeductionAmount(
        newLineItems[index].amount,
        value
      );
    } else if (field === 'retentionPercentage') {
      newLineItems[index].retentionAmount = calculateRetentionAmount(
        newLineItems[index].amount,
        value
      );
    }
    
    newLineItems[index].netAmount = calculateLineItemNetAmount(
      newLineItems[index].amount,
      newLineItems[index].deductionPercentage,
      newLineItems[index].retentionPercentage
    );
    
    setLineItems(newLineItems);
    form.setFieldValue('lineItems', newLineItems);
  };

  const addLineItem = () => {
    const newItem = {
      ...defaultLineItem,
      id: generateLineItemId(),
      amount: calculateCurrentInvoiceAmount(totalProjectAmount, progressPercentage) / (lineItems.length + 1),
    };
    
    const updatedItems = lineItems.map(item => ({
      ...item,
      amount: item.amount / (lineItems.length + 1) * lineItems.length,
    }));
    
    const recalculatedItems = [...updatedItems, newItem].map(item => 
      updateLineItemCalculations(item)
    );
    
    setLineItems(recalculatedItems);
    form.setFieldValue('lineItems', recalculatedItems);
  };

  const removeLineItem = (index) => {
    if (lineItems.length <= 1) {
      message.warning('You need at least one line item');
      return;
    }
    
    const removedAmount = lineItems[index].amount;
    const newLineItems = lineItems.filter((_, i) => i !== index);
    
    const updatedItems = newLineItems.map(item => ({
      ...item,
      amount: item.amount + (removedAmount / newLineItems.length),
    }));
    
    const recalculatedItems = updatedItems.map(item => 
      updateLineItemCalculations(item)
    );
    
    setLineItems(recalculatedItems);
    form.setFieldValue('lineItems', recalculatedItems);
  };

  const totalDeductions = lineItems.reduce((sum, item) => sum + item.deductionAmount, 0);
  const totalRetentions = lineItems.reduce((sum, item) => sum + item.retentionAmount, 0);
  const totalNetAmount = lineItems.reduce((sum, item) => sum + item.netAmount, 0);

  const handleFinish = (values) => {
    const progressToBePaid = calculateProgressToBePaid(values.progressPercentage, values.lastClaimedPercentage);
    
    const formattedValues = {
      ...values,
      id: initialValues?.id || generateInvoiceId(),
      date: values.date ? values.date.format('YYYY-MM-DD') : '',
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
      cutOffDate: values.cutOffDate ? values.cutOffDate.format('YYYY-MM-DD') : '',
      lineItems: lineItems,
      deductions: totalDeductions,
      retentions: totalRetentions,
      documents: documents,
      progressToBePaid,
      currentInvoiceAmount: calculateCurrentInvoiceAmount(totalProjectAmount, progressToBePaid),
      payments: initialValues?.payments || [],
      remainingBalance: totalProjectAmount - calculateCurrentInvoiceAmount(totalProjectAmount, progressToBePaid),
    };
    
    onSubmit(formattedValues);
  };

  const lineItemColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (_, __, index) => (
        <Input
          value={lineItems[index].description}
          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
          placeholder="Enter description"
        />
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (_, __, index) => (
        <InputNumber
          style={{ width: '100%' }}
          value={lineItems[index].amount}
          onChange={(value) => handleLineItemChange(index, 'amount', value || 0)}
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          precision={2}
        />
      ),
    },
    {
      title: 'Deduction %',
      dataIndex: 'deductionPercentage',
      key: 'deductionPercentage',
      render: (_, __, index) => (
        <InputNumber
          style={{ width: '100%' }}
          value={lineItems[index].deductionPercentage}
          onChange={(value) => handleLineItemChange(index, 'deductionPercentage', value || 0)}
          min={0}
          max={100}
          formatter={(value) => `${value}%`}
          parser={(value) => value.replace('%', '')}
        />
      ),
    },
    {
      title: 'Deduction Amount',
      dataIndex: 'deductionAmount',
      key: 'deductionAmount',
      render: (_, __, index) => (
        <InputNumber
          style={{ width: '100%' }}
          value={lineItems[index].deductionAmount}
          disabled
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          precision={2}
        />
      ),
    },
    {
      title: 'Retention %',
      dataIndex: 'retentionPercentage',
      key: 'retentionPercentage',
      render: (_, __, index) => (
        <InputNumber
          style={{ width: '100%' }}
          value={lineItems[index].retentionPercentage}
          onChange={(value) => handleLineItemChange(index, 'retentionPercentage', value || 0)}
          min={0}
          max={100}
          formatter={(value) => `${value}%`}
          parser={(value) => value.replace('%', '')}
        />
      ),
    },
    {
      title: 'Retention Amount',
      dataIndex: 'retentionAmount',
      key: 'retentionAmount',
      render: (_, __, index) => (
        <InputNumber
          style={{ width: '100%' }}
          value={lineItems[index].retentionAmount}
          disabled
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          precision={2}
        />
      ),
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (_, __, index) => (
        <InputNumber
          style={{ width: '100%' }}
          value={lineItems[index].netAmount}
          disabled
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          precision={2}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, __, index) => (
        <Button 
          type="text" 
          danger 
          icon={<MinusCircleOutlined />} 
          onClick={() => removeLineItem(index)}
        />
      ),
    },
  ];

  return (
    <Card className="invoice-form-card" bordered={false}>
      <Title level={3}>{initialValues ? 'Edit Invoice' : 'Create New Invoice'}</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          status: 'Unpaid',
          progressPercentage: 0,
          lastClaimedPercentage: 0,
          advancePayment: 0,
          ...initialValues,
          date: initialValues?.date ? dayjs(initialValues.date) : undefined,
          dueDate: initialValues?.dueDate ? dayjs(initialValues.dueDate) : undefined,
          cutOffDate: initialValues?.cutOffDate ? dayjs(initialValues.cutOffDate) : undefined,
        }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="companyId"
              label="Company"
              rules={[{ required: true, message: 'Please select a company' }]}
            >
              <Select 
                placeholder="Select company" 
                onChange={(value) => setSelectedCompanyId(value)}
              >
                {companies.map((company) => (
                  <Option key={company.id} value={company.id}>
                    {company.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="clientId"
              label="Client"
              rules={[{ required: true, message: 'Please select a client' }]}
            >
              <Select 
                placeholder="Select client" 
                onChange={(value) => setSelectedClientId(value)}
                disabled={!selectedCompanyId}
              >
                {filteredClients.map((client) => (
                  <Option key={client.id} value={client.id}>
                    {client.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="projectId"
              label="Project/Contract"
              rules={[{ required: true, message: 'Please select a project' }]}
            >
              <Select 
                placeholder="Select project" 
                onChange={handleProjectChange}
                disabled={!selectedClientId}
              >
                {filteredProjects.map((project) => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="cutOffDate"
              label="Cut-off Date"
              rules={[{ required: true, message: 'Please select cut-off date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                onChange={(date) => setCutOffDate(date)}
              />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              name="lastClaimedPercentage"
              label="Last Claimed Progress (%)"
              rules={[{ required: true, message: 'Please enter last claimed percentage' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                onChange={(value) => {
                  setLastClaimedPercentage(value || 0);
                  handleProgressChange(progressPercentage);
                }}
              />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              name="progressPercentage"
              label="Total Actual Progress (%)"
              rules={[{ required: true, message: 'Please enter progress percentage' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                onChange={handleProgressChange}
              />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              label="Progress to be Paid (%)"
            >
              <InputNumber
                style={{ width: '100%' }}
                value={calculateProgressToBePaid(progressPercentage, lastClaimedPercentage)}
                disabled
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="invoiceNumber"
              label="Invoice Number"
              rules={[{ required: true, message: 'Please enter invoice number' }]}
            >
              <Input placeholder="e.g. INV-2023-001" />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              name="date"
              label="Invoice Date"
              rules={[{ required: true, message: 'Please select invoice date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true, message: 'Please select due date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status">
                <Option value="Paid">Paid</Option>
                <Option value="Unpaid">Unpaid</Option>
                <Option value="Canceled">Canceled</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="currency"
              label="Currency"
              rules={[{ required: true, message: 'Please select currency' }]}
            >
              <Select placeholder="Select currency">
                {Object.values(CURRENCIES).map(currency => (
                  <Option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="bankAccount"
              label="Bank Account"
              rules={[{ required: true, message: 'Please select bank account' }]}
            >
              <Select placeholder="Select bank account">
                {companies.find(c => c.id === selectedCompanyId)?.bankAccounts?.map(account => (
                  <Option key={account.id} value={account.id}>
                    {account.bankName} - {account.accountNumber}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="totalAmount"
              label="Total Project Amount"
            >
              <InputNumber
                style={{ width: '100%' }}
                value={totalProjectAmount}
                disabled
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="advancePayment"
              label="Advance Payment Adjustment"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider orientation="left">Line Items</Divider>
        
        <Table
          dataSource={lineItems}
          columns={lineItemColumns}
          pagination={false}
          rowKey="id"
          bordered
          className="line-items-table"
        />
        
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Button 
            type="dashed" 
            onClick={addLineItem} 
            icon={<PlusOutlined />}
            block
          >
            Add Line Item
          </Button>
        </div>
        
        <Row gutter={16}>
          <Col span={8} offset={16}>
            <Card size="small" title="Summary" bordered>
              <Row>
                <Col span={12}>
                  <Text>Progress to be Paid:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text>{calculateProgressToBePaid(progressPercentage, lastClaimedPercentage)}%</Text>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Text>Total Deductions:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text>${totalDeductions.toFixed(2)}</Text>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Text>Total Retentions:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text>${totalRetentions.toFixed(2)}</Text>
                </Col>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <Row>
                <Col span={12}>
                  <Text strong>Net Amount:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong>${totalNetAmount.toFixed(2)}</Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Form.Item
          name="notes"
          label="Notes/Comments"
        >
          <TextArea rows={4} placeholder="Enter any additional notes or comments" />
        </Form.Item>
        
        <Form.Item
          label="Supporting Documents"
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload File</Button>
          </Upload>
        </Form.Item>
        
        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              {initialValues ? 'Update Invoice' : 'Create Invoice'}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InvoiceForm;