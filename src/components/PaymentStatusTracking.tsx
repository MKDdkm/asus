import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Receipt,
  Download,
  RefreshCw,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
  Eye,
  Copy,
  ExternalLink
} from "lucide-react";

interface PaymentRecord {
  id: string;
  paymentId: string;
  applicationId: string;
  serviceName: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  method: string;
  timestamp: Date;
  transactionId: string;
  receiptUrl?: string;
  refundId?: string;
  failureReason?: string;
}

const PaymentStatusTracking: React.FC = () => {
  const { language } = useLanguage();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock payment records
  const mockPayments: PaymentRecord[] = [
    {
      id: '1',
      paymentId: 'PAY1728337890123',
      applicationId: 'DL2024001',
      serviceName: language === 'en' ? 'Driving License Application' : 'ಚಾಲನಾ ಪರವಾನಗಿ ಅರ್ಜಿ',
      amount: 1680,
      status: 'success',
      method: 'UPI',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      transactionId: 'TXN1728337890456',
      receiptUrl: 'mock-receipt-1.pdf'
    },
    {
      id: '2',
      paymentId: 'PAY1728234567890',
      applicationId: 'AD2024002',
      serviceName: language === 'en' ? 'Aadhaar Update Service' : 'ಆಧಾರ್ ನವೀಕರಣ ಸೇವೆ',
      amount: 177,
      status: 'processing',
      method: 'Card',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      transactionId: 'TXN1728234567123'
    },
    {
      id: '3',
      paymentId: 'PAY1728123456789',
      applicationId: 'PS2024003',
      serviceName: language === 'en' ? 'Passport Application' : 'ಪಾಸ್‌ಪೋರ್ಟ್ ಅರ್ಜಿ',
      amount: 1500,
      status: 'failed',
      method: 'Net Banking',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      transactionId: 'TXN1728123456456',
      failureReason: language === 'en' ? 'Insufficient funds' : 'ಸಾಕಷ್ಟು ಹಣವಿಲ್ಲ'
    },
    {
      id: '4',
      paymentId: 'PAY1728012345678',
      applicationId: 'RC2024004',
      serviceName: language === 'en' ? 'Vehicle Registration' : 'ವಾಹನ ನೋಂದಣಿ',
      amount: 2500,
      status: 'pending',
      method: 'UPI',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      transactionId: 'TXN1728012345345'
    },
    {
      id: '5',
      paymentId: 'PAY1727901234567',
      applicationId: 'DL2024005',
      serviceName: language === 'en' ? 'Driving License Renewal' : 'ಚಾಲನಾ ಪರವಾನಗಿ ನವೀಕರಣ',
      amount: 800,
      status: 'refunded',
      method: 'Card',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      transactionId: 'TXN1727901234890',
      refundId: 'REF1727901234567'
    }
  ];

  useEffect(() => {
    setPayments(mockPayments);
  }, [language]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="text-green-500" size={16} />;
      case 'processing': return <RefreshCw className="text-blue-500 animate-spin" size={16} />;
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      case 'failed': return <AlertTriangle className="text-red-500" size={16} />;
      case 'refunded': return <RefreshCw className="text-purple-500" size={16} />;
      default: return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusText = {
      'success': language === 'en' ? 'Success' : 'ಯಶಸ್ವಿ',
      'processing': language === 'en' ? 'Processing' : 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ',
      'pending': language === 'en' ? 'Pending' : 'ಬಾಕಿ',
      'failed': language === 'en' ? 'Failed' : 'ವಿಫಲ',
      'refunded': language === 'en' ? 'Refunded' : 'ಮರುಪಾವತಿ'
    };

    const statusColors = {
      'success': 'bg-green-100 text-green-700',
      'processing': 'bg-blue-100 text-blue-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'failed': 'bg-red-100 text-red-700',
      'refunded': 'bg-purple-100 text-purple-700'
    };

    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} border-0`}>
        {getStatusIcon(status)}
        <span className="ml-1">{statusText[status as keyof typeof statusText]}</span>
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'en' ? 'en-IN' : 'kn-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(language === 'en' 
      ? '✅ Copied to clipboard!' 
      : '✅ ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಲಾಗಿದೆ!'
    );
  };

  const downloadReceipt = (payment: PaymentRecord) => {
    // Mock receipt download
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${payment.paymentId}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #0066cc; font-size: 24px; font-weight: bold; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .status-${payment.status} { color: ${payment.status === 'success' ? '#28a745' : payment.status === 'failed' ? '#dc3545' : '#0066cc'}; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏛️ Government of Karnataka</div>
          <h2>Payment Receipt</h2>
        </div>
        <div class="details">
          <div>
            <strong>Payment ID:</strong> ${payment.paymentId}<br>
            <strong>Application ID:</strong> ${payment.applicationId}<br>
            <strong>Service:</strong> ${payment.serviceName}<br>
            <strong>Amount:</strong> ₹${payment.amount}
          </div>
          <div>
            <strong>Status:</strong> <span class="status-${payment.status}">${payment.status.toUpperCase()}</span><br>
            <strong>Method:</strong> ${payment.method}<br>
            <strong>Date:</strong> ${formatDate(payment.timestamp)}<br>
            <strong>Transaction ID:</strong> ${payment.transactionId}
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${payment.paymentId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshPaymentStatus = async (paymentId: string) => {
    setIsLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate status update
    setPayments(prev => prev.map(payment => 
      payment.paymentId === paymentId 
        ? { ...payment, status: 'success' as const } 
        : payment
    ));
    
    setIsLoading(false);
    alert(language === 'en' 
      ? '✅ Payment status updated!' 
      : '✅ ಪಾವತಿ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ!'
    );
  };

  const retryPayment = (payment: PaymentRecord) => {
    alert(language === 'en' 
      ? `🔄 Redirecting to payment gateway for ${payment.applicationId}...` 
      : `🔄 ${payment.applicationId} ಗಾಗಿ ಪಾವತಿ ಗೇಟ್‌ವೇಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ...`
    );
  };

  const initiateRefund = (payment: PaymentRecord) => {
    alert(language === 'en' 
      ? `💰 Refund initiated for payment ${payment.paymentId}. You will receive the amount in 3-5 business days.` 
      : `💰 ಪಾವತಿ ${payment.paymentId} ಗಾಗಿ ಮರುಪಾವತಿಯನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ. 3-5 ವ್ಯಾಪಾರ ದಿನಗಳಲ್ಲಿ ನೀವು ಮೊತ್ತವನ್ನು ಸ್ವೀಕರಿಸುವಿರಿ.`
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="text-blue-600" size={24} />
            <span>{language === 'en' ? 'Payment & Receipt Management' : 'ಪಾವತಿ ಮತ್ತು ರಸೀದಿ ನಿರ್ವಹಣೆ'}</span>
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Track your payments, download receipts, and manage transactions'
              : 'ನಿಮ್ಮ ಪಾವತಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ರಸೀದಿಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ವ್ಯವಹಾರಗಳನ್ನು ನಿರ್ವಹಿಸಿ'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder={language === 'en' 
                  ? 'Search by Payment ID, Application ID, Transaction ID...'
                  : 'ಪಾವತಿ ID, ಅರ್ಜಿ ID, ವ್ಯವಹಾರ ID ಯಿಂದ ಹುಡುಕಿ...'
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
              <option value="all">{language === 'en' ? 'All Status' : 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು'}</option>
              <option value="success">{language === 'en' ? 'Success' : 'ಯಶಸ್ವಿ'}</option>
              <option value="processing">{language === 'en' ? 'Processing' : 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ'}</option>
              <option value="pending">{language === 'en' ? 'Pending' : 'ಬಾಕಿ'}</option>
              <option value="failed">{language === 'en' ? 'Failed' : 'ವಿಫಲ'}</option>
              <option value="refunded">{language === 'en' ? 'Refunded' : 'ಮರುಪಾವತಿ'}</option>
            </select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'success').length}
              </div>
              <div className="text-sm text-green-700">{language === 'en' ? 'Successful' : 'ಯಶಸ್ವಿ'}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {payments.filter(p => p.status === 'processing').length}
              </div>
              <div className="text-sm text-blue-700">{language === 'en' ? 'Processing' : 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ'}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {payments.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-700">{language === 'en' ? 'Pending' : 'ಬಾಕಿ'}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {payments.filter(p => p.status === 'failed').length}
              </div>
              <div className="text-sm text-red-700">{language === 'en' ? 'Failed' : 'ವಿಫಲ'}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0)}
              </div>
              <div className="text-sm text-purple-700">{language === 'en' ? 'Total Paid' : 'ಒಟ್ಟು ಪಾವತಿ'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Records */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                {language === 'en' 
                  ? 'No payment records found matching your search.'
                  : 'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಪಾವತಿ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className={`transition-all ${
              payment.status === 'failed' ? 'border-red-200' : 
              payment.status === 'success' ? 'border-green-200' : 
              'border-gray-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Payment Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between lg:justify-start lg:space-x-4">
                      <h3 className="font-semibold text-lg">{payment.serviceName}</h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{language === 'en' ? 'Payment ID:' : 'ಪಾವತಿ ID:'}</span>
                          <span className="font-mono">{payment.paymentId}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payment.paymentId)}
                            className="p-1 h-auto"
                          >
                            <Copy size={12} />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{language === 'en' ? 'Application ID:' : 'ಅರ್ಜಿ ID:'}</span>
                          <span className="font-mono">{payment.applicationId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <IndianRupee size={14} className="text-green-600" />
                          <span className="font-bold text-green-600">₹{payment.amount}</span>
                          <span className="text-gray-500">via {payment.method}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{formatDate(payment.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{language === 'en' ? 'Transaction ID:' : 'ವ್ಯವಹಾರ ID:'}</span>
                          <span className="font-mono text-xs">{payment.transactionId}</span>
                        </div>
                        {payment.refundId && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">{language === 'en' ? 'Refund ID:' : 'ಮರುಪಾವತಿ ID:'}</span>
                            <span className="font-mono text-xs">{payment.refundId}</span>
                          </div>
                        )}
                        {payment.failureReason && (
                          <div className="flex items-center space-x-2">
                            <AlertTriangle size={14} className="text-red-500" />
                            <span className="text-red-600 text-xs">{payment.failureReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[120px]">
                    {payment.status === 'success' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReceipt(payment)}
                          className="flex items-center space-x-1"
                        >
                          <Download size={14} />
                          <span>{language === 'en' ? 'Receipt' : 'ರಸೀದಿ'}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(payment.transactionId)}
                          className="flex items-center space-x-1"
                        >
                          <Copy size={14} />
                          <span>{language === 'en' ? 'Copy ID' : 'ID ನಕಲಿಸಿ'}</span>
                        </Button>
                      </>
                    )}
                    
                    {(payment.status === 'processing' || payment.status === 'pending') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshPaymentStatus(payment.paymentId)}
                        disabled={isLoading}
                        className="flex items-center space-x-1"
                      >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        <span>{language === 'en' ? 'Refresh' : 'ನವೀಕರಿಸಿ'}</span>
                      </Button>
                    )}
                    
                    {payment.status === 'failed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryPayment(payment)}
                          className="flex items-center space-x-1"
                        >
                          <RefreshCw size={14} />
                          <span>{language === 'en' ? 'Retry' : 'ಮರುಪ್ರಯತ್ನ'}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => initiateRefund(payment)}
                          className="flex items-center space-x-1 text-purple-600"
                        >
                          <IndianRupee size={14} />
                          <span>{language === 'en' ? 'Refund' : 'ಮರುಪಾವತಿ'}</span>
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert(`${language === 'en' ? 'Payment Details:' : 'ಪಾವತಿ ವಿವರಗಳು:'}\n\n${JSON.stringify(payment, null, 2)}`)}
                      className="flex items-center space-x-1"
                    >
                      <Eye size={14} />
                      <span>{language === 'en' ? 'Details' : 'ವಿವರಗಳು'}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentStatusTracking;