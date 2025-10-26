import React from 'react';
import Header from "@/components/Header";
import NotificationSystem from "@/components/NotificationSystem";
import NotificationSettings from "@/components/NotificationSettings";

const NotificationPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 space-y-6">
          {/* Push Notification Settings */}
          <NotificationSettings />
          
          {/* Notification History */}
          <NotificationSystem />
        </div>
      </div>
    </>
  );
};

export default NotificationPage;