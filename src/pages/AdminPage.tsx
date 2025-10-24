import React from 'react';
import Header from "@/components/Header";
import AdminPanel from "@/components/AdminPanel";
import BackButton from "@/components/BackButton";

const AdminPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 mb-6">
          <BackButton />
        </div>
        <AdminPanel />
      </div>
    </>
  );
};

export default AdminPage;