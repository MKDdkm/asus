import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VoiceInput from "@/components/VoiceInput";
import VoiceField from "@/components/VoiceField";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mic, Volume2, CheckCircle } from "lucide-react";

const VoiceTestPage = () => {
  const { language, t } = useLanguage();
  const [voiceResult, setVoiceResult] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleVoiceTranscript = (transcript: string) => {
    setVoiceResult(transcript);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Voice Input Testing' : 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಪರೀಕ್ಷೆ'}
          </h1>
          <p className="text-lg text-gray-600">
            {language === 'en' 
              ? 'Test voice recognition in English and Kannada'
              : 'ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ'
            }
          </p>
        </div>

        <div className="grid gap-6">
          {/* Basic Voice Input Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="text-blue-600" size={24} />
                <span>
                  {language === 'en' ? 'Basic Voice Input' : 'ಮೂಲಭೂತ ಧ್ವನಿ ಇನ್‌ಪುಟ್'}
                </span>
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Click "Speak" and say something. Your speech will be converted to text.'
                  : '"ಮಾತನಾಡಿ" ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ಏನಾದರೂ ಹೇಳಿ. ನಿಮ್ಮ ಭಾಷಣವನ್ನು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತದೆ.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                className="w-full"
              />
              
              {voiceResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-semibold text-green-700">
                      {language === 'en' ? 'Voice Recognition Result:' : 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಫಲಿತಾಂಶ:'}
                    </span>
                  </div>
                  <p className="text-gray-800 text-lg">{voiceResult}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voice Form Fields Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="text-purple-600" size={24} />
                <span>
                  {language === 'en' ? 'Voice Form Fields' : 'ಧ್ವನಿ ಫಾರ್ಮ್ ಕ್ಷೇತ್ರಗಳು'}
                </span>
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Test voice input with form fields. Each field has its own voice input button.'
                  : 'ಫಾರ್ಮ್ ಕ್ಷೇತ್ರಗಳೊಂದಿಗೆ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಪರೀಕ್ಷಿಸಿ. ಪ್ರತಿ ಕ್ಷೇತ್ರವು ತನ್ನದೇ ಆದ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬಟನ್ ಹೊಂದಿದೆ.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <VoiceField
                  label={language === 'en' ? 'Full Name' : 'ಪೂರ್ಣ ಹೆಸರು'}
                  value={formData.name}
                  onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  placeholder={language === 'en' ? 'Say your full name' : 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಹೇಳಿ'}
                />
                
                <VoiceField
                  label={language === 'en' ? 'Phone Number' : 'ಫೋನ್ ಸಂಖ್ಯೆ'}
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  placeholder={language === 'en' ? 'Say your phone number' : 'ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ ಹೇಳಿ'}
                  type="tel"
                />
                
                <VoiceField
                  label={language === 'en' ? 'Email Address' : 'ಇಮೇಲ್ ವಿಳಾಸ'}
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  placeholder={language === 'en' ? 'Say your email address' : 'ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ಹೇಳಿ'}
                  type="email"
                />
                
                <VoiceField
                  label={language === 'en' ? 'Address' : 'ವಿಳಾಸ'}
                  value={formData.address}
                  onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                  placeholder={language === 'en' ? 'Say your address' : 'ನಿಮ್ಮ ವಿಳಾಸವನ್ನು ಹೇಳಿ'}
                />
              </div>
              
              {/* Form Data Preview */}
              {(formData.name || formData.phone || formData.email || formData.address) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2">
                    {language === 'en' ? 'Form Data Preview:' : 'ಫಾರ್ಮ್ ಡೇಟಾ ಪೂರ್ವವೀಕ್ಷಣೆ:'}
                  </h3>
                  <div className="space-y-1 text-gray-700">
                    {formData.name && <p><strong>Name:</strong> {formData.name}</p>}
                    {formData.phone && <p><strong>Phone:</strong> {formData.phone}</p>}
                    {formData.email && <p><strong>Email:</strong> {formData.email}</p>}
                    {formData.address && <p><strong>Address:</strong> {formData.address}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Instructions' : 'ಸೂಚನೆಗಳು'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-700">
                <h4 className="font-semibold">
                  {language === 'en' ? 'How to use voice input:' : 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಅನ್ನು ಹೇಗೆ ಬಳಸುವುದು:'}
                </h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    {language === 'en' 
                      ? '1. Click the "Speak" button next to any field'
                      : '೧. ಯಾವುದೇ ಕ್ಷೇತ್ರದ ಪಕ್ಕದಲ್ಲಿರುವ "ಮಾತನಾಡಿ" ಬಟನ್ ಒತ್ತಿ'
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? '2. Allow microphone access when prompted'
                      : '೨. ಕೇಳಿದಾಗ ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶಕ್ಕೆ ಅನುಮತಿ ನೀಡಿ'
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? '3. Speak clearly in English or Kannada'
                      : '೩. ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ'
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? '4. The text will automatically appear in the field'
                      : '೪. ಪಠ್ಯವು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ'
                    }
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceTestPage;