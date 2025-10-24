import React from 'react';
import Header from "@/components/Header";
import PaymentStatusTracking from "@/components/PaymentStatusTracking";

const PaymentPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <PaymentStatusTracking />
      </div>
    </>
  );
};

export default PaymentPage;