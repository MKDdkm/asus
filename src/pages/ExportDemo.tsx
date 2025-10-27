import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExportToExcel, { ExportCitizensButton, ExportApplicationsButton } from "@/components/ExportToExcel";
import { Download, FileSpreadsheet, Database } from "lucide-react";

const ExportDemo: React.FC = () => {
  const [citizens, setCitizens] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://asus-2.onrender.com/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch citizens
      const citizensRes = await fetch(`${API_BASE_URL}/citizens`);
      const citizensData = await citizensRes.json();
      if (citizensData.success) {
        setCitizens(citizensData.data || []);
      }

      // Fetch applications
      const appsRes = await fetch(`${API_BASE_URL}/applications`);
      const appsData = await appsRes.json();
      if (appsData.success) {
        setApplications(appsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demo
  const sampleCitizens = [
    {
      id: 1,
      citizen_id: 'CIT001',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '9876543210',
      district: 'Bangalore Urban',
      status: 'active'
    },
    {
      id: 2,
      citizen_id: 'CIT002',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543211',
      district: 'Mysore',
      status: 'active'
    }
  ];

  const sampleApplications = [
    {
      application_id: 'DR001',
      service_type: 'Driving License',
      applicant_name: 'Rajesh Kumar',
      phone_number: '9876543210',
      status: 'approved',
      payment_amount: 1500,
      created_at: '2025-10-20'
    },
    {
      application_id: 'DR002',
      service_type: 'Driving License',
      applicant_name: 'Priya Sharma',
      phone_number: '9876543211',
      status: 'pending',
      payment_amount: 1500,
      created_at: '2025-10-21'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            Export to Excel - Demo
          </h1>
          <p className="text-gray-600 mt-2">Test the Excel export functionality</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <Database className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Export Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Citizens Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Citizens Data
            </CardTitle>
            <CardDescription>
              Download all citizens information as Excel file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Available Data:</strong> {citizens.length > 0 ? citizens.length : sampleCitizens.length} citizens
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Columns:</strong> ID, Name, Email, Phone, District, Status
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Production Data:</p>
              <ExportCitizensButton data={citizens.length > 0 ? citizens : []} />
              
              <p className="text-sm font-medium mt-4">Sample Data (for testing):</p>
              <ExportToExcel
                data={sampleCitizens}
                filename="sample_citizens"
                sheetName="Citizens"
                buttonText="Export Sample Citizens"
                variant="secondary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Applications Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Applications Data
            </CardTitle>
            <CardDescription>
              Download all applications as Excel file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Available Data:</strong> {applications.length > 0 ? applications.length : sampleApplications.length} applications
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Columns:</strong> ID, Service, Name, Phone, Status, Amount, Date
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Production Data:</p>
              <ExportApplicationsButton data={applications.length > 0 ? applications : []} />
              
              <p className="text-sm font-medium mt-4">Sample Data (for testing):</p>
              <ExportToExcel
                data={sampleApplications}
                filename="sample_applications"
                sheetName="Applications"
                buttonText="Export Sample Applications"
                variant="secondary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>Preview of data that will be exported</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Citizens Preview */}
            <div>
              <h3 className="font-semibold mb-2">Citizens ({citizens.length || sampleCitizens.length})</h3>
              <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(citizens.length > 0 ? citizens.slice(0, 2) : sampleCitizens, null, 2)}</pre>
              </div>
            </div>

            {/* Applications Preview */}
            <div>
              <h3 className="font-semibold mb-2">Applications ({applications.length || sampleApplications.length})</h3>
              <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(applications.length > 0 ? applications.slice(0, 2) : sampleApplications, null, 2)}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">📋 How to Use</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>1. Click any "Export" button to download Excel file</p>
          <p>2. File will be saved with current date: <code>filename_2025-10-26.xlsx</code></p>
          <p>3. Open in Microsoft Excel, Google Sheets, or LibreOffice</p>
          <p>4. All columns are auto-sized for readability</p>
          <p>5. You can edit, filter, and analyze the data in Excel</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportDemo;
