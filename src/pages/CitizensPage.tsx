import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CitizensManagement from '@/components/CitizensManagement';
import BackButton from '@/components/BackButton';

const CitizensPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <div className="container mx-auto px-4 mb-6">
          <BackButton />
        </div>
        <CitizensManagement />
      </main>
      <Footer />
    </div>
  );
};

export default CitizensPage;