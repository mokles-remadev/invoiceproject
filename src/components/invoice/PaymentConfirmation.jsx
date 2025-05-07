import React from 'react';
import { Modal, Form, DatePicker, InputNumber, Select, Input, Typography, Descriptions, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../types/invoice';

const { TextArea } = Input;
const { Title } = Typography;

const PaymentConfirmation = ({ invoice, visible, onCancel, onConfirm }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const paymentData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        invoiceId: invoice.id,
      };
      
      await onConfirm(paymentData);
      form.resetFields();
      message.success('Payment confirmed successfully');
    } catch (error) {
      message.error('Failed to confirm payment');
    }
  };

  const uploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
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

  return (
    <Modal
      title={<Title level={4}>Confirm Payment</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Descriptions
        title="Invoice Details"
        bordered
        column={2}
        size="small"
        style={{ marginBottom: 24 }}
      >
        <Descriptions.Item label="Invoice Number">{invoice?.invoiceNumber}</Descriptions.Item>
        <Descriptions.Item label="Due Date">{invoice?.dueDate}</Descriptions.Item>
        <Descriptions.Item label="Original Amount">
          {formatCurrency(invoice?.currentInvoiceAmount)}
        </Descriptions.Item>
        <Descriptions.Item label="Outstanding Amount">
          {formatCurrency(invoice?.currentInvoiceAmount - (invoice?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0))}
        </Descriptions.Item>
      </Descriptions>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          amount: invoice?.currentInvoiceAmount,
        }}
      >
        <Form.Item
          name="date"
          label="Payment Date"
          rules={[{ required: true, message: 'Please select payment date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Payment Amount"
          rules={[{ required: true, message: 'Please enter payment amount' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="method"
          label="Payment Method"
          rules={[{ required: true, message: 'Please select payment method' }]}
        >
          <Select>
            <Select.Option value="bank_transfer">Bank Transfer</Select.Option>
            <Select.Option value="credit_card">Credit Card</Select.Option>
            <Select.Option value="check">Check</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="reference"
          label="Transaction Reference / Swift Number"
          rules={[{ required: true, message: 'Please enter reference number' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="swiftAttachment"
          label="Swift Attachment"
          rules={[{ required: true, message: 'Please upload swift document' }]}
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload Swift Document</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes/Comments"
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Confirm Payment
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentConfirmation;