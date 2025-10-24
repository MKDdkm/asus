import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import VoiceField from "@/components/VoiceField";
import VoiceInput from "@/components/VoiceInput";
import PaymentSystem from "@/components/PaymentSystem";
import DigiLockerIntegration from "@/components/DigiLockerIntegration";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  FileText,
  Camera,
  Zap,
  ArrowLeft,
  Shield,
  Mic,
  CreditCard
} from "lucide-react";
import { Link } from "react-router-dom";

interface UserData {
  name: string;
  nameKannada: string;
  aadhaar: string;
  address: string;
  addressKannada: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  pincode: string;
  district: string;
  state: string;
  fatherName: string;
  motherName: string;
  qualification: string;
  occupation: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  bloodGroup: string;
}

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

const DrivingLicenseService = () => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [licenseType, setLicenseType] = useState('Two Wheeler');
  const [vehicleType, setVehicleType] = useState(''); // New: Two Wheeler or Four Wheeler
  const [applicationType, setApplicationType] = useState(''); // New: Fresh or Renewal
  const [selectedRTO, setSelectedRTO] = useState(''); // New: Selected RTO
  const [signature, setSignature] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  // New states for citizens management
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loadingCitizens, setLoadingCitizens] = useState(true);
  
  // Editable form fields
  const [editableData, setEditableData] = useState<UserData | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // RTO Data for Karnataka with GPS coordinates
  const rtoLocations = [
    { code: 'KA-01', name: 'Bangalore East', district: 'Bangalore Urban', distance: '5 km', lat: 12.9716, lng: 77.5946, address: 'Indiranagar, Bangalore' },
    { code: 'KA-02', name: 'Bangalore West', district: 'Bangalore Urban', distance: '8 km', lat: 12.9698, lng: 77.5157, address: 'Rajajinagar, Bangalore' },
    { code: 'KA-03', name: 'Bangalore North', district: 'Bangalore Urban', distance: '10 km', lat: 13.0358, lng: 77.5970, address: 'Hebbal, Bangalore' },
    { code: 'KA-04', name: 'Bangalore South', district: 'Bangalore Urban', distance: '7 km', lat: 12.9141, lng: 77.6411, address: 'Jayanagar, Bangalore' },
    { code: 'KA-05', name: 'Bangalore Central', district: 'Bangalore Urban', distance: '3 km', lat: 12.9762, lng: 77.6033, address: 'MG Road, Bangalore' },
    { code: 'KA-19', name: 'Mangalore', district: 'Dakshina Kannada', distance: '350 km', lat: 12.9141, lng: 74.8560, address: 'Kankanady, Mangalore' },
    { code: 'KA-20', name: 'Udupi', district: 'Udupi', distance: '400 km', lat: 13.3409, lng: 74.7421, address: 'Court Road, Udupi' },
    { code: 'KA-21', name: 'Puttur', district: 'Dakshina Kannada', distance: '380 km', lat: 12.7593, lng: 75.2067, address: 'B C Road, Puttur' },
    { code: 'KA-09', name: 'Mysore', district: 'Mysore', distance: '140 km', lat: 12.2958, lng: 76.6394, address: 'Saraswathipuram, Mysore' },
    { code: 'KA-10', name: 'Tumkur', district: 'Tumkur', distance: '70 km', lat: 13.3379, lng: 77.1006, address: 'Amanikere, Tumkur' },
    { code: 'KA-13', name: 'Hassan', district: 'Hassan', distance: '185 km', lat: 13.0072, lng: 76.1004, address: 'BM Road, Hassan' },
    { code: 'KA-14', name: 'Mandya', district: 'Mandya', distance: '100 km', lat: 12.5244, lng: 76.8958, address: 'Ashoka Road, Mandya' },
    { code: 'KA-15', name: 'Belgaum', district: 'Belgaum', distance: '500 km', lat: 15.8497, lng: 74.4977, address: 'Tilakwadi, Belgaum' },
    { code: 'KA-16', name: 'Hubli', district: 'Dharwad', distance: '410 km', lat: 15.3647, lng: 75.1240, address: 'Gokul Road, Hubli' },
    { code: 'KA-18', name: 'Shimoga', district: 'Shimoga', distance: '275 km', lat: 13.9299, lng: 75.5681, address: 'Vinoba Road, Shimoga' },
  ];

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1000)} m` : `${Math.round(distance)} km`;
  };

  // Calculate distance as number (for sorting)
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Fetch citizens on component mount
  const fetchCitizens = useCallback(async () => {
    try {
      setLoadingCitizens(true);
      const response = await fetch(`${API_BASE_URL}/citizens`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch citizens');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setCitizens(data.data);
      } else {
        setCitizens([]);
      }
    } catch (err) {
      console.error('Error fetching citizens:', err);
      // If backend is not available, use empty array (fallback to demo data)
      setCitizens([]);
    } finally {
      setLoadingCitizens(false);
    }
  }, []);

  useEffect(() => {
    fetchCitizens();
  }, [fetchCitizens]);

  // Enhanced Aadhaar data fetch with realistic profiles
  const fetchAadhaarData = async (aadhaar: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // First, check if this aadhaar matches a citizen from database
    const citizenMatch = citizens.find(c => c.citizen_id === aadhaar);
    
    if (citizenMatch) {
      // Use citizen data from backend
      const mockData: UserData = {
        name: citizenMatch.name,
        nameKannada: citizenMatch.name_kannada || citizenMatch.name,
        aadhaar: aadhaar,
        address: citizenMatch.address,
        addressKannada: citizenMatch.address,
        phone: citizenMatch.phone,
        email: citizenMatch.email,
        dob: citizenMatch.date_of_birth || "1990-01-01",
        gender: citizenMatch.gender || "Male",
        pincode: citizenMatch.pincode || "560001",
        district: citizenMatch.district || "Bangalore Urban",
        state: "Karnataka",
        fatherName: "Father Name",
        motherName: "Mother Name",
        qualification: "Graduate",
        occupation: citizenMatch.occupation || "Professional",
        nationality: "Indian",
        religion: "Hindu",
        maritalStatus: "Single",
        bloodGroup: "O+"
      };
      
      setUserData(mockData);
      setEditableData(mockData);
      setStep(1.5); // Go to selection step first
      setIsLoading(false);
      return;
    }
    
    // Fallback to demo profiles if not found in database
    const profiles = {
      '123456789012': {
        name: "Rajesh Kumar",
        nameKannada: "ರಾಜೇಶ್ ಕುಮಾರ್",
        address: "No. 45, 2nd Cross, Jayanagar 4th Block, Bangalore",
        addressKannada: "ಸಂ. ೪೫, ೨ನೇ ಅಡ್ಡರಸ್ತೆ, ಜಯನಗರ ೪ನೇ ಬ್ಲಾಕ್, ಬೆಂಗಳೂರು",
        phone: "+91 9876543210",
        email: "rajesh.kumar@gmail.com",
        dob: "1990-03-15",
        gender: "Male",
        pincode: "560011",
        district: "Bangalore Urban",
        fatherName: "ಸುರೇಶ್ ಕುಮಾರ್",
        motherName: "ಲಕ್ಷ್ಮೀ ದೇವಿ"
      },
      '987654321098': {
        name: "Priya Sharma",
        nameKannada: "ಪ್ರಿಯಾ ಶರ್ಮಾ",
        address: "No. 78, MG Road, Mysore",
        addressKannada: "ಸಂ. ೭೮, ಎಂಜಿ ರೋಡ್, ಮೈಸೂರು",
        phone: "+91 8765432109",
        email: "priya.sharma@gmail.com",
        dob: "1992-08-22",
        gender: "Female",
        pincode: "570001",
        district: "Mysore",
        fatherName: "ಮೋಹನ್ ಶರ್ಮಾ",
        motherName: "ಸುನೀತಾ ಶರ್ಮಾ"
      },
      '555666777888': {
        name: "Kiran Reddy",
        nameKannada: "ಕಿರಣ್ ರೆಡ್ಡಿ",
        address: "Plot No. 12, HSR Layout, Bangalore",
        addressKannada: "ಪ್ಲಾಟ್ ಸಂ. ೧೨, ಎಚ್ಎಸ್ಆರ್ ಲೇಔಟ್, ಬೆಂಗಳೂರು",
        phone: "+91 7654321098",
        email: "kiran.reddy@gmail.com",
        dob: "1988-12-10",
        gender: "Male",
        pincode: "560102",
        district: "Bangalore Urban",
        fatherName: "ವೆಂಕಟ್ ರೆಡ್ಡಿ",
        motherName: "ಪದ್ಮಾ ರೆಡ್ಡಿ"
      }
    };
    
    // Get profile or use default
    const profile = profiles[aadhaar as keyof typeof profiles] || {
      name: "Demo User",
      nameKannada: "ಡೆಮೋ ಬಳಕೆದಾರ",
      address: "Karnataka Government Demo Address, Bangalore",
      addressKannada: "ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಡೆಮೋ ವಿಳಾಸ, ಬೆಂಗಳೂರು",
      phone: "+91 9999999999",
      email: "demo@karnataka.gov.in",
      dob: "1990-01-01",
      gender: "Male",
      pincode: "560001",
      district: "Bangalore Urban",
      fatherName: "ಡೆಮೋ ತಂದೆ",
      motherName: "ಡೆಮೋ ತಾಯಿ"
    };
    
    const mockData: UserData = {
      ...profile,
      aadhaar: aadhaar,
      state: "Karnataka",
      qualification: "B.Tech Computer Science",
      occupation: "Software Engineer",
      nationality: "Indian",
      religion: "Hindu",
      maritalStatus: "Single",
      bloodGroup: "B+"
    };
    
    setUserData(mockData);
    setEditableData({ ...mockData }); // Initialize editable data
    setIsLoading(false);
    setStep(1.5); // Go to selection step first
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhoto(e.target?.result as string);
        setStep(3);
      };
      reader.readAsDataURL(file);
    }
  };

  // Digital Signature Component
  const SignatureCanvas = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(x, y);
        }
      }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#000';
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const clearSignature = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    const saveSignature = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const signatureData = canvas.toDataURL();
        setSignature(signatureData);
        setIsSignatureModalOpen(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
        <div className="flex space-x-3 justify-center">
          <Button onClick={clearSignature} variant="outline" size="sm">
            Clear
          </Button>
          <Button onClick={saveSignature} size="sm" className="bg-blue-600 hover:bg-blue-700">
            Save Signature
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Draw your signature above using your mouse or touchpad
        </p>
      </div>
    );
  };

  const generatePDF = () => {
    if (!userData || !uploadedPhoto || !signature) {
      alert("Missing required data! Please ensure you have uploaded a photo and added your digital signature.");
      return;
    }
    generateColorfulPDF();
  };

  const generateSimplePDF = () => {
    if (!userData || !uploadedPhoto || !signature) {
      alert("Missing required data! Please ensure you have uploaded a photo and added your digital signature.");
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-IN');
    const applicationNumber = `KA${Date.now()}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Driving License Application - ${userData.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .form-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .form-table th, .form-table td { border: 1px solid #000; padding: 8px; text-align: left; }
          .form-table th { background-color: #f0f0f0; font-weight: bold; }
          .photo-box { float: right; border: 2px solid #000; padding: 5px; margin: 0 0 20px 20px; }
          .photo-box img { width: 120px; height: 150px; object-fit: cover; }
          .signature-section { margin-top: 40px; }
          .signature-box { display: inline-block; margin-right: 100px; }
          .declaration { border: 1px solid #000; padding: 15px; margin: 20px 0; background-color: #f9f9f9; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GOVERNMENT OF KARNATAKA</h1>
          <h2>TRANSPORT DEPARTMENT</h2>
          <h3>APPLICATION FOR DRIVING LICENSE</h3>
          <p>Application No: ${applicationNumber} | Date: ${currentDate}</p>
        </div>
        
        <div class="photo-box">
          <img src="${uploadedPhoto}" alt="Applicant Photo" />
          <p style="text-align: center; margin: 5px 0 0 0; font-size: 12px;">Applicant Photo</p>
        </div>
        
        <table class="form-table">
          <tr><th>Full Name</th><td>${userData.name}</td></tr>
          <tr><th>Name (Kannada)</th><td>${userData.nameKannada}</td></tr>
          <tr><th>Father's Name</th><td>${userData.fatherName}</td></tr>
          <tr><th>Mother's Name</th><td>${userData.motherName}</td></tr>
          <tr><th>Aadhaar Number</th><td>${userData.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</td></tr>
          <tr><th>Date of Birth</th><td>${new Date(userData.dob).toLocaleDateString('en-IN')}</td></tr>
          <tr><th>Gender</th><td>${userData.gender}</td></tr>
          <tr><th>Blood Group</th><td>${userData.bloodGroup}</td></tr>
          <tr><th>Marital Status</th><td>${userData.maritalStatus}</td></tr>
          <tr><th>Nationality</th><td>${userData.nationality}</td></tr>
          <tr><th>Religion</th><td>${userData.religion}</td></tr>
          <tr><th>Qualification</th><td>${userData.qualification}</td></tr>
          <tr><th>Occupation</th><td>${userData.occupation}</td></tr>
          <tr><th>Phone</th><td>${userData.phone}</td></tr>
          <tr><th>Email</th><td>${userData.email}</td></tr>
          <tr><th>Address</th><td>${userData.address}</td></tr>
          <tr><th>District</th><td>${userData.district}</td></tr>
          <tr><th>State</th><td>${userData.state}</td></tr>
          <tr><th>Pincode</th><td>${userData.pincode}</td></tr>
          <tr><th>License Type</th><td>${licenseType}</td></tr>
        </table>
        
        <div class="declaration">
          <strong>Declaration:</strong> I hereby declare that the information provided above is true and correct to the best of my knowledge and belief.
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <img src="${signature}" alt="Digital Signature" style="max-width: 200px; max-height: 60px; object-fit: contain; border: 1px solid #ccc; padding: 5px;" />
            <p>Applicant's Signature</p>
          </div>
          <div class="signature-box">
            <p>Date: ${currentDate}</p>
          </div>
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          <p>✅ Auto-filled by Karnataka Mitra AI Assistant</p>
          <p>📱 No middleman required - Direct government service</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DL_Application_Simple_${userData.name.replace(/\s+/g, '_')}_${applicationNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Set application ID and go to payment step
    setApplicationId(applicationNumber);
    setStep(4);
  };

  const generateColorfulPDF = () => {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const applicationNumber = `KA${Date.now()}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Driving License Application - ${userData.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Poppins', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
          .container { max-width: 900px; margin: 0 auto; background: #fff; border-radius: 25px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
          
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-align: center; padding: 40px 30px; position: relative; }
          .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/></svg>'); }
          .header h1 { font-size: 2.5rem; margin-bottom: 10px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); position: relative; z-index: 2; }
          .header h2 { font-size: 1.3rem; font-weight: 400; margin-bottom: 15px; opacity: 0.9; position: relative; z-index: 2; }
          .header .meta { font-size: 1rem; background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; display: inline-block; position: relative; z-index: 2; }
          
          .content { padding: 40px; }
          .photo-section { text-align: center; margin-bottom: 40px; }
          .photo-container { display: inline-block; position: relative; }
          .photo-box { border: 4px solid #667eea; border-radius: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
          .photo-box img { width: 140px; height: 180px; object-fit: cover; border-radius: 15px; }
          .photo-label { margin-top: 15px; font-size: 0.9rem; color: #667eea; font-weight: 600; }
          
          .section { margin-bottom: 35px; }
          .section-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 15px 25px; border-radius: 15px 15px 0 0; font-size: 1.2rem; font-weight: 600; display: flex; align-items: center; }
          .section-icon { margin-right: 10px; font-size: 1.4rem; }
          
          .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; background: #f8f9ff; padding: 25px; border-radius: 0 0 15px 15px; }
          .detail-item { background: #fff; padding: 15px 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-left: 4px solid #667eea; }
          .detail-label { font-size: 0.85rem; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
          .detail-value { font-size: 1rem; color: #333; font-weight: 500; }
          
          .declaration { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 15px; padding: 25px; margin: 30px 0; border-left: 5px solid #ff7b7b; }
          .declaration-title { font-size: 1.1rem; font-weight: 700; color: #d63031; margin-bottom: 10px; }
          .declaration-text { color: #2d3436; line-height: 1.6; }
          
          .signature-section { display: flex; justify-content: space-between; margin: 40px 0; }
          .signature-box { text-align: center; }
          .signature-line { width: 200px; height: 2px; background: #667eea; margin: 40px auto 10px; }
          .signature-label { color: #666; font-size: 0.9rem; }
          
          .footer { text-align: center; background: #f1f2f6; padding: 20px; border-radius: 15px; margin-top: 30px; }
          .footer-item { color: #57606f; font-size: 0.9rem; margin: 5px 0; }
          .ai-badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 8px 15px; border-radius: 20px; display: inline-block; font-size: 0.85rem; font-weight: 600; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏛️ GOVERNMENT OF KARNATAKA</h1>
            <h2>Transport Department</h2>
            <div class="meta">Application No: <strong>${applicationNumber}</strong> • Date: ${currentDate}</div>
          </div>
          
          <div class="content">
            <div class="photo-section">
              <div class="photo-container">
                <div class="photo-box">
                  <img src="${uploadedPhoto}" alt="Applicant Photo" />
                </div>
                <div class="photo-label">📸 Applicant Photograph</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-header">
                <span class="section-icon">🚗</span>
                License Application Details
              </div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">License Category</div>
                  <div class="detail-value">${licenseType}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Application Status</div>
                  <div class="detail-value">Submitted for Processing</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-header">
                <span class="section-icon">👤</span>
                Personal Information
              </div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Full Name</div>
                  <div class="detail-value">${userData.name}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Name (Kannada)</div>
                  <div class="detail-value">${userData.nameKannada}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Father's Name</div>
                  <div class="detail-value">${userData.fatherName}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Mother's Name</div>
                  <div class="detail-value">${userData.motherName}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Date of Birth</div>
                  <div class="detail-value">${new Date(userData.dob).toLocaleDateString('en-IN')}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Gender</div>
                  <div class="detail-value">${userData.gender}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Blood Group</div>
                  <div class="detail-value">${userData.bloodGroup}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Marital Status</div>
                  <div class="detail-value">${userData.maritalStatus}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Nationality</div>
                  <div class="detail-value">${userData.nationality}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Religion</div>
                  <div class="detail-value">${userData.religion}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-header">
                <span class="section-icon">🎓</span>
                Educational & Professional Details
              </div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Qualification</div>
                  <div class="detail-value">${userData.qualification}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Occupation</div>
                  <div class="detail-value">${userData.occupation}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-header">
                <span class="section-icon">📞</span>
                Contact Information
              </div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Phone Number</div>
                  <div class="detail-value">${userData.phone}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Email Address</div>
                  <div class="detail-value">${userData.email}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Emergency Contact</div>
                  <div class="detail-value">+91 9876543211</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Aadhaar Number</div>
                  <div class="detail-value">${userData.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-header">
                <span class="section-icon">🏠</span>
                Address Details
              </div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Present Address</div>
                  <div class="detail-value">${userData.address}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">District</div>
                  <div class="detail-value">${userData.district}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">State</div>
                  <div class="detail-value">${userData.state}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">PIN Code</div>
                  <div class="detail-value">${userData.pincode}</div>
                </div>
              </div>
            </div>
            
            <div class="declaration">
              <div class="declaration-title">📋 DECLARATION</div>
              <div class="declaration-text">
                I hereby declare that the information provided above is true and correct to the best of my knowledge and belief. I understand that any false information may lead to rejection of my application or cancellation of license if issued.
              </div>
            </div>
            
            <div class="signature-section">
              <div class="signature-box">
                <img src="${signature}" alt="Digital Signature" style="max-width: 200px; max-height: 60px; object-fit: contain;" />
                <div class="signature-label">Applicant's Digital Signature</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Date: ${currentDate}</div>
              </div>
            </div>
            
            <div class="footer">
              <div class="ai-badge">🤖 Auto-filled by Karnataka Mitra AI</div>
              <div class="ai-badge">🚫 No Middleman Required</div>
              <div class="ai-badge">🔒 Aadhaar Verified</div>
              <div class="footer-item">Generated on ${currentDate} | Application processed digitally</div>
              <div class="footer-item">Karnataka Mitra - Direct Government Services Platform</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DL_Application_${userData.name.replace(/\s+/g, '_')}_${applicationNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Set application ID and go to payment step
    setApplicationId(applicationNumber);
    setStep(4);
  };

  // Handle payment completion
  const handlePaymentComplete = (paymentInfo: any) => {
    setPaymentData(paymentInfo);
    setPaymentCompleted(true);
    
    // Submit application to backend
    submitApplicationToBackend(paymentInfo);
    
    setStep(4.5); // Go to RTO selection step
  };

  // Submit application to backend
  const submitApplicationToBackend = async (paymentInfo: any) => {
    try {
      // Submit application
      const applicationResponse = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: 'Driving License Application',
          applicantData: userData,
          licenseType: licenseType,
          aadhaarNumber: aadhaarNumber
        })
      });

      if (applicationResponse.ok) {
        const applicationResult = await applicationResponse.json();
        console.log('✅ Application submitted to backend:', applicationResult);
        
        // Submit payment
        const paymentResponse = await fetch(`${API_BASE_URL}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: applicationResult.data.applicationId,
            amount: paymentInfo.amount,
            paymentMethod: paymentInfo.method,
            serviceName: 'Driving License Application'
          })
        });

        if (paymentResponse.ok) {
          const paymentResult = await paymentResponse.json();
          console.log('✅ Payment submitted to backend:', paymentResult);
        } else {
          console.error('❌ Failed to submit payment to backend');
        }
      } else {
        console.error('❌ Failed to submit application to backend');
      }
    } catch (error) {
      console.error('❌ Error submitting to backend:', error);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-background dark:to-background py-8">
        <div className="container-width section-padding">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Services
          </Link>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {language === 'en' ? 'Driving License Application' : 'ಚಾಲನಾ ಪರವಾನಗಿ ಅರ್ಜಿ'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'Smart auto-fill service powered by Karnataka Mitra AI'
                  : 'ಕರ್ನಾಟಕ ಮಿತ್ರ AI ನಿಂದ ಚಾಲಿತ ಸ್ಮಾರ್ಟ್ ಆಟೋ-ಫಿಲ್ ಸೇವೆ'
                }
              </p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-8">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNum ? <CheckCircle size={16} /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card className="max-w-3xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-white text-2xl">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="text-white" size={28} />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {language === 'en' ? 'Step 1: Aadhaar Verification' : 'ಹಂತ ೧: ಆಧಾರ್ ಪರಿಶೀಲನೆ'}
                  </div>
                  <div className="text-blue-100 text-sm font-normal">
                    {language === 'en' 
                      ? 'Secure authentication with Government of India'
                      : 'ಭಾರತ ಸರ್ಕಾರದೊಂದಿಗೆ ಸುರಕ್ಷಿತ ದೃಢೀಕರಣ'
                    }
                  </div>
                </div>
              </CardTitle>
            </div>
            
            <CardContent className="p-8 space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-blue-600" size={36} />
                </div>
                <p className="text-lg text-gray-600">
                  {language === 'en' 
                    ? 'Enter your Aadhaar number to auto-fetch your personal details securely'
                    : 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತರಲು ನಿಮ್ಮ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
                  }
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="aadhaar" className="text-lg font-semibold text-gray-700">
                  {language === 'en' ? 'Aadhaar / Citizen ID' : 'ಆಧಾರ್ / ನಾಗರಿಕ ಐಡಿ'}
                </Label>
                <div className="relative">
                  <Input
                    id="aadhaar"
                    placeholder={language === 'en' ? 'Enter Aadhaar number or Citizen ID' : 'ಆಧಾರ್ ಸಂಖ್ಯೆ ಅಥವಾ ನಾಗರಿಕ ಐಡಿ ನಮೂದಿಸಿ'}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    maxLength={20}
                    className="text-xl py-6 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl shadow-sm"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Shield className="text-green-500" size={24} />
                  </div>
                </div>
                
                {/* Voice Input for Aadhaar */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mic className="text-purple-600" size={20} />
                    <span className="text-sm font-semibold text-purple-700">
                      {language === 'en' ? 'Voice Input Available' : 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಲಭ್ಯವಿದೆ'}
                    </span>
                  </div>
                  <VoiceInput
                    onTranscript={(text) => {
                      // Extract numbers and letters from voice input
                      const cleanText = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                      if (cleanText.length <= 20) {
                        setAadhaarNumber(cleanText);
                      }
                    }}
                    placeholder={language === 'en' ? 'Speak your Aadhaar or Citizen ID' : 'ನಿಮ್ಮ ಆಧಾರ್ ಅಥವಾ ನಾಗರಿಕ ಐಡಿ ಹೇಳಿ'}
                  />
                </div>
                
                {/* Enhanced Sample Aadhaar Numbers - Dynamic from Database */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 shadow-inner">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">
                      {language === 'en' ? 'Select from registered citizens:' : 'ನೋಂದಾಯಿತ ನಾಗರಿಕರಿಂದ ಆಯ್ಕೆಮಾಡಿ:'}
                    </p>
                  </div>
                  
                  {loadingCitizens ? (
                    <div className="text-center py-4 text-gray-500">
                      {language === 'en' ? 'Loading citizens...' : 'ನಾಗರಿಕರನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...'}
                    </div>
                  ) : (
                    <>
                      {/* Citizens from Database */}
                      {citizens.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">
                            {language === 'en' ? 'Registered Citizens:' : 'ನೋಂದಾಯಿತ ನಾಗರಿಕರು:'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            {citizens.map((citizen) => (
                              <Button
                                key={citizen.id}
                                variant="outline"
                                onClick={() => setAadhaarNumber(citizen.citizen_id)}
                                className="h-auto p-4 flex flex-col items-center space-y-2 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md"
                              >
                                <div className="font-mono text-lg font-bold text-green-600">{citizen.citizen_id}</div>
                                <div className="text-sm text-gray-700 font-semibold">{citizen.name}</div>
                                <div className="text-xs text-gray-500">{citizen.district || 'Karnataka'}</div>
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                                  {language === 'en' ? 'New Citizen' : 'ಹೊಸ ನಾಗರಿಕ'}
                                </Badge>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Demo Profiles */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">
                          {language === 'en' ? 'Demo Profiles:' : 'ಡೆಮೋ ಪ್ರೊಫೈಲ್‌ಗಳು:'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { number: '123456789012', name: 'Rajesh Kumar', location: 'Bangalore' },
                            { number: '987654321098', name: 'Priya Sharma', location: 'Mysore' },
                            { number: '555666777888', name: 'Kiran Reddy', location: 'HSR Layout' }
                          ].map((demo) => (
                            <Button
                              key={demo.number}
                              variant="outline"
                              onClick={() => setAadhaarNumber(demo.number)}
                              className="h-auto p-4 flex flex-col items-center space-y-2 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md"
                            >
                              <div className="font-mono text-lg font-bold text-blue-600">{demo.number}</div>
                              <div className="text-sm text-gray-600">{demo.name}</div>
                              <div className="text-xs text-gray-500">{demo.location}</div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-3 text-center">
                        {language === 'en' 
                          ? 'Green cards = newly added citizens from Citizens Management' 
                          : 'ಹಸಿರು ಕಾರ್ಡ್‌ಗಳು = ನಾಗರಿಕ ನಿರ್ವಹಣೆಯಿಂದ ಹೊಸದಾಗಿ ಸೇರಿಸಲಾದ ನಾಗರಿಕರು'}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Enhanced Features Section */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="text-blue-600" size={24} />
                  <h4 className="text-xl font-bold text-blue-900">
                    {language === 'en' ? 'How it works:' : 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ:'}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-800">
                        {language === 'en' ? 'Secure OTP Verification' : 'ಸುರಕ್ಷಿತ OTP ಪರಿಶೀಲನೆ'}
                      </h5>
                      <p className="text-sm text-blue-700">
                        {language === 'en' 
                          ? 'Government-grade security with Aadhaar OTP'
                          : 'ಆಧಾರ್ OTP ನೊಂದಿಗೆ ಸರ್ಕಾರಿ ದರ್ಜೆಯ ಭದ್ರತೆ'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-green-800">
                        {language === 'en' ? 'Auto Data Fetch' : 'ಸ್ವಯಂ ಡೇಟಾ ಪಡೆಯುವಿಕೆ'}
                      </h5>
                      <p className="text-sm text-green-700">
                        {language === 'en' 
                          ? 'Name, address, DOB automatically filled'
                          : 'ಹೆಸರು, ವಿಳಾಸ, ಜನ್ಮ ದಿನಾಂಕ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿ'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-purple-800">
                        {language === 'en' ? 'Zero Manual Entry' : 'ಶೂನ್ಯ ಕೈಯಾರೆ ನಮೂದು'}
                      </h5>
                      <p className="text-sm text-purple-700">
                        {language === 'en' 
                          ? 'No typing, no errors, no hassle!'
                          : 'ಟೈಪಿಂಗ್ ಇಲ್ಲ, ದೋಷಗಳಿಲ್ಲ, ತೊಂದರೆ ಇಲ್ಲ!'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-orange-800">
                        {language === 'en' ? 'No Middleman' : 'ಮಧ್ಯವರ್ತಿ ಇಲ್ಲ'}
                      </h5>
                      <p className="text-sm text-orange-700">
                        {language === 'en' 
                          ? 'Direct government service access'
                          : 'ನೇರ ಸರ್ಕಾರಿ ಸೇವೆ ಪ್ರವೇಶ'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Verify Button */}
              <div className="text-center pt-4">
                <Button
                  onClick={() => fetchAadhaarData(aadhaarNumber)}
                  disabled={aadhaarNumber.length < 6 || isLoading}
                  size="lg"
                  className="w-full md:w-auto px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>
                        {language === 'en' ? 'Verifying...' : 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Shield size={24} />
                      <span>
                        {language === 'en' ? 'Verify & Proceed' : 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮುಂದುವರಿಸಿ'}
                      </span>
                    </div>
                  )}
                </Button>
                
                {aadhaarNumber.length > 0 && aadhaarNumber.length !== 12 && (
                  <p className="text-red-500 text-sm mt-2">
                    {language === 'en' 
                      ? 'Please enter a valid ID (minimum 6 characters)'
                      : 'ಮಾನ್ಯವಾದ ಐಡಿ ನಮೂದಿಸಿ (ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು)'
                    }
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1.5: License Selection */}
        {step === 1.5 && userData && (
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-white text-2xl">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" size={28} />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {language === 'en' ? 'Select License Details' : 'ಪರವಾನಗಿ ವಿವರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
                  </div>
                  <div className="text-purple-100 text-sm font-normal">
                    {language === 'en' 
                      ? 'Choose your vehicle type and application type'
                      : 'ನಿಮ್ಮ ವಾಹನ ಪ್ರಕಾರ ಮತ್ತು ಅರ್ಜಿ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ'
                    }
                  </div>
                </div>
              </CardTitle>
            </div>

            <CardContent className="p-8 space-y-8">
              {/* Verified User Info */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <p className="text-green-800 font-semibold">
                    {language === 'en' ? 'Verified User:' : 'ಪರಿಶೀಲಿತ ಬಳಕೆದಾರ:'}
                  </p>
                  <p className="text-green-700">{userData.name}</p>
                </div>
              </div>

              {/* Vehicle Type Selection */}
              <div className="space-y-4">
                <Label className="text-xl font-bold text-gray-800">
                  {language === 'en' ? '1. Select Vehicle Type' : '೧. ವಾಹನ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setVehicleType('Two Wheeler')}
                    className={`p-6 border-2 rounded-xl transition-all duration-300 ${
                      vehicleType === 'Two Wheeler'
                        ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="text-6xl">🏍️</div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {language === 'en' ? 'Two Wheeler' : 'ಎರಡು ಚಕ್ರ'}
                      </h3>
                      <p className="text-sm text-gray-600 text-center">
                        {language === 'en' ? 'Motorcycle, Scooter' : 'ಮೋಟಾರ್ಸೈಕಲ್, ಸ್ಕೂಟರ್'}
                      </p>
                      {vehicleType === 'Two Wheeler' && (
                        <Badge className="bg-blue-500 text-white">
                          {language === 'en' ? 'Selected' : 'ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ'}
                        </Badge>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setVehicleType('Four Wheeler')}
                    className={`p-6 border-2 rounded-xl transition-all duration-300 ${
                      vehicleType === 'Four Wheeler'
                        ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="text-6xl">🚗</div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {language === 'en' ? 'Four Wheeler' : 'ನಾಲ್ಕು ಚಕ್ರ'}
                      </h3>
                      <p className="text-sm text-gray-600 text-center">
                        {language === 'en' ? 'Car, Jeep, Van' : 'ಕಾರು, ಜೀಪ್, ವ್ಯಾನ್'}
                      </p>
                      {vehicleType === 'Four Wheeler' && (
                        <Badge className="bg-blue-500 text-white">
                          {language === 'en' ? 'Selected' : 'ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ'}
                        </Badge>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Application Type Selection */}
              <div className="space-y-4">
                <Label className="text-xl font-bold text-gray-800">
                  {language === 'en' ? '2. Select Application Type' : '೨. ಅರ್ಜಿ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setApplicationType('Fresh')}
                    className={`p-6 border-2 rounded-xl transition-all duration-300 ${
                      applicationType === 'Fresh'
                        ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="text-6xl">🆕</div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {language === 'en' ? 'Fresh License' : 'ಹೊಸ ಪರವಾನಗಿ'}
                      </h3>
                      <p className="text-sm text-gray-600 text-center">
                        {language === 'en' ? 'First time applying' : 'ಮೊದಲ ಬಾರಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು'}
                      </p>
                      {applicationType === 'Fresh' && (
                        <Badge className="bg-green-500 text-white">
                          {language === 'en' ? 'Selected' : 'ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ'}
                        </Badge>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setApplicationType('Renewal')}
                    className={`p-6 border-2 rounded-xl transition-all duration-300 ${
                      applicationType === 'Renewal'
                        ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="text-6xl">🔄</div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {language === 'en' ? 'Renewal' : 'ನವೀಕರಣ'}
                      </h3>
                      <p className="text-sm text-gray-600 text-center">
                        {language === 'en' ? 'Renewing existing license' : 'ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಪರವಾನಗಿ ನವೀಕರಣ'}
                      </p>
                      {applicationType === 'Renewal' && (
                        <Badge className="bg-green-500 text-white">
                          {language === 'en' ? 'Selected' : 'ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ'}
                        </Badge>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-between items-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="px-6"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  {language === 'en' ? 'Back' : 'ಹಿಂದೆ'}
                </Button>

                <Button
                  onClick={() => {
                    if (vehicleType && applicationType) {
                      setLicenseType(`${vehicleType} - ${applicationType}`);
                      setStep(2);
                    }
                  }}
                  disabled={!vehicleType || !applicationType}
                  size="lg"
                  className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'en' ? 'Continue to Application' : 'ಅರ್ಜಿಗೆ ಮುಂದುವರಿಸಿ'}
                  <ArrowLeft className="ml-2 rotate-180" size={20} />
                </Button>
              </div>

              {/* Selection Required Message */}
              {(!vehicleType || !applicationType) && (
                <p className="text-center text-amber-600 text-sm">
                  {language === 'en' 
                    ? '⚠️ Please select both vehicle type and application type to continue'
                    : '⚠️ ಮುಂದುವರಿಸಲು ವಾಹನ ಪ್ರಕಾರ ಮತ್ತು ಅರ್ಜಿ ಪ್ರಕಾರ ಎರಡನ್ನೂ ಆಯ್ಕೆಮಾಡಿ'
                  }
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && userData && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={36} />
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                {language === 'en' ? 'Aadhaar Verified Successfully!' : 'ಆಧಾರ್ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ!'}
              </h2>
              <p className="text-gray-600">
                {language === 'en' ? 'Your details have been auto-filled. Now upload your photo.' : 'ನಿಮ್ಮ ವಿವರಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿಯಾಗಿವೆ. ಈಗ ನಿಮ್ಮ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.'}
              </p>
            </div>

            {/* DigiLocker Integration */}
            <div className="mb-6">
              <DigiLockerIntegration 
                allowedDocTypes={['AADHAAR', 'DRVLC', 'PAN']}
                onDocumentFetched={(doc) => {
                  console.log('Document fetched from DigiLocker:', doc);
                  alert(`✅ ${doc.name} fetched successfully! You can now use it in your application.`);
                }}
              />
            </div>

            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-white text-2xl">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Camera className="text-white" size={28} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {language === 'en' ? 'Step 2: Upload Your Photo' : 'ಹಂತ ೨: ನಿಮ್ಮ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ'}
                    </div>
                    <div className="text-green-100 text-sm font-normal">
                      {language === 'en' 
                        ? 'Professional photo for your driving license'
                        : 'ನಿಮ್ಮ ಚಾಲನಾ ಪರವಾನಗಿಗಾಗಿ ವೃತ್ತಿಪರ ಫೋಟೋ'
                      }
                    </div>
                  </div>
                </CardTitle>
              </div>
              
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Auto-filled Data Preview */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-white" size={18} />
                      </div>
                      <h3 className="text-xl font-bold text-green-600">
                        {language === 'en' ? 'Auto-filled from Aadhaar' : 'ಆಧಾರ್‌ನಿಂದ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿ'}
                      </h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 shadow-sm">
                        <Label className="text-sm font-semibold text-green-700">
                          {language === 'en' ? 'Full Name' : 'ಪೂರ್ಣ ಹೆಸರು'}
                        </Label>
                        <p className="text-lg font-bold text-green-800 mt-1">
                          {language === 'en' ? userData.name : userData.nameKannada}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm">
                        <Label className="text-sm font-semibold text-blue-700">
                          {language === 'en' ? 'Aadhaar Number' : 'ಆಧಾರ್ ಸಂಖ್ಯೆ'}
                        </Label>
                        <p className="text-lg font-bold text-blue-800 mt-1 font-mono">
                          {userData.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 shadow-sm">
                        <Label className="text-sm font-semibold text-purple-700">
                          {language === 'en' ? 'Date of Birth' : 'ಜನ್ಮ ದಿನಾಂಕ'}
                        </Label>
                        <p className="text-lg font-bold text-purple-800 mt-1">
                          {new Date(userData.dob).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 shadow-sm">
                        <Label className="text-sm font-semibold text-orange-700">
                          {language === 'en' ? 'Phone Number' : 'ಫೋನ್ ಸಂಖ್ಯೆ'}
                        </Label>
                        <p className="text-lg font-bold text-orange-800 mt-1">
                          {userData.phone}
                        </p>
                      </div>
                      
                      <div className="md:col-span-2 bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200 shadow-sm">
                        <Label className="text-sm font-semibold text-teal-700">
                          {language === 'en' ? 'Address' : 'ವಿಳಾಸ'}
                        </Label>
                        <p className="text-base font-semibold text-teal-800 mt-1">
                          {language === 'en' ? userData.address : userData.addressKannada}
                        </p>
                        <p className="text-sm text-teal-600 mt-1">
                          {userData.district}, {userData.state} - {userData.pincode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Photo Upload */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Camera className="text-white" size={18} />
                      </div>
                      <h3 className="text-xl font-bold text-blue-600">
                        {language === 'en' ? 'Upload Photo' : 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ'}
                      </h3>
                    </div>
                    
                    <div className="border-3 border-dashed border-blue-300 rounded-2xl p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 shadow-inner">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer block">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Upload className="text-white" size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-blue-700 mb-2">
                          {language === 'en' ? 'Upload Your Photo' : 'ನಿಮ್ಮ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ'}
                        </h4>
                        <p className="text-sm text-blue-600 mb-3">
                          {language === 'en' 
                            ? 'Click here or drag & drop your photo'
                            : 'ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಫೋಟೋವನ್ನು ಡ್ರ್ಯಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಮಾಡಿ'
                          }
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-xs text-blue-500">
                          <span>📸 JPG, PNG</span>
                          <span>💾 Max 5MB</span>
                          <span>📐 Passport size</span>
                        </div>
                      </label>
                    </div>
                    
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h5 className="font-semibold text-yellow-800 mb-2">
                        {language === 'en' ? 'Photo Guidelines:' : 'ಫೋಟೋ ಮಾರ್ಗಸೂಚಿಗಳು:'}
                      </h5>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• {language === 'en' ? 'Clear, front-facing photo' : 'ಸ್ಪಷ್ಟ, ಮುಂಭಾಗದ ಫೋಟೋ'}</li>
                        <li>• {language === 'en' ? 'Plain background' : 'ಸರಳ ಹಿನ್ನೆಲೆ'}</li>
                        <li>• {language === 'en' ? 'No sunglasses or hat' : 'ಸನ್‌ಗ್ಲಾಸ್ ಅಥವಾ ಟೋಪಿ ಇಲ್ಲ'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && userData && uploadedPhoto && (
          <div className="max-w-5xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-blue-700 to-green-600 p-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3 text-white text-2xl font-serif">
                    <FileText className="text-white" size={28} />
                    <span className="tracking-wide">Driving License Application Review</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setIsEditMode(!isEditMode)}
                      variant="outline"
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                    >
                      <Mic size={16} className="mr-2" />
                      {isEditMode ? 
                        (language === 'en' ? 'Save Changes' : 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ') : 
                        (language === 'en' ? 'Edit with Voice' : 'ಧ್ವನಿಯೊಂದಿಗೆ ಸಂಪಾದಿಸಿ')
                      }
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow-inner font-sans">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-blue-900 font-serif tracking-wide mb-2">
                      GOVERNMENT OF KARNATAKA
                    </h2>
                    <h3 className="text-xl font-semibold text-green-700 font-serif mb-1">
                      DRIVING LICENSE APPLICATION FORM
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">Form No: DL-{userData.aadhaar.slice(-4)}-{new Date().getFullYear()}</p>
                  </div>

                  {/* Voice Input Helper */}
                  {isEditMode && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Mic className="text-purple-600" size={20} />
                        <span className="text-lg font-semibold text-purple-700">
                          {language === 'en' ? 'Voice Input Mode Active' : 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಮೋಡ್ ಸಕ್ರಿಯ'}
                        </span>
                      </div>
                      <p className="text-sm text-purple-600">
                        {language === 'en' 
                          ? '🎤 You can now edit any field using voice input. Click the "Speak" button next to each field and speak in English or Kannada. Your voice will be converted to text automatically!'
                          : '🎤 ನೀವು ಈಗ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬಳಸಿಕೊಂಡು ಯಾವುದೇ ಕ್ಷೇತ್ರವನ್ನು ಸಂಪಾದಿಸಬಹುದು. ಪ್ರತಿ ಕ್ಷೇತ್ರದ ಪಕ್ಕದಲ್ಲಿರುವ "ಮಾತನಾಡಿ" ಬಟನ್ ಒತ್ತಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ. ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತದೆ!'
                        }
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Photo */}
                    <div className="md:col-span-1 flex flex-col items-center justify-center">
                      <div className="border-4 border-blue-300 p-2 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 shadow-lg">
                        <img 
                          src={uploadedPhoto} 
                          alt="Applicant" 
                          className="w-40 h-52 object-cover rounded-xl border-2 border-green-400"
                        />
                        <p className="text-xs text-center mt-2 text-green-600 font-semibold">
                          ✅ {language === 'en' ? 'Photo Auto-placed' : 'ಫೋಟೋ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಇರಿಸಲಾಗಿದೆ'}
                        </p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Full Name</Label>
                          {isEditMode ? (
                            <VoiceField
                              label=""
                              value={editableData?.name || userData.name}
                              onChange={(value) => setEditableData(prev => ({ ...prev!, name: value }))}
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <div className="text-lg font-semibold text-gray-900 font-serif">{editableData?.name || userData.name}</div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Name (Kannada)</Label>
                          {isEditMode ? (
                            <VoiceField
                              label=""
                              value={editableData?.nameKannada || userData.nameKannada}
                              onChange={(value) => setEditableData(prev => ({ ...prev!, nameKannada: value }))}
                              placeholder="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ"
                            />
                          ) : (
                            <div className="text-lg font-semibold text-gray-900 font-serif">{editableData?.nameKannada || userData.nameKannada}</div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Aadhaar Number</Label>
                          <div className="text-lg font-mono text-gray-800">{userData.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Date of Birth</Label>
                          <div className="text-lg text-gray-800">{new Date(userData.dob).toLocaleDateString('en-IN')}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Gender</Label>
                          <div className="text-lg text-gray-800">{userData.gender}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Blood Group</Label>
                          <div className="text-lg text-gray-800">B+</div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Phone</Label>
                          {isEditMode ? (
                            <VoiceField
                              label=""
                              value={editableData?.phone || userData.phone}
                              onChange={(value) => setEditableData(prev => ({ ...prev!, phone: value }))}
                              placeholder="Enter your phone number"
                              type="tel"
                            />
                          ) : (
                            <div className="text-lg text-gray-800">{editableData?.phone || userData.phone}</div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Email</Label>
                          {isEditMode ? (
                            <VoiceField
                              label=""
                              value={editableData?.email || userData.email}
                              onChange={(value) => setEditableData(prev => ({ ...prev!, email: value }))}
                              placeholder="Enter your email address"
                              type="email"
                            />
                          ) : (
                            <div className="text-lg text-gray-800">{editableData?.email || userData.email}</div>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm font-bold text-blue-700">Address</Label>
                          {isEditMode ? (
                            <VoiceField
                              label=""
                              value={editableData?.address || userData.address}
                              onChange={(value) => setEditableData(prev => ({ ...prev!, address: value }))}
                              placeholder="Enter your complete address"
                            />
                          ) : (
                            <div>
                              <div className="text-base text-gray-800">{editableData?.address || userData.address}</div>
                              <div className="text-sm text-gray-500">{userData.district}, {userData.state} - {userData.pincode}</div>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Emergency Contact</Label>
                          <div className="text-lg text-gray-800">+91 9876543211</div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">Education</Label>
                          <div className="text-lg text-gray-800">Graduate</div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-blue-700">License Type</Label>
                          <div className="text-lg text-gray-800">{licenseType}</div>
                        </div>
                      </div>
                      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Label className="text-sm font-bold text-blue-700">Declaration</Label>
                        <p className="text-gray-700 mt-2">
                          I hereby declare that the information provided above is true and correct to the best of my knowledge and belief.
                        </p>
                      </div>

                      {/* Digital Signature Section */}
                      <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <Label className="text-sm font-bold text-purple-700 mb-3 block">Digital Signature</Label>
                        {signature ? (
                          <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg border-2 border-purple-300 inline-block">
                              <img src={signature} alt="Digital Signature" className="h-16" />
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => setIsSignatureModalOpen(true)} 
                                variant="outline" 
                                size="sm"
                                className="border-purple-300 text-purple-700 hover:bg-purple-50"
                              >
                                ✏️ Edit Signature
                              </Button>
                              <Button 
                                onClick={() => setSignature(null)} 
                                variant="outline" 
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                🗑️ Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => setIsSignatureModalOpen(true)} 
                            variant="outline" 
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            ✍️ Add Digital Signature
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {language === 'en' ? 'Choose PDF Format:' : 'PDF ಸ್ವರೂಪವನ್ನು ಆಯ್ಕೆಮಾಡಿ:'}
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {/* Colorful PDF Option */}
                      <Button 
                        size="lg" 
                        className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:from-purple-700 hover:to-blue-700 rounded-xl" 
                        onClick={generatePDF}
                        disabled={!signature}
                      >
                        <div className="flex flex-col items-center">
                          <span>🎨 {language === 'en' ? 'Modern Colorful PDF' : 'ಆಧುನಿಕ ವರ್ಣರಂಜಿತ PDF'}</span>
                          <span className="text-sm opacity-90">{language === 'en' ? 'Premium Design' : 'ಪ್ರೀಮಿಯಂ ವಿನ್ಯಾಸ'}</span>
                        </div>
                      </Button>
                      
                      {/* Simple PDF Option */}
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="px-8 py-4 text-lg font-bold border-2 border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl" 
                        onClick={generateSimplePDF}
                        disabled={!signature}
                      >
                        <div className="flex flex-col items-center">
                          <span>📄 {language === 'en' ? 'Simple Text PDF' : 'ಸರಳ ಪಠ್ಯ PDF'}</span>
                          <span className="text-sm opacity-70">{language === 'en' ? 'Classic Format' : 'ಕ್ಲಾಸಿಕ್ ಸ್ವರೂಪ'}</span>
                        </div>
                      </Button>
                    </div>
                    
                    {!signature && (
                      <p className="text-sm text-red-500 mt-4 font-medium">
                        {language === 'en' ? '⚠️ Please add your digital signature first' : '⚠️ ದಯವಿಟ್ಟು ಮೊದಲು ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಸಹಿಯನ್ನು ಸೇರಿಸಿ'}
                      </p>
                    )}
                    
                    {signature && (
                      <p className="text-sm text-green-600 mt-2">
                        {language === 'en' ? '✅ Ready to download - Choose your preferred format above' : '✅ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಸಿದ್ಧ - ಮೇಲೆ ನಿಮ್ಮ ಆದ್ಯತೆಯ ಸ್ವರೂಪವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Signature Modal */}
                {isSignatureModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Digital Signature</h3>
                        <Button 
                          onClick={() => setIsSignatureModalOpen(false)} 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </Button>
                      </div>
                      <SignatureCanvas />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 4 && userData && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2">
                {language === 'en' ? 'Complete Your Payment' : 'ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'Your application form has been generated. Please complete the payment to submit your driving license application.'
                  : 'ನಿಮ್ಮ ಅರ್ಜಿ ಫಾರ್ಮ್ ಅನ್ನು ಉತ್ಪಾದಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಚಾಲನಾ ಪರವಾನಗಿ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಲು ದಯವಿಟ್ಟು ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.'
                }
              </p>
            </div>
            
            <PaymentSystem
              serviceName={language === 'en' ? 'Driving License Application' : 'ಚಾಲನಾ ಪರವಾನಗಿ ಅರ್ಜಿ'}
              applicantName={userData.name}
              applicationId={applicationId}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        )}

        {/* Step 4.5: RTO Selection */}
        {step === 4.5 && (
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-white text-2xl">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MapPin className="text-white" size={28} />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {language === 'en' ? 'Select RTO Location' : 'ಆರ್‌ಟಿಒ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
                  </div>
                  <div className="text-orange-100 text-sm font-normal">
                    {language === 'en' 
                      ? 'Choose your nearest RTO for license collection'
                      : 'ಪರವಾನಗಿ ಸಂಗ್ರಹಕ್ಕಾಗಿ ನಿಮ್ಮ ಹತ್ತಿರದ ಆರ್‌ಟಿಒ ಆಯ್ಕೆಮಾಡಿ'
                    }
                  </div>
                </div>
              </CardTitle>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Payment Success Message */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <p className="text-green-800 font-semibold">
                    {language === 'en' ? '✅ Payment Successful!' : '✅ ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ!'}
                  </p>
                  <p className="text-green-700 text-sm">
                    {language === 'en' ? 'Application ID: ' : 'ಅರ್ಜಿ ಐಡಿ: '}{applicationId}
                  </p>
                </div>
              </div>

              {/* Search/Filter */}
              <div className="space-y-2">
                <Label className="text-lg font-bold text-gray-800">
                  {language === 'en' ? 'Find your nearest RTO:' : 'ನಿಮ್ಮ ಹತ್ತಿರದ ಆರ್‌ಟಿಒ ಹುಡುಕಿ:'}
                </Label>
                <Input
                  placeholder={language === 'en' ? 'Search by RTO code, name or district...' : 'ಆರ್‌ಟಿಒ ಕೋಡ್, ಹೆಸರು ಅಥವಾ ಜಿಲ್ಲೆಯಿಂದ ಹುಡುಕಿ...'}
                  className="text-lg py-6"
                  onChange={(e) => {
                    // Filter RTO list based on search
                  }}
                />
              </div>

              {/* RTO List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rtoLocations
                  .map((rto) => ({
                    ...rto,
                    calculatedDistance: userLocation 
                      ? calculateDistanceKm(userLocation.lat, userLocation.lng, rto.lat, rto.lng)
                      : null
                  }))
                  .sort((a, b) => {
                    if (a.calculatedDistance === null || b.calculatedDistance === null) return 0;
                    return a.calculatedDistance - b.calculatedDistance;
                  })
                  .map((rto, index) => (
                  <button
                    key={rto.code}
                    onClick={() => setSelectedRTO(rto.code)}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 text-left ${
                      selectedRTO === rto.code
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-lg">{rto.code}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-gray-800">{rto.name}</h3>
                            {rto.calculatedDistance !== null && index === 0 && (
                              <Badge className="bg-green-500 text-white text-xs">
                                🎯 {language === 'en' ? 'Nearest' : 'ಹತ್ತಿರದ'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            📍 {rto.district} • 🚗 {
                              rto.calculatedDistance !== null 
                                ? `${rto.calculatedDistance.toFixed(1)} km away`
                                : (userLocation === null ? 'Calculating...' : rto.distance)
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {rto.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {selectedRTO === rto.code && (
                          <Badge className="bg-orange-500 text-white">
                            {language === 'en' ? 'Selected' : 'ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ'}
                          </Badge>
                        )}
                        {rto.calculatedDistance !== null && (
                          <span className="text-xs text-gray-500">
                            {(rto.calculatedDistance / 40).toFixed(0)} min drive
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Continue Button */}
              <div className="flex justify-between items-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(4)}
                  className="px-6"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  {language === 'en' ? 'Back' : 'ಹಿಂದೆ'}
                </Button>

                <Button
                  onClick={() => {
                    if (selectedRTO) {
                      setStep(5);
                    }
                  }}
                  disabled={!selectedRTO}
                  size="lg"
                  className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'en' ? 'Complete & Track Application' : 'ಪೂರ್ಣಗೊಳಿಸಿ ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ'}
                  <ArrowLeft className="ml-2 rotate-180" size={20} />
                </Button>
              </div>

              {/* Selection Required Message */}
              {!selectedRTO && (
                <p className="text-center text-amber-600 text-sm">
                  {language === 'en' 
                    ? '⚠️ Please select an RTO location to continue'
                    : '⚠️ ಮುಂದುವರಿಸಲು ಆರ್‌ಟಿಒ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ'
                  }
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Success Animation */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="text-green-600" size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">
                    {language === 'en' ? '🎉 Application Submitted Successfully!' : '🎉 ಅರ್ಜಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!'}
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    {language === 'en' 
                      ? 'Your driving license application is now being processed'
                      : 'ನಿಮ್ಮ ಚಾಲನಾ ಪರವಾನಗಿ ಅರ್ಜಿಯನ್ನು ಈಗ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ'
                    }
                  </p>
                </div>

                {/* Application Details */}
                {userData && paymentData && selectedRTO && (
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">
                      {language === 'en' ? '📋 Application Summary' : '📋 ಅರ್ಜಿ ಸಾರಾಂಶ'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">{language === 'en' ? 'Applicant Name' : 'ಅರ್ಜಿದಾರರ ಹೆಸರು'}</p>
                          <p className="font-semibold text-gray-800">{userData.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <FileText size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">{language === 'en' ? 'Application ID' : 'ಅರ್ಜಿ ಐಡಿ'}</p>
                          <p className="font-semibold text-gray-800">{applicationId}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <MapPin size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">{language === 'en' ? 'Selected RTO' : 'ಆಯ್ಕೆಮಾಡಿದ ಆರ್‌ಟಿಒ'}</p>
                          <p className="font-semibold text-gray-800">
                            {selectedRTO} - {rtoLocations.find(r => r.code === selectedRTO)?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <CreditCard size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">{language === 'en' ? 'Payment Status' : 'ಪಾವತಿ ಸ್ಥಿತಿ'}</p>
                          <p className="font-semibold text-green-600">✅ ₹{paymentData.amount} Paid</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🏍️</span>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">{language === 'en' ? 'License Type' : 'ಪರವಾನಗಿ ಪ್ರಕಾರ'}</p>
                          <p className="font-semibold text-gray-800">{licenseType}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <Calendar size={20} className="text-pink-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">{language === 'en' ? 'Submitted On' : 'ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ'}</p>
                          <p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tracking and Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Track Application */}
                  <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer hover:shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📍</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-blue-900">
                        {language === 'en' ? 'Track Application' : 'ಅರ್ಜಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {language === 'en' 
                          ? 'Real-time status updates'
                          : 'ನೈಜ-ಸಮಯದ ಸ್ಥಿತಿ ನವೀಕರಣಗಳು'
                        }
                      </p>
                      <div className="space-y-2 text-xs text-left bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>✅ Application Received</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span>⏳ Document Verification</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span>⏺ Test Scheduling</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span>⏺ License Printing</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                        {language === 'en' ? 'View Details' : 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Find RTO */}
                  <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all cursor-pointer hover:shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="text-orange-600" size={32} />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-orange-900">
                        {language === 'en' ? 'RTO Details' : 'ಆರ್‌ಟಿಒ ವಿವರಗಳು'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {language === 'en' 
                          ? 'Location and contact info'
                          : 'ಸ್ಥಳ ಮತ್ತು ಸಂಪರ್ಕ ಮಾಹಿತಿ'
                        }
                      </p>
                      <div className="space-y-2 text-sm text-left bg-orange-50 p-3 rounded-lg">
                        <div><strong>{selectedRTO}</strong> - {rtoLocations.find(r => r.code === selectedRTO)?.name}</div>
                        <div>📍 {rtoLocations.find(r => r.code === selectedRTO)?.address}</div>
                        <div>📌 {rtoLocations.find(r => r.code === selectedRTO)?.district}</div>
                        {userLocation && rtoLocations.find(r => r.code === selectedRTO) && (
                          <div>🚗 {calculateDistanceKm(
                            userLocation.lat, 
                            userLocation.lng, 
                            rtoLocations.find(r => r.code === selectedRTO)!.lat,
                            rtoLocations.find(r => r.code === selectedRTO)!.lng
                          ).toFixed(1)} km away</div>
                        )}
                        <div>🕒 Mon-Sat: 10 AM - 5 PM</div>
                        <div>📞 080-22222222</div>
                      </div>
                      
                      {/* Google Maps Embed */}
                      {rtoLocations.find(r => r.code === selectedRTO) && (
                        <div className="mt-4 rounded-lg overflow-hidden border-2 border-orange-300">
                          <iframe
                            width="100%"
                            height="200"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${rtoLocations.find(r => r.code === selectedRTO)!.lat},${rtoLocations.find(r => r.code === selectedRTO)!.lng}&zoom=15`}
                          ></iframe>
                        </div>
                      )}

                      <Button 
                        className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                        onClick={() => {
                          const rto = rtoLocations.find(r => r.code === selectedRTO);
                          if (rto) {
                            // Open Google Maps with directions
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${rto.lat},${rto.lng}`,
                              '_blank'
                            );
                          }
                        }}
                      >
                        🗺️ {language === 'en' ? 'Get Directions' : 'ನಿರ್ದೇಶನಗಳನ್ನು ಪಡೆಯಿರಿ'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mt-6">
                  <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    <Link to="/">
                      {language === 'en' ? '🏠 Go to Home' : '🏠 ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ'}
                    </Link>
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      {language === 'en' ? '📄 Download Receipt' : '📄 ರಸೀದಿ ಡೌನ್‌ಲೋಡ್'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setStep(1);
                        setAadhaarNumber('');
                        setUploadedPhoto(null);
                        setUserData(null);
                        setApplicationId('');
                        setPaymentCompleted(false);
                        setPaymentData(null);
                        setSelectedRTO('');
                        setVehicleType('');
                        setApplicationType('');
                      }}
                      className="w-full"
                    >
                      {language === 'en' ? '🔄 New Application' : '🔄 ಹೊಸ ಅರ್ಜಿ'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default DrivingLicenseService;