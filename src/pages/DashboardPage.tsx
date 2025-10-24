import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Calendar,
  MapPin,
  Download,
  Star,
  Eye
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import BackButton from "@/components/BackButton";

interface Application {
  id: string;
  type: string;
  applicantName: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed';
  submittedDate: string;
  lastUpdated: string;
  rtoLocation?: string;
  trackingNumber: string;
  paymentStatus: 'paid' | 'pending';
  paymentAmount: number;
  estimatedCompletion?: string;
}

const DashboardPage = () => {
  const { language, t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://asus-2.onrender.com/api';

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // In production, this would fetch from backend
      // const response = await fetch(`${API_BASE_URL}/applications/user/${userId}`);
      // const data = await response.json();
      
      // Mock data for demo
      const mockApplications: Application[] = [
        {
          id: 'APP001',
          type: 'Driving License',
          applicantName: 'Rajesh Kumar',
          status: 'approved',
          submittedDate: '2024-10-20',
          lastUpdated: '2024-10-24',
          rtoLocation: 'KA-19 Mangalore',
          trackingNumber: 'DL2024001234',
          paymentStatus: 'paid',
          paymentAmount: 500,
          estimatedCompletion: '2024-10-28'
        },
        {
          id: 'APP002',
          type: 'Vehicle Registration',
          applicantName: 'Rajesh Kumar',
          status: 'processing',
          submittedDate: '2024-10-22',
          lastUpdated: '2024-10-25',
          rtoLocation: 'KA-19 Mangalore',
          trackingNumber: 'VR2024005678',
          paymentStatus: 'paid',
          paymentAmount: 1200
        },
        {
          id: 'APP003',
          type: 'Ration Card',
          applicantName: 'Rajesh Kumar',
          status: 'pending',
          submittedDate: '2024-10-25',
          lastUpdated: '2024-10-25',
          trackingNumber: 'RC2024009876',
          paymentStatus: 'pending',
          paymentAmount: 0
        }
      ];

      setApplications(mockApplications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'processing':
        return <Clock className="text-blue-600 animate-pulse" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    const variants: Record<Application['status'], string> = {
      approved: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusProgress = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 25;
      case 'processing': return 50;
      case 'approved': return 75;
      case 'completed': return 100;
      case 'rejected': return 0;
      default: return 0;
    }
  };

  const filterApplications = (status: string) => {
    if (status === 'all') return applications;
    return applications.filter(app => app.status === status);
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    processing: applications.filter(a => a.status === 'processing').length,
    approved: applications.filter(a => a.status === 'approved' || a.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'My Dashboard' : 'ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್'}
          </h1>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Track all your government applications in one place'
              : 'ನಿಮ್ಮ ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಅರ್ಜಿಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ'
            }
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Processing</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.processing}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">
              {language === 'en' ? 'My Applications' : 'ನನ್ನ ಅರ್ಜಿಗಳು'}
            </CardTitle>
            <CardDescription className="text-white/90">
              {language === 'en' 
                ? 'View and track all your submitted applications'
                : 'ನಿಮ್ಮ ಸಲ್ಲಿಸಿದ ಎಲ್ಲಾ ಅರ್ಜಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <div className="space-y-4">
                  {filterApplications(activeTab).length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {language === 'en' ? 'No applications found' : 'ಯಾವುದೇ ಅರ್ಜಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ'}
                      </p>
                    </div>
                  ) : (
                    filterApplications(activeTab).map((app) => (
                      <Card key={app.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Left Section */}
                            <div className="flex-1">
                              <div className="flex items-start gap-4">
                                {getStatusIcon(app.status)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{app.type}</h3>
                                    {getStatusBadge(app.status)}
                                  </div>
                                  
                                  <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-2">
                                      <FileText size={16} className="text-gray-400" />
                                      <span>Tracking: <strong>{app.trackingNumber}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar size={16} className="text-gray-400" />
                                      <span>Submitted: {new Date(app.submittedDate).toLocaleDateString()}</span>
                                    </div>
                                    {app.rtoLocation && (
                                      <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span>{app.rtoLocation}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        app.paymentStatus === 'paid' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        Payment: {app.paymentStatus === 'paid' ? `₹${app.paymentAmount} Paid` : 'Pending'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Progress</span>
                                      <span className="font-semibold text-gray-900">{getStatusProgress(app.status)}%</span>
                                    </div>
                                    <Progress value={getStatusProgress(app.status)} className="h-2" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Section - Actions */}
                            <div className="flex flex-col gap-2 lg:ml-4">
                              <Link to={`/application/${app.id}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                  <Eye size={16} className="mr-2" />
                                  View Details
                                </Button>
                              </Link>
                              {app.status === 'approved' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full">
                                  <Download size={16} className="mr-2" />
                                  Download
                                </Button>
                              )}
                              {app.status === 'completed' && (
                                <Link to={`/feedback/${app.id}`}>
                                  <Button size="sm" variant="outline" className="w-full">
                                    <Star size={16} className="mr-2" />
                                    Rate Service
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link to="/demo">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              <FileText className="mr-2" size={20} />
              {language === 'en' ? 'Apply for New Service' : 'ಹೊಸ ಸೇವೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
