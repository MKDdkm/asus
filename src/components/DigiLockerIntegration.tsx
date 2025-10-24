import { useState } from "react";
import { Cloud, Download, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";

interface DigiLockerDocument {
  docType: string;
  uri: string;
  name: string;
  size: string;
  issuer: string;
  description: string;
}

interface DigiLockerIntegrationProps {
  onDocumentFetched?: (document: DigiLockerDocument) => void;
  allowedDocTypes?: string[];
}

const DigiLockerIntegration = ({ 
  onDocumentFetched, 
  allowedDocTypes = ['AADHAAR', 'PAN', 'DRVLC', 'VEHRC'] 
}: DigiLockerIntegrationProps) => {
  const { t } = useLanguage();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [documents, setDocuments] = useState<DigiLockerDocument[]>([]);
  const [error, setError] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // DigiLocker document type mapping
  const docTypeNames: Record<string, string> = {
    'AADHAAR': t['digilocker.aadhaar'] || 'Aadhaar Card',
    'PAN': t['digilocker.pan'] || 'PAN Card',
    'DRVLC': t['digilocker.drivingLicense'] || 'Driving License',
    'VEHRC': t['digilocker.vehicleRC'] || 'Vehicle RC',
    'ECERT': t['digilocker.educationCert'] || 'Education Certificate',
    'BRCERT': t['digilocker.birthCert'] || 'Birth Certificate'
  };

  // Step 1: Connect to DigiLocker (OAuth flow)
  const connectToDigiLocker = async () => {
    setIsConnecting(true);
    setError("");

    try {
      // In production, this would redirect to DigiLocker OAuth
      // For demo, we'll simulate the connection
      
      // Real implementation would be:
      // window.location.href = `${API_BASE_URL}/digilocker/authorize`;
      
      // Simulate OAuth flow
      setTimeout(() => {
        // Simulate receiving OAuth callback with code
        const mockAuthCode = 'mock_auth_code_' + Date.now();
        exchangeCodeForToken(mockAuthCode);
      }, 1500);

    } catch (err) {
      setError(t['digilocker.connectionError'] || 'Failed to connect to DigiLocker');
      setIsConnecting(false);
    }
  };

  // Step 2: Exchange auth code for access token
  const exchangeCodeForToken = async (authCode: string) => {
    try {
      // Real API call:
      // const response = await fetch(`${API_BASE_URL}/digilocker/token`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code: authCode })
      // });
      // const data = await response.json();
      
      // Mock token for demo
      const mockToken = 'mock_access_token_' + Date.now();
      setAccessToken(mockToken);
      setIsConnected(true);
      setIsConnecting(false);
      
      // Auto-fetch documents after connection
      fetchDocuments(mockToken);
    } catch (err) {
      setError(t['digilocker.tokenError'] || 'Failed to authenticate with DigiLocker');
      setIsConnecting(false);
    }
  };

  // Step 3: Fetch available documents
  const fetchDocuments = async (token: string) => {
    setIsFetching(true);
    setError("");

    try {
      // Real API call:
      // const response = await fetch(`${API_BASE_URL}/digilocker/documents`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Mock documents for demo
      const mockDocuments: DigiLockerDocument[] = [
        {
          docType: 'AADHAAR',
          uri: 'digilocker://UIDAI/AADHAAR/1234-5678-9012',
          name: 'Aadhaar Card',
          size: '245 KB',
          issuer: 'UIDAI',
          description: 'Aadhaar issued by UIDAI'
        },
        {
          docType: 'DRVLC',
          uri: 'digilocker://KA/DRVLC/KA19-2023-0001234',
          name: 'Driving License',
          size: '189 KB',
          issuer: 'Transport Department, Karnataka',
          description: 'Driving License - Karnataka'
        },
        {
          docType: 'PAN',
          uri: 'digilocker://ITD/PAN/ABCDE1234F',
          name: 'PAN Card',
          size: '156 KB',
          issuer: 'Income Tax Department',
          description: 'Permanent Account Number'
        }
      ].filter(doc => allowedDocTypes.includes(doc.docType));

      setDocuments(mockDocuments);
      setIsFetching(false);
    } catch (err) {
      setError(t['digilocker.fetchError'] || 'Failed to fetch documents');
      setIsFetching(false);
    }
  };

  // Step 4: Download specific document
  const downloadDocument = async (document: DigiLockerDocument) => {
    try {
      // Real API call:
      // const response = await fetch(`${API_BASE_URL}/digilocker/download`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${accessToken}` 
      //   },
      //   body: JSON.stringify({ uri: document.uri })
      // });
      // const blob = await response.blob();
      
      // Mock document download
      console.log('Downloading document:', document);
      
      // Trigger callback with document info
      if (onDocumentFetched) {
        onDocumentFetched(document);
      }

      // Show success message
      setError("");
      alert(t['digilocker.downloadSuccess'] || `${document.name} fetched successfully!`);
      
    } catch (err) {
      setError(t['digilocker.downloadError'] || 'Failed to download document');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Cloud className="w-6 h-6 text-blue-600" />
          <CardTitle>{t['digilocker.title'] || 'DigiLocker Integration'}</CardTitle>
        </div>
        <CardDescription>
          {t['digilocker.description'] || 'Fetch your documents directly from DigiLocker'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Connect Button */}
        {!isConnected && (
          <div className="text-center py-6">
            <Button 
              onClick={connectToDigiLocker}
              disabled={isConnecting}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t['digilocker.connecting'] || 'Connecting...'}
                </>
              ) : (
                <>
                  <Cloud className="mr-2 h-5 w-5" />
                  {t['digilocker.connect'] || 'Connect to DigiLocker'}
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              {t['digilocker.secureNote'] || 'Secure OAuth 2.0 authentication'}
            </p>
          </div>
        )}

        {/* Connected State - Show Documents */}
        {isConnected && (
          <div className="space-y-4">
            {/* Connection Status */}
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {t['digilocker.connected'] || 'Connected to DigiLocker successfully'}
              </AlertDescription>
            </Alert>

            {/* Loading Documents */}
            {isFetching && (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-gray-500 mt-2">
                  {t['digilocker.fetchingDocs'] || 'Fetching your documents...'}
                </p>
              </div>
            )}

            {/* Documents List */}
            {!isFetching && documents.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">
                  {t['digilocker.availableDocs'] || 'Available Documents'}
                </h4>
                {documents.map((doc, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {docTypeNames[doc.docType] || doc.name}
                        </h5>
                        <p className="text-sm text-gray-500">{doc.issuer}</p>
                        <p className="text-xs text-gray-400 mt-1">{doc.size}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => downloadDocument(doc)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {t['digilocker.fetch'] || 'Fetch'}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* No Documents */}
            {!isFetching && documents.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>{t['digilocker.noDocs'] || 'No documents found'}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DigiLockerIntegration;
