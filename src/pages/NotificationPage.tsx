import React from 'react';
import Header from "@/components/Header";
import NotificationSystem from "@/components/NotificationSystem";

const NotificationPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <NotificationSystem />
      </div>
    </>
  );
};

export default NotificationPage;