import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Database, 
  RefreshCw, 
  Download,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  CreditCard,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";

const DataViewer = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'citizens' | 'applications' | 'payments' | 'notifications'>('citizens');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'https://asus-2.onrender.com/api';

  const fetchData = async (endpoint: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    fetchData(tab);
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_${new Date().toISOString()}.json`;
    link.click();
  };

  const filteredData = data.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    return JSON.stringify(item).toLowerCase().includes(searchStr);
  });

  const tabs = [
    { id: 'citizens' as const, label: 'Citizens', icon: Users, color: 'bg-blue-500' },
    { id: 'applications' as const, label: 'Applications', icon: FileText, color: 'bg-green-500' },
    { id: 'payments' as const, label: 'Payments', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🗄️ {language === 'en' ? 'Backend Data Viewer' : 'ಬ್ಯಾಕೆಂಡ್ ಡೇಟಾ ವೀಕ್ಷಕ'}
              </h1>
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'View and inspect data from Render backend database'
                  : 'ರೆಂಡರ್ ಬ್ಯಾಕೆಂಡ್ ಡೇಟಾಬೇಸ್‌ನಿಂದ ಡೇಟಾವನ್ನು ವೀಕ್ಷಿಸಿ'
                }
              </p>
              <Badge className="mt-2 bg-green-100 text-green-800">
                🌐 Connected to: {API_BASE}
              </Badge>
            </div>
            <div className="flex gap-2">
              <BackButton to="/admin" label={language === 'en' ? 'Admin' : 'ಅಡ್ಮಿನ್'} variant="outline" />
              <BackButton label={language === 'en' ? 'Go Back' : 'ಹಿಂದೆ'} variant="outline" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Card
                key={tab.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  activeTab === tab.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${tab.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <p className="font-semibold text-gray-900">{tab.label}</p>
                  <Badge className="mt-2" variant="outline">
                    {data.length} records
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={() => fetchData(activeTab)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={20} />
                {loading ? 'Loading...' : 'Refresh Data'}
              </Button>
              <Button 
                onClick={downloadJSON}
                variant="outline"
                disabled={data.length === 0}
              >
                <Download className="mr-2" size={20} />
                Download JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-800">
                <XCircle className="mr-2" size={20} />
                <p><strong>Error:</strong> {error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                <Database className="inline mr-2" size={24} />
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data
              </span>
              <Badge className="text-lg px-4 py-2">
                {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time data from Render backend database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                <p className="text-gray-600">Loading data from backend...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Database className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 text-lg mb-2">No data found</p>
                <p className="text-gray-500">Click "Refresh Data" to fetch from backend</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table View for Citizens */}
                {activeTab === 'citizens' && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-3 text-left">ID</th>
                          <th className="border p-3 text-left">Name</th>
                          <th className="border p-3 text-left">Email</th>
                          <th className="border p-3 text-left">Phone</th>
                          <th className="border p-3 text-left">Status</th>
                          <th className="border p-3 text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((citizen, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border p-3">{citizen.citizen_id || citizen.id}</td>
                            <td className="border p-3 font-semibold">{citizen.name}</td>
                            <td className="border p-3">{citizen.email}</td>
                            <td className="border p-3">{citizen.phone}</td>
                            <td className="border p-3">
                              <Badge className={
                                citizen.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }>
                                {citizen.status}
                              </Badge>
                            </td>
                            <td className="border p-3 text-sm text-gray-600">
                              {new Date(citizen.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Table View for Applications */}
                {activeTab === 'applications' && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-3 text-left">App ID</th>
                          <th className="border p-3 text-left">Service</th>
                          <th className="border p-3 text-left">Applicant</th>
                          <th className="border p-3 text-left">Status</th>
                          <th className="border p-3 text-left">Payment</th>
                          <th className="border p-3 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((app, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border p-3 font-mono text-sm">{app.application_id}</td>
                            <td className="border p-3">{app.service_type}</td>
                            <td className="border p-3">{app.applicant_name}</td>
                            <td className="border p-3">
                              <Badge className={
                                app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                app.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {app.status}
                              </Badge>
                            </td>
                            <td className="border p-3">
                              {app.payment_amount ? `₹${app.payment_amount}` : '-'}
                            </td>
                            <td className="border p-3 text-sm text-gray-600">
                              {new Date(app.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* JSON View for Payments & Notifications */}
                {(activeTab === 'payments' || activeTab === 'notifications') && (
                  <div className="space-y-4">
                    {filteredData.map((item, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <pre className="bg-white p-4 rounded overflow-x-auto text-xs">
                            {JSON.stringify(item, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Raw JSON Toggle */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-blue-600 font-semibold hover:text-blue-800">
                    👁️ View Raw JSON ({filteredData.length} items)
                  </summary>
                  <div className="mt-4 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(filteredData, null, 2)}</pre>
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataViewer;
