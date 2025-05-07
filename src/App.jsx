import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import InvoicePage from './pages/InvoicePage';
import { InvoiceProvider } from './contexts/InvoiceContext';
import './index.css';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <InvoiceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<InvoicePage />} />
          </Routes>
        </Router>
      </InvoiceProvider>
    </ConfigProvider>
  );
}

export default App;