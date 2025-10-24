import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Users, 
  CreditCard, 
  Bell, 
  TrendingUp,
  Search,
  Calendar,
  Download,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  RefreshCw
} from "lucide-react";

interface Application {
  id: number;
  application_id: string;
  service_type: string;
  applicant_name: string;
  phone_number: string;
  email: string;
  status: string;
  created_at: string;
  payment_amount?: number;
  payment_status?: string;
}

interface DashboardStats {
  applications: {
    total: number;
    today: number;
    pending: number;
  };
  payments: {
    total: number;
    totalAmount: number;
    today: number;
    todayAmount: number;
    successful: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
}

const AdminPanel: React.FC = () => {
  const { language } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);

  // Backend API base URL
  const API_BASE = 'http://localhost:3001/api';

  useEffect(() => {
    fetchDashboardData();
    fetchApplications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Note: In a real app, you'd need to handle authentication
      // For demo purposes, we'll make API calls without auth
      const response = await fetch(`${API_BASE}/admin/dashboard`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data.overview);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Fallback to mock data for demo
      setStats({
        applications: { total: 5, today: 2, pending: 1 },
        payments: { total: 3, totalAmount: 5040, today: 1, todayAmount: 1680, successful: 3 },
        notifications: { total: 8, unread: 3 }
      });
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/applications?limit=50`;
      
      if (filterStatus && filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setApplications(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      // Fallback to empty array for demo
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string, reason?: string) => {
    try {
      // Note: In a real app, you'd need admin authentication
      const response = await fetch(`${API_BASE}/admin/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${adminToken}` // Would need admin login
        },
        body: JSON.stringify({
          status: newStatus,
          reason: reason || `Status updated to ${newStatus}`,
          updatedBy: 'Admin'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Refresh applications list
          fetchApplications();
          alert(`✅ Application ${applicationId} status updated to ${newStatus}`);
        }
      } else {
        alert('❌ Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('❌ Error updating application status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved': 
        return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected': 
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'under_review':
      case 'processing': 
        return <RefreshCw className="text-blue-500" size={16} />;
      case 'submitted':
      case 'pending': 
        return <Clock className="text-yellow-500" size={16} />;
      default: 
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved': 
        return 'bg-green-100 text-green-700';
      case 'rejected': 
        return 'bg-red-100 text-red-700';
      case 'under_review':
      case 'processing': 
        return 'bg-blue-100 text-blue-700';
      case 'submitted':
      case 'pending': 
        return 'bg-yellow-100 text-yellow-700';
      default: 
        return 'bg-gray-100 text-gray-700';
    }
  };

  const broadcastNotification = async () => {
    const title = prompt('Enter notification title:');
    const message = prompt('Enter notification message:');
    
    if (title && message) {
      try {
        const response = await fetch(`${API_BASE}/admin/broadcast`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            message,
            type: 'info',
            category: 'announcement'
          })
        });

        if (response.ok) {
          alert('✅ Broadcast notification sent successfully!');
        } else {
          alert('❌ Failed to send broadcast notification');
        }
      } catch (error) {
        console.error('Error sending broadcast:', error);
        alert('❌ Error sending broadcast notification');
      }
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'en' ? '🏛️ Admin Dashboard' : '🏛️ ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage citizen applications, payments, and notifications'
              : 'ನಾಗರಿಕರ ಅರ್ಜಿಗಳು, ಪಾವತಿಗಳು ಮತ್ತು ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={broadcastNotification} className="bg-purple-600 hover:bg-purple-700">
            <Bell size={16} className="mr-2" />
            {language === 'en' ? 'Broadcast' : 'ಪ್ರಸಾರ'}
          </Button>
          <Button onClick={fetchApplications} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            {language === 'en' ? 'Refresh' : 'ರಿಫ್ರೆಶ್'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'en' ? 'Total Applications' : 'ಒಟ್ಟು ಅರ್ಜಿಗಳು'}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.applications.today} {language === 'en' ? 'today' : 'ಇಂದು'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'en' ? 'Pending Applications' : 'ಬಾಕಿ ಅರ್ಜಿಗಳು'}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.applications.pending}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'Requires attention' : 'ಗಮನ ಅಗತ್ಯ'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'en' ? 'Total Revenue' : 'ಒಟ್ಟು ಆದಾಯ'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.payments.totalAmount}</div>
              <p className="text-xs text-muted-foreground">
                +₹{stats.payments.todayAmount} {language === 'en' ? 'today' : 'ಇಂದು'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'en' ? 'Notifications' : 'ಅಧಿಸೂಚನೆಗಳು'}
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.notifications.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.notifications.unread} {language === 'en' ? 'unread' : 'ಓದದ'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Applications Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users size={20} />
            <span>{language === 'en' ? 'Applications Management' : 'ಅರ್ಜಿ ನಿರ್ವಹಣೆ'}</span>
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'View and manage all citizen applications'
              : 'ಎಲ್ಲಾ ನಾಗರಿಕರ ಅರ್ಜಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder={language === 'en' 
                  ? 'Search applications...'
                  : 'ಅರ್ಜಿಗಳನ್ನು ಹುಡುಕಿ...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="all">{language === 'en' ? 'All Status' : 'ಎಲ್ಲಾ ಸ್ಥಿತಿ'}</option>
              <option value="submitted">{language === 'en' ? 'Submitted' : 'ಸಲ್ಲಿಸಲಾಗಿದೆ'}</option>
              <option value="under_review">{language === 'en' ? 'Under Review' : 'ಪರಿಶೀಲನೆಯಲ್ಲಿ'}</option>
              <option value="approved">{language === 'en' ? 'Approved' : 'ಅನುಮೋದಿಸಲಾಗಿದೆ'}</option>
              <option value="rejected">{language === 'en' ? 'Rejected' : 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ'}</option>
              <option value="completed">{language === 'en' ? 'Completed' : 'ಪೂರ್ಣಗೊಂಡಿದೆ'}</option>
            </select>
          </div>

          {/* Applications Table */}
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
              <p>{language === 'en' ? 'Loading applications...' : 'ಅರ್ಜಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...'}</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>{language === 'en' ? 'No applications found' : 'ಯಾವುದೇ ಅರ್ಜಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold">{application.applicant_name}</h3>
                        <Badge className={`${getStatusColor(application.status)} border-0`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{application.status.replace('_', ' ').toUpperCase()}</span>
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">ID:</span> {application.application_id}
                        </div>
                        <div>
                          <span className="font-medium">Service:</span> {application.service_type}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(application.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {application.phone_number}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {application.email}
                        </div>
                        {application.payment_amount && (
                          <div>
                            <span className="font-medium">Payment:</span> ₹{application.payment_amount} ({application.payment_status})
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationDetails(true);
                        }}
                      >
                        <Eye size={14} className="mr-1" />
                        {language === 'en' ? 'View' : 'ವೀಕ್ಷಿಸಿ'}
                      </Button>
                      
                      {application.status === 'submitted' && (
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(application.application_id, 'under_review', 'Application moved to review')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {language === 'en' ? 'Review' : 'ಪರಿಶೀಲಿಸಿ'}
                        </Button>
                      )}
                      
                      {application.status === 'under_review' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.application_id, 'approved', 'Application approved by admin')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {language === 'en' ? 'Approve' : 'ಅನುಮೋದಿಸಿ'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) {
                                updateApplicationStatus(application.application_id, 'rejected', reason);
                              }
                            }}
                          >
                            {language === 'en' ? 'Reject' : 'ತಿರಸ್ಕರಿಸಿ'}
                          </Button>
                        </>
                      )}
                      
                      {application.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(application.application_id, 'completed', 'Application completed')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {language === 'en' ? 'Complete' : 'ಪೂರ್ಣಗೊಳಿಸಿ'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      {showApplicationDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{language === 'en' ? 'Application Details' : 'ಅರ್ಜಿ ವಿವರಗಳು'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApplicationDetails(false)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Application ID:</strong> {selectedApplication.application_id}</div>
                  <div><strong>Service:</strong> {selectedApplication.service_type}</div>
                  <div><strong>Applicant:</strong> {selectedApplication.applicant_name}</div>
                  <div><strong>Phone:</strong> {selectedApplication.phone_number}</div>
                  <div><strong>Email:</strong> {selectedApplication.email}</div>
                  <div><strong>Status:</strong> {selectedApplication.status}</div>
                  <div><strong>Submitted:</strong> {new Date(selectedApplication.created_at).toLocaleString()}</div>
                  {selectedApplication.payment_amount && (
                    <div><strong>Payment:</strong> ₹{selectedApplication.payment_amount} ({selectedApplication.payment_status})</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;