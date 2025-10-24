import React from 'react';
import Header from "@/components/Header";
import AdminPanel from "@/components/AdminPanel";

const AdminPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <AdminPanel />
      </div>
    </>
  );
};

export default AdminPage;