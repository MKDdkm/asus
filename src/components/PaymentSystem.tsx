import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  Download, 
  Mail,
  Receipt,
  QrCode,
  IndianRupee,
  Clock,
  Shield
} from "lucide-react";

interface PaymentProps {
  serviceName: string;
  applicantName: string;
  applicationId: string;
  onPaymentComplete: (paymentData: any) => void;
}

const PaymentSystem: React.FC<PaymentProps> = ({ 
  serviceName, 
  applicantName, 
  applicationId, 
  onPaymentComplete 
}) => {
  const { language } = useLanguage();
  const [paymentStep, setPaymentStep] = useState(1); // 1: Fee Details, 2: Payment Method, 3: Processing, 4: Success
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [receiptGenerated, setReceiptGenerated] = useState(false);

  // Mock fee calculation based on service
  const calculateFees = () => {
    const baseFees = {
      'driving-license': {
        applicationFee: 200,
        testFee: 300,
        licenseFee: 1000,
        serviceTax: 180,
        total: 1680
      },
      'aadhaar': {
        applicationFee: 50,
        processingFee: 100,
        serviceTax: 27,
        total: 177
      }
    };

    return baseFees['driving-license'] || baseFees['driving-license'];
  };

  const fees = calculateFees();

  // Mock UPI QR Code generation
  const generateUPIQR = () => {
    return `upi://pay?pa=karnataka.govt@sbi&pn=Karnataka Government&am=${fees.total}&cu=INR&tn=DL Application ${applicationId}`;
  };

  // Mock payment processing
  const processPayment = async (method: string) => {
    setIsProcessing(true);
    setPaymentStep(3);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockPaymentId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setPaymentId(mockPaymentId);
    setPaymentStep(4);
    setIsProcessing(false);
    
    // Generate mock payment data
    const paymentData = {
      paymentId: mockPaymentId,
      amount: fees.total,
      method: method,
      status: 'SUCCESS',
      timestamp: new Date(),
      transactionId: `TXN${Date.now()}`,
      applicationId: applicationId
    };
    
    onPaymentComplete(paymentData);
  };

  // Generate Digital Receipt
  const generateReceipt = () => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${applicationId}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #0066cc; font-size: 24px; font-weight: bold; }
          .receipt-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .fee-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .fee-table th, .fee-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .fee-table th { background-color: #0066cc; color: white; }
          .total-row { background-color: #e3f2fd; font-weight: bold; }
          .payment-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .status-success { color: #28a745; font-weight: bold; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏛️ Government of Karnataka</div>
          <h2>e-Nagarika Digital Receipt</h2>
          <p>Official Payment Receipt</p>
        </div>
        
        <div class="receipt-details">
          <h3>Receipt Details</h3>
          <div class="payment-info">
            <div>
              <strong>Receipt No:</strong> RCP${paymentId}<br>
              <strong>Application ID:</strong> ${applicationId}<br>
              <strong>Service:</strong> ${serviceName}<br>
              <strong>Applicant:</strong> ${applicantName}
            </div>
            <div>
              <strong>Payment ID:</strong> ${paymentId}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br>
              <strong>Time:</strong> ${new Date().toLocaleTimeString('en-IN')}<br>
              <strong>Status:</strong> <span class="status-success">PAID ✓</span>
            </div>
          </div>
        </div>

        <table class="fee-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Application Fee</td><td>₹${fees.applicationFee}</td></tr>
            <tr><td>Test Fee</td><td>₹${fees.testFee}</td></tr>
            <tr><td>License Fee</td><td>₹${fees.licenseFee}</td></tr>
            <tr><td>Service Tax (18%)</td><td>₹${fees.serviceTax}</td></tr>
            <tr class="total-row"><td><strong>Total Amount</strong></td><td><strong>₹${fees.total}</strong></td></tr>
          </tbody>
        </table>

        <div class="receipt-details">
          <h3>Payment Information</h3>
          <p><strong>Payment Method:</strong> ${selectedMethod === 'upi' ? 'UPI Payment' : selectedMethod === 'card' ? 'Card Payment' : 'Net Banking'}</p>
          <p><strong>Transaction ID:</strong> TXN${Date.now()}</p>
          <p><strong>Bank Reference:</strong> ${paymentId}${Math.floor(Math.random() * 10000)}</p>
        </div>

        <div class="footer">
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <p>Government of Karnataka | e-Nagarika Platform | Digital India Initiative</p>
          <p>For queries, contact: support@enagarika.kar.gov.in | 1800-XXX-XXXX</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${applicationId}_${paymentId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setReceiptGenerated(true);
  };

  // Mock email sending
  const sendEmailConfirmation = async () => {
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(language === 'en' 
      ? `✅ Payment confirmation email sent to your registered email address!\n\nReceipt ID: RCP${paymentId}\nAmount: ₹${fees.total}`
      : `✅ ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್ ವಿಳಾಸಕ್ಕೆ ಪಾವತಿ ದೃಢೀಕರಣ ಇಮೇಲ್ ಕಳುಹಿಸಲಾಗಿದೆ!\n\nರಸೀದಿ ID: RCP${paymentId}\nಮೊತ್ತ: ₹${fees.total}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Step 1: Fee Details */}
      {paymentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IndianRupee className="text-green-600" size={24} />
              <span>{language === 'en' ? 'Payment Details' : 'ಪಾವತಿ ವಿವರಗಳು'}</span>
            </CardTitle>
            <CardDescription>
              {language === 'en' 
                ? 'Review the government fees for your application'
                : 'ನಿಮ್ಮ ಅರ್ಜಿಗಾಗಿ ಸರ್ಕಾರಿ ಶುಲ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Application Details */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">
                {language === 'en' ? 'Application Summary' : 'ಅರ್ಜಿ ಸಾರಾಂಶ'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Service:</strong> {serviceName}</div>
                <div><strong>Applicant:</strong> {applicantName}</div>
                <div><strong>Application ID:</strong> {applicationId}</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">{language === 'en' ? 'Fee Description' : 'ಶುಲ್ಕ ವಿವರಣೆ'}</th>
                    <th className="px-4 py-3 text-right">{language === 'en' ? 'Amount' : 'ಮೊತ್ತ'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3">{language === 'en' ? 'Application Fee' : 'ಅರ್ಜಿ ಶುಲ್ಕ'}</td>
                    <td className="px-4 py-3 text-right">₹{fees.applicationFee}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">{language === 'en' ? 'Test Fee' : 'ಪರೀಕ್ಷಾ ಶುಲ್ಕ'}</td>
                    <td className="px-4 py-3 text-right">₹{fees.testFee}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">{language === 'en' ? 'License Fee' : 'ಪರವಾನಗಿ ಶುಲ್ಕ'}</td>
                    <td className="px-4 py-3 text-right">₹{fees.licenseFee}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-3">{language === 'en' ? 'Service Tax (18%)' : 'ಸೇವಾ ತೆರಿಗೆ (18%)'}</td>
                    <td className="px-4 py-3 text-right">₹{fees.serviceTax}</td>
                  </tr>
                  <tr className="border-t bg-green-50">
                    <td className="px-4 py-3 font-bold text-green-700">
                      {language === 'en' ? 'Total Amount' : 'ಒಟ್ಟು ಮೊತ್ತ'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">₹{fees.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Button 
              onClick={() => setPaymentStep(2)} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {language === 'en' ? 'Proceed to Payment' : 'ಪಾವತಿಗೆ ಮುಂದುವರಿಯಿರಿ'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payment Method Selection */}
      {paymentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="text-blue-600" size={24} />
              <span>{language === 'en' ? 'Choose Payment Method' : 'ಪಾವತಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}</span>
            </CardTitle>
            <CardDescription>
              {language === 'en' 
                ? 'Select your preferred payment method. All payments are secured with 256-bit encryption.'
                : 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಪಾವತಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಎಲ್ಲಾ ಪಾವತಿಗಳು ೨೫೬-ಬಿಟ್ ಎನ್‌ಕ್ರಿಪ್ಶನ್‌ನೊಂದಿಗೆ ಸುರಕ್ಷಿತವಾಗಿವೆ.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Methods */}
            <div className="grid gap-4">
              {/* UPI Payment */}
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('upi')}
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="text-purple-600" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold">{language === 'en' ? 'UPI Payment' : 'UPI ಪಾವತಿ'}</h3>
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? 'Pay using any UPI app (GPay, PhonePe, Paytm)' : 'ಯಾವುದೇ UPI ಅಪ್ಲಿಕೇಶನ್ ಬಳಸಿ ಪಾವತಿಸಿ (GPay, PhonePe, Paytm)'}
                    </p>
                  </div>
                  <Badge variant="secondary">Instant</Badge>
                </div>
              </div>

              {/* Card Payment */}
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('card')}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="text-blue-600" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold">{language === 'en' ? 'Credit/Debit Card' : 'ಕ್ರೆಡಿಟ್/ಡೆಬಿಟ್ ಕಾರ್ಡ್'}</h3>
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? 'Visa, Mastercard, RuPay cards accepted' : 'Visa, Mastercard, RuPay ಕಾರ್ಡ್‌ಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುತ್ತದೆ'}
                    </p>
                  </div>
                  <Badge variant="secondary">Secure</Badge>
                </div>
              </div>

              {/* Net Banking */}
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMethod === 'netbanking' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('netbanking')}
              >
                <div className="flex items-center space-x-3">
                  <Smartphone className="text-green-600" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold">{language === 'en' ? 'Net Banking' : 'ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್'}</h3>
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? 'All major banks supported' : 'ಎಲ್ಲಾ ಪ್ರಮುಖ ಬ್ಯಾಂಕ್‌ಗಳನ್ನು ಬೆಂಬಲಿಸಲಾಗುತ್ತದೆ'}
                    </p>
                  </div>
                  <Badge variant="secondary">Trusted</Badge>
                </div>
              </div>
            </div>

            {/* Payment Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="text-yellow-600" size={20} />
                <p className="text-sm text-yellow-700">
                  {language === 'en' 
                    ? '🔒 Your payment is secured with bank-grade encryption. We do not store your card details.'
                    : '🔒 ನಿಮ್ಮ ಪಾವತಿಯು ಬ್ಯಾಂಕ್-ಗ್ರೇಡ್ ಎನ್‌ಕ್ರಿಪ್ಶನ್‌ನೊಂದಿಗೆ ಸುರಕ್ಷಿತವಾಗಿದೆ. ನಾವು ನಿಮ್ಮ ಕಾರ್ಡ್ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ.'
                  }
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setPaymentStep(1)}
                className="flex-1"
              >
                {language === 'en' ? 'Back' : 'ಹಿಂದಕ್ಕೆ'}
              </Button>
              <Button 
                onClick={() => processPayment(selectedMethod)}
                disabled={!selectedMethod}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {language === 'en' ? `Pay ₹${fees.total}` : `₹${fees.total} ಪಾವತಿಸಿ`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Processing */}
      {paymentStep === 3 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-xl font-semibold">
                {language === 'en' ? 'Processing Payment...' : 'ಪಾವತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...'}
              </h3>
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'Please wait while we securely process your payment. Do not refresh or close this page.'
                  : 'ನಾವು ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಾಗ ದಯವಿಟ್ಟು ಕಾಯಿರಿ. ಈ ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಬೇಡಿ ಅಥವಾ ಮುಚ್ಚಬೇಡಿ.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {paymentStep === 4 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  {language === 'en' ? 'Payment Successful!' : 'ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ!'}
                </h2>
                <p className="text-gray-600">
                  {language === 'en' 
                    ? 'Your payment has been processed successfully. You will receive a confirmation email shortly.'
                    : 'ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ. ನೀವು ಶೀಘ್ರದಲ್ಲೇ ದೃಢೀಕರಣ ಇಮೇಲ್ ಅನ್ನು ಸ್ವೀಕರಿಸುವಿರಿ.'
                  }
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4">
                  {language === 'en' ? 'Payment Details' : 'ಪಾವತಿ ವಿವರಗಳು'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Payment ID:</strong> {paymentId}</div>
                  <div><strong>Amount:</strong> ₹{fees.total}</div>
                  <div><strong>Method:</strong> {selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'Card' : 'Net Banking'}</div>
                  <div><strong>Status:</strong> <span className="text-green-600">SUCCESS</span></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={generateReceipt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download size={16} className="mr-2" />
                  {language === 'en' ? 'Download Receipt' : 'ರಸೀದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ'}
                </Button>
                
                <Button 
                  onClick={sendEmailConfirmation}
                  variant="outline"
                  className="flex-1"
                >
                  <Mail size={16} className="mr-2" />
                  {language === 'en' ? 'Email Receipt' : 'ಇಮೇಲ್ ರಸೀದಿ'}
                </Button>
              </div>

              {receiptGenerated && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    ✅ {language === 'en' 
                      ? 'Digital receipt downloaded successfully!'
                      : 'ಡಿಜಿಟಲ್ ರಸೀದಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ!'
                    }
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  {language === 'en' 
                    ? 'Transaction ID: TXN' + Date.now()
                    : 'ವ್ಯವಹಾರ ID: TXN' + Date.now()
                  }
                </p>
                <p>
                  {language === 'en' 
                    ? 'Processing Time: ' + new Date().toLocaleString('en-IN')
                    : 'ಪ್ರಕ್ರಿಯೆಯ ಸಮಯ: ' + new Date().toLocaleString('en-IN')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentSystem;