import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { 
  Upload, 
  Download, 
  CheckCircle, 
  User, 
  DollarSign,
  FileText,
  ArrowLeft,
  Home as HomeIcon,
  Briefcase,
  Users,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface IncomeData {
  // Personal Details
  name: string;
  nameKannada: string;
  fatherName: string;
  motherName: string;
  aadhaar: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  
  // Address
  address: string;
  addressKannada: string;
  district: string;
  state: string;
  pincode: string;
  
  // Income Details
  occupation: string;
  employerName: string;
  annualIncome: string;
  monthlyIncome: string;
  sourceOfIncome: string;
  familyMembers: number;
  
  // Purpose
  purposeOfCertificate: string;
  institutionName?: string;
  
  // Documents
  salarySlips?: string[];
  bankStatement?: string;
  affidavit?: string;
}

const IncomeCertificateService = () => {
  const { language } = useLanguage();
  const [step, setStep] = useState(1); // 1: Aadhaar, 2: Income Details, 3: Documents, 4: Review, 5: Payment
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<{[key: string]: string}>({});
  const [applicationId, setApplicationId] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Step 1: Verify Aadhaar
  const handleAadhaarVerification = () => {
    if (aadhaarNumber.length !== 12) {
      alert(language === 'en' ? 'Please enter a valid 12-digit Aadhaar number' : 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 12-ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ');
      return;
    }

    // Mock Aadhaar verification with auto-filled data
    const mockData: IncomeData = {
      name: 'Rajesh Kumar M',
      nameKannada: 'ರಾಜೇಶ್ ಕುಮಾರ್ ಎಂ',
      fatherName: 'Manjunath Kumar',
      motherName: 'Lakshmi Devi',
      aadhaar: aadhaarNumber,
      dob: '1990-05-15',
      gender: 'Male',
      phone: '+91 9876543210',
      email: 'rajesh.kumar@email.com',
      address: '123, MG Road, Jayanagar, Bangalore',
      addressKannada: '೧೨೩, ಎಂ.ಜಿ ರಸ್ತೆ, ಜಯನಗರ, ಬೆಂಗಳೂರು',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560041',
      occupation: '',
      employerName: '',
      annualIncome: '',
      monthlyIncome: '',
      sourceOfIncome: '',
      familyMembers: 4,
      purposeOfCertificate: ''
    };

    setIncomeData(mockData);
    setStep(2);
  };

  // Step 2: Income Details
  const handleIncomeDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (incomeData) {
      setIncomeData({
        ...incomeData,
        occupation: formData.get('occupation') as string,
        employerName: formData.get('employerName') as string,
        annualIncome: formData.get('annualIncome') as string,
        monthlyIncome: formData.get('monthlyIncome') as string,
        sourceOfIncome: formData.get('sourceOfIncome') as string,
        familyMembers: parseInt(formData.get('familyMembers') as string),
        purposeOfCertificate: formData.get('purposeOfCertificate') as string,
        institutionName: formData.get('institutionName') as string || undefined
      });
    }
    setStep(3);
  };

  // Step 3: Upload Documents
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedDocs({
          ...uploadedDocs,
          [docType]: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentsSubmit = () => {
    if (!uploadedDocs.salarySlips && !uploadedDocs.bankStatement) {
      alert(language === 'en' 
        ? 'Please upload at least salary slips or bank statement' 
        : 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಸಂಬಳ ಚೀಟಿಗಳು ಅಥವಾ ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ');
      return;
    }
    setStep(4);
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!incomeData) return;

    const currentDate = new Date().toLocaleDateString('en-IN');
    const certificateNumber = `IC/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Income Certificate - ${incomeData.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;600;700&family=Merriweather:wght@400;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Merriweather', 'Noto Sans Kannada', serif; background: #f5f5f5; padding: 40px; }
          .certificate { max-width: 800px; margin: 0 auto; background: #fff; border: 15px solid #1e40af; border-image: linear-gradient(135deg, #1e40af, #7c3aed) 1; box-shadow: 0 10px 40px rgba(0,0,0,0.2); padding: 50px; position: relative; }
          .certificate::before { content: ''; position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 2px solid #d4af37; pointer-events: none; }
          
          .header { text-align: center; margin-bottom: 40px; position: relative; z-index: 2; }
          .emblem { width: 80px; height: 80px; margin: 0 auto 15px; }
          .header h1 { font-size: 2rem; color: #1e40af; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
          .header h2 { font-size: 1.2rem; color: #7c3aed; font-weight: 600; margin-bottom: 10px; }
          .header .subtitle { font-size: 1rem; color: #666; font-style: italic; }
          
          .title-section { text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #dbeafe, #ede9fe); border-radius: 10px; }
          .title-section h3 { font-size: 1.8rem; color: #1e40af; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; }
          
          .certificate-number { text-align: right; font-size: 0.9rem; color: #666; margin-bottom: 20px; }
          
          .content { margin: 30px 0; line-height: 1.8; font-size: 1rem; color: #333; }
          .content p { margin-bottom: 15px; text-align: justify; }
          .highlight { color: #1e40af; font-weight: 700; text-transform: uppercase; }
          
          .details-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .details-table td { padding: 12px; border: 1px solid #ddd; }
          .details-table td:first-child { background: #f8fafc; font-weight: 600; width: 40%; color: #1e40af; }
          
          .income-highlight { text-align: center; background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; margin: 30px 0; border-radius: 10px; border: 2px solid #f59e0b; }
          .income-highlight .amount { font-size: 2.5rem; color: #b45309; font-weight: 700; margin: 10px 0; }
          .income-highlight .label { font-size: 1.1rem; color: #92400e; font-weight: 600; }
          
          .signature-section { display: flex; justify-content: space-between; margin-top: 60px; }
          .signature-box { text-align: center; }
          .signature-line { width: 200px; height: 2px; background: #333; margin: 40px auto 10px; }
          .signature-label { font-size: 0.9rem; color: #666; font-weight: 600; }
          
          .footer { margin-top: 40px; text-align: center; font-size: 0.85rem; color: #999; }
          .seal { position: absolute; bottom: 100px; right: 50px; width: 120px; height: 120px; border: 3px solid #1e40af; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(30, 64, 175, 0.05); transform: rotate(-15deg); }
          .seal-text { font-size: 0.7rem; font-weight: 700; color: #1e40af; text-align: center; line-height: 1.2; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="emblem">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="#1e40af" stroke="#d4af37" stroke-width="3"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke="#d4af37" stroke-width="2"/>
                <text x="50" y="60" text-anchor="middle" fill="#fff" font-size="40" font-weight="bold">🏛️</text>
              </svg>
            </div>
            <h1>Government of Karnataka</h1>
            <h2>Revenue Department</h2>
            <p class="subtitle">State of Karnataka, India</p>
          </div>
          
          <div class="certificate-number">
            Certificate No: <strong>${certificateNumber}</strong><br>
            Issue Date: <strong>${currentDate}</strong>
          </div>
          
          <div class="title-section">
            <h3>📜 Income Certificate</h3>
          </div>
          
          <div class="content">
            <p>This is to certify that <span class="highlight">${incomeData.name}</span> 
            ${incomeData.nameKannada ? `(${incomeData.nameKannada})` : ''}, 
            ${incomeData.gender === 'Male' ? 'Son' : 'Daughter'} of <span class="highlight">${incomeData.fatherName}</span>, 
            residing at <strong>${incomeData.address}</strong>, ${incomeData.district}, ${incomeData.state} - ${incomeData.pincode}, 
            is a permanent resident of Karnataka State.</p>
            
            <p>After due verification of records and enquiry, it is certified that the annual income of the family 
            from all sources is as mentioned below:</p>
          </div>
          
          <div class="income-highlight">
            <div class="label">Annual Family Income</div>
            <div class="amount">₹ ${parseInt(incomeData.annualIncome).toLocaleString('en-IN')}</div>
            <div class="label" style="font-size: 0.9rem; margin-top: 5px;">
              (${numberToWords(parseInt(incomeData.annualIncome))} Rupees Only)
            </div>
          </div>
          
          <table class="details-table">
            <tr>
              <td>Name of the Applicant</td>
              <td>${incomeData.name}</td>
            </tr>
            <tr>
              <td>Father's / Mother's Name</td>
              <td>${incomeData.fatherName}</td>
            </tr>
            <tr>
              <td>Date of Birth</td>
              <td>${new Date(incomeData.dob).toLocaleDateString('en-IN')}</td>
            </tr>
            <tr>
              <td>Aadhaar Number</td>
              <td>XXXX XXXX ${incomeData.aadhaar.slice(-4)}</td>
            </tr>
            <tr>
              <td>Occupation</td>
              <td>${incomeData.occupation}</td>
            </tr>
            <tr>
              <td>Source of Income</td>
              <td>${incomeData.sourceOfIncome}</td>
            </tr>
            <tr>
              <td>Employer Name</td>
              <td>${incomeData.employerName || 'Self Employed'}</td>
            </tr>
            <tr>
              <td>Monthly Income</td>
              <td>₹ ${parseInt(incomeData.monthlyIncome).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Family Members</td>
              <td>${incomeData.familyMembers}</td>
            </tr>
            <tr>
              <td>Purpose of Certificate</td>
              <td>${incomeData.purposeOfCertificate}</td>
            </tr>
          </table>
          
          <div class="content">
            <p style="margin-top: 30px;">This certificate is issued for the purpose of 
            <strong>${incomeData.purposeOfCertificate}</strong> 
            ${incomeData.institutionName ? `at <strong>${incomeData.institutionName}</strong>` : ''} 
            and is valid for one year from the date of issue.</p>
          </div>
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Date: ${currentDate}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Tahsildar<br>Revenue Department</div>
            </div>
          </div>
          
          <div class="seal">
            <div class="seal-text">OFFICIAL<br>SEAL<br>GOVERNMENT<br>OF<br>KARNATAKA</div>
          </div>
          
          <div class="footer">
            <p>This is a computer-generated certificate and does not require a physical signature.</p>
            <p>Verify authenticity at: https://revenue.karnataka.gov.in/verify</p>
            <p style="margin-top: 10px; font-size: 0.75rem;">Generated via AI Sahayak - Karnataka Government Digital Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create temporary div for PDF generation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Income_Certificate_${incomeData.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);

      document.body.removeChild(tempDiv);
      
      alert(language === 'en' 
        ? 'Income Certificate downloaded successfully!' 
        : 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ!');
    } catch (error) {
      console.error('PDF generation error:', error);
      document.body.removeChild(tempDiv);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Number to words conversion
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numberToWords(num % 10000000) : '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2" size={20} />
            {language === 'en' ? 'Back to Home' : 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ'}
          </Button>
        </Link>

        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <FileText className="text-blue-600" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Income Certificate Application' : 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಅರ್ಜಿ'}
          </h1>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Apply for income certificate online in minutes'
              : 'ನಿಮಿಷಗಳಲ್ಲಿ ಆನ್‌ಲೈನ್ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  <span className="text-xs mt-2 text-gray-600">
                    {s === 1 && (language === 'en' ? 'Aadhaar' : 'ಆಧಾರ್')}
                    {s === 2 && (language === 'en' ? 'Income Details' : 'ಆದಾಯ ವಿವರಗಳು')}
                    {s === 3 && (language === 'en' ? 'Documents' : 'ದಾಖಲೆಗಳು')}
                    {s === 4 && (language === 'en' ? 'Review' : 'ಪರಿಶೀಲನೆ')}
                  </span>
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Aadhaar Verification */}
        {step === 1 && (
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <User size={28} />
                {language === 'en' ? 'Step 1: Aadhaar Verification' : 'ಹಂತ ೧: ಆಧಾರ್ ಪರಿಶೀಲನೆ'}
              </CardTitle>
              <CardDescription className="text-white/90">
                {language === 'en' 
                  ? 'Enter your Aadhaar number to fetch your details'
                  : 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="aadhaar">
                    {language === 'en' ? 'Aadhaar Number' : 'ಆಧಾರ್ ಸಂಖ್ಯೆ'}
                  </Label>
                  <Input
                    id="aadhaar"
                    type="text"
                    maxLength={12}
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    className="text-lg"
                  />
                </div>
                <Button 
                  onClick={handleAadhaarVerification}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {language === 'en' ? 'Verify Aadhaar' : 'ಆಧಾರ್ ಪರಿಶೀಲಿಸಿ'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Income Details */}
        {step === 2 && incomeData && (
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <DollarSign size={28} />
                {language === 'en' ? 'Step 2: Income Details' : 'ಹಂತ ೨: ಆದಾಯ ವಿವರಗಳು'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleIncomeDetailsSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="occupation">
                      {language === 'en' ? 'Occupation *' : 'ಉದ್ಯೋಗ *'}
                    </Label>
                    <Input id="occupation" name="occupation" required />
                  </div>
                  <div>
                    <Label htmlFor="employerName">
                      {language === 'en' ? 'Employer Name' : 'ಉದ್ಯೋಗದಾತನ ಹೆಸರು'}
                    </Label>
                    <Input id="employerName" name="employerName" />
                  </div>
                  <div>
                    <Label htmlFor="sourceOfIncome">
                      {language === 'en' ? 'Source of Income *' : 'ಆದಾಯದ ಮೂಲ *'}
                    </Label>
                    <select 
                      id="sourceOfIncome" 
                      name="sourceOfIncome"
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Salary">Salary</option>
                      <option value="Business">Business</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Pension">Pension</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="monthlyIncome">
                      {language === 'en' ? 'Monthly Income (₹) *' : 'ಮಾಸಿಕ ಆದಾಯ (₹) *'}
                    </Label>
                    <Input 
                      id="monthlyIncome" 
                      name="monthlyIncome" 
                      type="number" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="annualIncome">
                      {language === 'en' ? 'Annual Income (₹) *' : 'ವಾರ್ಷಿಕ ಆದಾಯ (₹) *'}
                    </Label>
                    <Input 
                      id="annualIncome" 
                      name="annualIncome" 
                      type="number" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="familyMembers">
                      {language === 'en' ? 'Family Members *' : 'ಕುಟುಂಬ ಸದಸ್ಯರು *'}
                    </Label>
                    <Input 
                      id="familyMembers" 
                      name="familyMembers" 
                      type="number" 
                      defaultValue={4}
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="purposeOfCertificate">
                      {language === 'en' ? 'Purpose of Certificate *' : 'ಪ್ರಮಾಣಪತ್ರದ ಉದ್ದೇಶ *'}
                    </Label>
                    <select 
                      id="purposeOfCertificate" 
                      name="purposeOfCertificate"
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Education Scholarship">Education Scholarship</option>
                      <option value="Educational Loan">Educational Loan</option>
                      <option value="Government Scheme">Government Scheme</option>
                      <option value="Fee Concession">Fee Concession</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="institutionName">
                      {language === 'en' ? 'Institution/Organization Name (if applicable)' : 'ಸಂಸ್ಥೆ/ಸಂಸ್ಥೆಯ ಹೆಸರು'}
                    </Label>
                    <Input id="institutionName" name="institutionName" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    {language === 'en' ? 'Back' : 'ಹಿಂದೆ'}
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    {language === 'en' ? 'Continue' : 'ಮುಂದುವರಿಸಿ'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Upload Documents */}
        {step === 3 && (
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Upload size={28} />
                {language === 'en' ? 'Step 3: Upload Documents' : 'ಹಂತ ೩: ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <Label>
                    {language === 'en' ? 'Salary Slips (Last 3 months) *' : 'ಸಂಬಳ ಚೀಟಿಗಳು (ಕೊನೆಯ 3 ತಿಂಗಳು) *'}
                  </Label>
                  <Input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, 'salarySlips')}
                    className="mt-2"
                  />
                  {uploadedDocs.salarySlips && (
                    <Badge className="mt-2 bg-green-100 text-green-800">✓ Uploaded</Badge>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <Label>
                    {language === 'en' ? 'Bank Statement (Last 6 months) *' : 'ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್ (ಕೊನೆಯ 6 ತಿಂಗಳು) *'}
                  </Label>
                  <Input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, 'bankStatement')}
                    className="mt-2"
                  />
                  {uploadedDocs.bankStatement && (
                    <Badge className="mt-2 bg-green-100 text-green-800">✓ Uploaded</Badge>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <Label>
                    {language === 'en' ? 'Self Declaration / Affidavit (Optional)' : 'ಸ್ವಯಂ ಘೋಷಣೆ / ಅಫಿಡವಿಟ್ (ಐಚ್ಛಿಕ)'}
                  </Label>
                  <Input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, 'affidavit')}
                    className="mt-2"
                  />
                  {uploadedDocs.affidavit && (
                    <Badge className="mt-2 bg-green-100 text-green-800">✓ Uploaded</Badge>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    {language === 'en' ? 'Back' : 'ಹಿಂದೆ'}
                  </Button>
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={handleDocumentsSubmit}
                  >
                    {language === 'en' ? 'Continue to Review' : 'ಪರಿಶೀಲನೆಗೆ ಮುಂದುವರಿಸಿ'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Download */}
        {step === 4 && incomeData && (
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <CheckCircle size={28} />
                {language === 'en' ? 'Step 4: Review & Download' : 'ಹಂತ ೪: ಪರಿಶೀಲನೆ ಮತ್ತು ಡೌನ್‌ಲೋಡ್'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-4">
                    {language === 'en' ? 'Application Summary' : 'ಅರ್ಜಿ ಸಾರಾಂಶ'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{incomeData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Annual Income</p>
                      <p className="font-semibold text-blue-600">₹ {parseInt(incomeData.annualIncome).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-semibold">{incomeData.occupation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Purpose</p>
                      <p className="font-semibold">{incomeData.purposeOfCertificate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    {language === 'en' ? 'Back' : 'ಹಿಂದೆ'}
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    onClick={generatePDF}
                  >
                    <Download className="mr-2" size={20} />
                    {language === 'en' ? 'Download Certificate' : 'ಪ್ರಮಾಣಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IncomeCertificateService;
