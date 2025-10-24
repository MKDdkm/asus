import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CitizensManagement from '@/components/CitizensManagement';

const CitizensPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <CitizensManagement />
      </main>
      <Footer />
    </div>
  );
};

export default CitizensPage;