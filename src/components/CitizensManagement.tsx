import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, UserPlus, Users } from "lucide-react";
import { ExportCitizensButton } from "@/components/ExportToExcel";

interface Citizen {
  id: number;
  citizen_id: string;
  name: string;
  name_kannada?: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth?: string;
  gender?: string;
  occupation?: string;
  district?: string;
  pincode?: string;
  status: string;
  created_at: string;
}

interface CitizenFormData {
  name: string;
  name_kannada: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: string;
  occupation: string;
  district: string;
  pincode: string;
}

const CitizensManagement: React.FC = () => {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);
  const [formData, setFormData] = useState<CitizenFormData>({
    name: '',
    name_kannada: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    occupation: '',
    district: '',
    pincode: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://asus-2.onrender.com/api';

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      // Add cache-busting timestamp and no-cache headers for mobile
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/citizens?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      
      console.log('📱 Fetched citizens:', data.data?.length || 0, 'citizens');
      
      if (data.success) {
        // Handle both array and object responses from Firebase/JSON
        const citizensData = Array.isArray(data.data) ? data.data : [];
        setCitizens(citizensData);
      } else {
        setError('Failed to fetch citizens');
      }
    } catch (err) {
      setError('Failed to connect to backend server');
      console.error('Error fetching citizens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    try {
      const url = editingCitizen 
        ? `${API_BASE_URL}/citizens/${editingCitizen.citizen_id}`
        : `${API_BASE_URL}/citizens`;
      
      const method = editingCitizen ? 'PUT' : 'POST';
      
      console.log('Submitting citizen:', formData); // Debug log
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Response:', data); // Debug log

      if (data.success) {
        const message = editingCitizen ? 'Citizen updated successfully!' : 'Citizen added successfully!';
        setSuccess(message);
        setShowForm(false);
        setEditingCitizen(null);
        resetForm();
        
        // Scroll to top to show success message (important for mobile)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Force refresh the list after a small delay to ensure DB sync
        setTimeout(async () => {
          console.log('🔄 Force refreshing citizen list...');
          await fetchCitizens();
        }, 500);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Operation failed');
        console.error('Operation failed:', data);
      }
    } catch (err) {
      setError('Failed to save citizen. Please check your connection.');
      console.error('Error saving citizen:', err);
    }
  };

  const handleEdit = (citizen: Citizen) => {
    setEditingCitizen(citizen);
    setFormData({
      name: citizen.name,
      name_kannada: citizen.name_kannada || '',
      email: citizen.email,
      phone: citizen.phone,
      address: citizen.address,
      date_of_birth: citizen.date_of_birth || '',
      gender: citizen.gender || '',
      occupation: citizen.occupation || '',
      district: citizen.district || '',
      pincode: citizen.pincode || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (citizen: Citizen) => {
    if (!confirm(`Are you sure you want to delete ${citizen.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/citizens/${citizen.citizen_id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Citizen deleted successfully!');
        fetchCitizens();
      } else {
        setError(data.message || 'Failed to delete citizen');
      }
    } catch (err) {
      setError('Failed to delete citizen');
      console.error('Error deleting citizen:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_kannada: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '',
      gender: '',
      occupation: '',
      district: '',
      pincode: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCitizen(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading citizens...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Citizens Management
          </h1>
          <p className="text-gray-600 mt-2">Manage citizen registrations and information</p>
        </div>
        <div className="flex gap-2">
          <ExportCitizensButton data={citizens} />
          <Button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add New Citizen
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50 animate-in slide-in-from-top">
          <AlertDescription className="text-red-800 font-semibold">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 animate-in slide-in-from-top">
          <AlertDescription className="text-green-800 font-semibold text-lg">{success}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingCitizen ? 'Edit Citizen' : 'Add New Citizen'}
            </CardTitle>
            <CardDescription>
              {editingCitizen ? 'Update citizen information' : 'Enter citizen details to register'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="name_kannada">Name in Kannada</Label>
                  <Input
                    id="name_kannada"
                    value={formData.name_kannada}
                    onChange={(e) => setFormData({ ...formData, name_kannada: e.target.value })}
                    placeholder="ಹೆಸರು ಕನ್ನಡದಲ್ಲಿ"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="citizen@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="9876543210"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    placeholder="Complete address"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Profession/Job"
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="District name"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="560001"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {editingCitizen ? 'Update Citizen' : 'Add Citizen'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Citizens List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Citizens ({citizens.length})</CardTitle>
          <CardDescription>
            List of all registered citizens in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {citizens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No citizens registered yet. Add the first citizen to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {citizens.map((citizen) => (
                <div key={citizen.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{citizen.name}</h3>
                      {citizen.name_kannada && (
                        <span className="text-gray-600">({citizen.name_kannada})</span>
                      )}
                      <Badge variant={citizen.status === 'active' ? 'default' : 'secondary'}>
                        {citizen.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div><strong>ID:</strong> {citizen.citizen_id}</div>
                      <div><strong>Email:</strong> {citizen.email}</div>
                      <div><strong>Phone:</strong> {citizen.phone}</div>
                      <div><strong>District:</strong> {citizen.district || 'N/A'}</div>
                      <div><strong>Occupation:</strong> {citizen.occupation || 'N/A'}</div>
                      <div><strong>Registered:</strong> {new Date(citizen.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(citizen)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(citizen)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizensManagement;