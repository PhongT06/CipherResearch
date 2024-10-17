import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import HomePage from './HomePage';
import CryptoDetailPage from './CryptoDetailPage';
import GlossaryPage from './GlossaryPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/crypto/:id" element={<CryptoDetailPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;