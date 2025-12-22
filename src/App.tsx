import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Chat from './Chat';
import ProductTable from './ProductTable';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Chat />} />
          <Route path="products" element={<ProductTable />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;