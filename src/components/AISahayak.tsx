import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Upload, 
  FileText,
  Bot,
  User,
  Minimize2,
  Maximize2
} from "lucide-react";

// TypeScript declarations for Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  action?: {
    type: 'navigate' | 'fillForm';
    target: string;
    data?: any;
  };
}

interface Conversation {
  messages: Message[];
  context: {
    intent?: string;
    service?: string;
    formData?: any;
  };
}

const AISahayak = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  // Chatbot State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation>({
    messages: [],
    context: {}
  });
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert(language === 'en' 
            ? 'Microphone permission denied. Please allow microphone access to use voice input.'
            : 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬಳಸಲು ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ.'
          );
        }
      };

      (recognitionRef.current as any).onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  // Service Keywords and Intent Detection
  const serviceKeywords = {
    'driving-license': [
      'driving license', 'license', 'dl', 'driving', 'vehicle', 'car', 'bike', 'motorcycle',
      'ಚಾಲನಾ ಪರವಾನಗಿ', 'ಲೈಸೆನ್ಸ್', 'ಗಾಡಿ', 'ಕಾರ್', 'ಬೈಕ್'
    ],
    'aadhaar': [
      'aadhaar', 'aadhar', 'uid', 'identity', 'ಆಧಾರ್', 'ಗುರುತು'
    ],
    'passport': [
      'passport', 'travel', 'visa', 'ಪಾಸ್‌ಪೋರ್ಟ್', 'ಪ್ರಯಾಣ'
    ],
    'ration': [
      'ration', 'food', 'pds', 'ಅಂಗಡಿ', 'ರೇಷನ್'
    ],
    'pension': [
      'pension', 'retirement', 'old age', 'ಪಿಂಚಣಿ', 'ವೃದ್ಧಾಶ್ರಮ'
    ]
  };

  // Document Requirements Database
  const documentRequirements = {
    'driving-license': {
      required: language === 'en' ? [
        'Aadhaar Card (Original + Photocopy)',
        'Passport Size Photos (4 copies)',
        'Age Proof (Birth Certificate/10th Standard Certificate)',
        'Address Proof (Utility Bill/Bank Statement)',
        'Medical Certificate (Form 1A)',
        'Learning License (if applicable)'
      ] : [
        'ಆಧಾರ್ ಕಾರ್ಡ್ (ಮೂಲ + ಫೋಟೋಕಾಪಿ)',
        'ಪಾಸ್‌ಪೋರ್ಟ್ ಗಾತ್ರದ ಫೋಟೋಗಳು (೪ ಪ್ರತಿಗಳು)',
        'ವಯಸ್ಸಿನ ಪುರಾವೆ (ಜನನ ಪ್ರಮಾಣಪತ್ರ/೧೦ನೇ ತರಗತಿಯ ಪ್ರಮಾಣಪತ್ರ)',
        'ವಿಳಾಸ ಪುರಾವೆ (ಯುಟಿಲಿಟಿ ಬಿಲ್/ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್)',
        'ವೈದ್ಯಕೀಯ ಪ್ರಮಾಣಪತ್ರ (ಫಾರ್ಮ್ ೧ಎ)',
        'ಕಲಿಕಾ ಪರವಾನಗಿ (ಅನ್ವಯಿಸಿದರೆ)'
      ],
      fees: language === 'en' ? '₹1,000 - ₹2,500 (varies by category)' : '₹೧,೦೦೦ - ₹೨,೫೦೦ (ವರ್ಗದ ಅನುಸಾರ ಬದಲಾಗುತ್ತದೆ)',
      processing: language === 'en' ? '15-30 working days' : '೧೫-೩೦ ಕೆಲಸದ ದಿನಗಳು',
      validity: language === 'en' ? '20 years (or until age 50)' : '೨೦ ವರ್ಷಗಳು (ಅಥವಾ ೫೦ ವರ್ಷದವರೆಗೆ)'
    }
  };

  const detectIntent = (text: string): { intent: string; service?: string; confidence: number } => {
    const lowerText = text.toLowerCase();
    
    // Check for service keywords
    for (const [service, keywords] of Object.entries(serviceKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          if (lowerText.includes('apply') || lowerText.includes('ಅರ್ಜಿ')) {
            return { intent: 'apply_service', service, confidence: 0.9 };
          }
          if (lowerText.includes('status') || lowerText.includes('ಸ್ಥಿತಿ')) {
            return { intent: 'check_status', service, confidence: 0.8 };
          }
          if (lowerText.includes('document') || lowerText.includes('required') || lowerText.includes('ದಾಖಲೆ') || lowerText.includes('ಅಗತ್ಯ')) {
            return { intent: 'document_requirements', service, confidence: 0.9 };
          }
          if (lowerText.includes('fees') || lowerText.includes('cost') || lowerText.includes('ಶುಲ್ಕ') || lowerText.includes('ಬೆಲೆ')) {
            return { intent: 'fees_inquiry', service, confidence: 0.8 };
          }
          return { intent: 'service_inquiry', service, confidence: 0.7 };
        }
      }
    }
    
    // General intents
    if (lowerText.includes('help') || lowerText.includes('ಸಹಾಯ')) {
      return { intent: 'help', confidence: 0.8 };
    }
    
    return { intent: 'general', confidence: 0.5 };
  };

  // Generate AI Response
  const generateResponse = (userMessage: string): Message => {
    const { intent, service, confidence } = detectIntent(userMessage);
    const messageId = Date.now().toString();
    
    let responseText = '';
    let suggestions: string[] = [];
    let action: Message['action'] = undefined;
    
    switch (intent) {
      case 'apply_service':
        if (service === 'driving-license') {
          responseText = language === 'en' 
            ? "I can help you apply for a driving license! I'll guide you through the process with automatic form filling using your Aadhaar details. Would you like to start the application?"
            : "ನಾನು ನಿಮಗೆ ಚಾಲನಾ ಪರವಾನಗಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ! ನಿಮ್ಮ ಆಧಾರ್ ವಿವರಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಸ್ವಯಂಚಾಲಿತ ಫಾರ್ಮ್ ಭರ್ತಿಯೊಂದಿಗೆ ನಾನು ನಿಮಗೆ ಪ್ರಕ್ರಿಯೆಯ ಮೂಲಕ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ. ಅರ್ಜಿಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಬಯಸುವಿರಾ?";
          suggestions = language === 'en' 
            ? ["Start Application", "Required Documents", "Fees Information", "Check Eligibility"]
            : ["ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ", "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "ಶುಲ್ಕ ಮಾಹಿತಿ", "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ"];
          action = { type: 'navigate', target: '/services/driving-license' };
        } else {
          responseText = language === 'en'
            ? `I can help you with ${service} services. This service will be available soon with auto-fill capabilities.`
            : `ನಾನು ನಿಮಗೆ ${service} ಸೇವೆಗಳೊಂದಿಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಸ್ವಯಂ-ಭರ್ತಿ ಸಾಮರ್ಥ್ಯಗಳೊಂದಿಗೆ ಈ ಸೇವೆ ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗುತ್ತದೆ.`;
        }
        break;
        
      case 'document_requirements':
        if (service === 'driving-license' && documentRequirements[service]) {
          const docs = documentRequirements[service];
          responseText = language === 'en'
            ? `📋 Required Documents for Driving License:\n\n${docs.required.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}\n\n💰 Fees: ${docs.fees}\n⏱️ Processing Time: ${docs.processing}\n📅 Validity: ${docs.validity}\n\nWould you like me to help you apply with voice-guided form filling?`
            : `📋 ಚಾಲನಾ ಪರವಾನಗಿಗೆ ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು:\n\n${docs.required.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}\n\n💰 ಶುಲ್ಕ: ${docs.fees}\n⏱️ ಪ್ರಕ್ರಿಯೆಯ ಸಮಯ: ${docs.processing}\n📅 ಮಾನ್ಯತೆ: ${docs.validity}\n\nಧ್ವನಿ-ಮಾರ್ಗದರ್ಶಿತ ಫಾರ್ಮ್ ಭರ್ತಿಯೊಂದಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬೇಕೇ?`;
          suggestions = language === 'en'
            ? ["Start Application", "Voice Form Filling", "Check Eligibility", "Upload Documents"]
            : ["ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ", "ಧ್ವನಿ ಫಾರ್ಮ್ ಭರ್ತಿ", "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ", "ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"];
          action = { type: 'navigate', target: '/services/driving-license' };
        } else {
          responseText = language === 'en'
            ? `Document requirements for ${service} will be available soon. For now, I have detailed information about driving license documents.`
            : `${service} ಗಾಗಿ ದಾಖಲೆ ಅವಶ್ಯಕತೆಗಳು ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗುತ್ತವೆ. ಸದ್ಯಕ್ಕೆ, ನನ್ನ ಬಳಿ ಚಾಲನಾ ಪರವಾನಗಿ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ವಿವರವಾದ ಮಾಹಿತಿ ಇದೆ.`;
        }
        break;

      case 'fees_inquiry':
        if (service === 'driving-license' && documentRequirements[service]) {
          const docs = documentRequirements[service];
          responseText = language === 'en'
            ? `💰 Driving License Fees Information:\n\n• Application Fee: ${docs.fees}\n• Processing Time: ${docs.processing}\n• Validity: ${docs.validity}\n\nNote: Additional charges may apply for tests and medical certificates. Would you like to start your application with auto-filled forms?`
            : `💰 ಚಾಲನಾ ಪರವಾನಗಿ ಶುಲ್ಕ ಮಾಹಿತಿ:\n\n• ಅರ್ಜಿ ಶುಲ್ಕ: ${docs.fees}\n• ಪ್ರಕ್ರಿಯೆಯ ಸಮಯ: ${docs.processing}\n• ಮಾನ್ಯತೆ: ${docs.validity}\n\nಗಮನಿಸಿ: ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ವೈದ್ಯಕೀಯ ಪ್ರಮಾಣಪತ್ರಗಳಿಗೆ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕಗಳು ಅನ್ವಯಿಸಬಹುದು. ಸ್ವಯಂ-ಭರ್ತಿ ಫಾರ್ಮ್‌ಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಬಯಸುವಿರಾ?`;
          suggestions = language === 'en'
            ? ["Start Application", "Payment Methods", "Required Documents", "Check Eligibility"]
            : ["ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ", "ಪಾವತಿ ವಿಧಾನಗಳು", "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ"];
          action = { type: 'navigate', target: '/services/driving-license' };
        } else {
          responseText = language === 'en'
            ? `Fee information for ${service} will be available soon. I can provide detailed fee structure for driving license applications.`
            : `${service} ಗಾಗಿ ಶುಲ್ಕ ಮಾಹಿತಿ ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗುತ್ತದೆ. ಚಾಲನಾ ಪರವಾನಗಿ ಅರ್ಜಿಗಳಿಗೆ ನಾನು ವಿವರವಾದ ಶುಲ್ಕ ರಚನೆಯನ್ನು ಒದಗಿಸಬಲ್ಲೆ.`;
        }
        break;
        
      case 'service_inquiry':
        responseText = language === 'en'
          ? `I can provide information about ${service} services. What specific information do you need?`
          : `ನಾನು ${service} ಸೇವೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ. ನಿಮಗೆ ಯಾವ ನಿರ್ದಿಷ್ಟ ಮಾಹಿತಿ ಬೇಕು?`;
        suggestions = language === 'en'
          ? ["How to Apply", "Required Documents", "Processing Time", "Fees"]
          : ["ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು", "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "ಪ್ರಕ್ರಿಯೆಯ ಸಮಯ", "ಶುಲ್ಕ"];
        break;
        
      case 'help':
        responseText = language === 'en'
          ? "I'm AI Sahayak, your government services assistant! I can help you with:\n• Apply for driving license with auto-fill\n• Get information about government services\n• Fill forms automatically using your data\n• Guide you through application processes\n\nWhat can I help you with today?"
          : "ನಾನು AI ಸಹಾಯಕ, ನಿಮ್ಮ ಸರ್ಕಾರಿ ಸೇವೆಗಳ ಸಹಾಯಕ! ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• ಸ್ವಯಂ-ಭರ್ತಿಯೊಂದಿಗೆ ಚಾಲನಾ ಪರವಾನಗಿಗೆ ಅರ್ಜಿ\n• ಸರ್ಕಾರಿ ಸೇವೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯುವುದು\n• ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಬಳಸಿಕೊಂಡು ಫಾರ್ಮ್‌ಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿ ಮಾಡುವುದು\n• ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಗಳ ಮೂಲಕ ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ\n\nಇಂದು ನಾನು ನಿಮಗೆ ಏನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ?";
        suggestions = language === 'en'
          ? ["Apply for Driving License", "Browse All Services", "Check Application Status", "Upload Documents"]
          : ["ಚಾಲನಾ ಪರವಾನಗಿಗೆ ಅರ್ಜಿ", "ಎಲ್ಲಾ ಸೇವೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ", "ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ", "ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"];
        break;
        
      default:
        responseText = language === 'en'
          ? "I understand you're looking for help with government services. Could you please specify which service you need assistance with? I can help with applications, document uploads, and form filling."
          : "ನೀವು ಸರ್ಕಾರಿ ಸೇವೆಗಳಿಗೆ ಸಹಾಯ ಹುಡುಕುತ್ತಿದ್ದೀರಿ ಎಂದು ನನಗೆ ಅರ್ಥವಾಗಿದೆ. ನಿಮಗೆ ಯಾವ ಸೇವೆಯ ಸಹಾಯ ಬೇಕು ಎಂದು ದಯವಿಟ್ಟು ನಿರ್ದಿಷ್ಟಪಡಿಸಬಹುದೇ? ನಾನು ಅರ್ಜಿಗಳು, ದಾಖಲೆ ಅಪ್‌ಲೋಡ್‌ಗಳು ಮತ್ತು ಫಾರ್ಮ್ ಭರ್ತಿಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.";
        suggestions = language === 'en'
          ? ["Driving License", "Aadhaar Services", "Passport", "Ration Card", "Browse All Services"]
          : ["ಚಾಲನಾ ಪರವಾನಗಿ", "ಆಧಾರ್ ಸೇವೆಗಳು", "ಪಾಸ್‌ಪೋರ್ಟ್", "ರೇಷನ್ ಕಾರ್ಡ್", "ಎಲ್ಲಾ ಸೇವೆಗಳು"];
    }
    
    return {
      id: messageId,
      text: responseText,
      isBot: true,
      timestamp: new Date(),
      suggestions,
      action
    };
  };

  // Speech Synthesis
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
      utterance.rate = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  // Stop Speech
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle Voice Input
  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle Message Sending
  const handleSendMessage = (message?: string) => {
    const messageText = message || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));

    setInputText('');
    setIsTyping(true);

    // Generate AI response after a brief delay
    setTimeout(() => {
      const botResponse = generateResponse(messageText);
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, botResponse],
        context: {
          ...prev.context,
          intent: detectIntent(messageText).intent,
          service: detectIntent(messageText).service
        }
      }));
      setIsTyping(false);
      
      // Auto-speak response
      if (botResponse.text) {
        speakText(botResponse.text);
      }
    }, 1500);
  };

  // Handle Suggestion Click
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Handle Action
  const handleAction = (action: Message['action']) => {
    if (action?.type === 'navigate') {
      navigate(action.target);
      setIsOpen(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `📎 Uploaded: ${file.name}`,
        isBot: false,
        timestamp: new Date()
      };

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'en'
          ? `I've received your document "${file.name}". I can help you use this document for form filling or application processes. What would you like to do with this document?`
          : `ನಾನು ನಿಮ್ಮ ದಾಖಲೆ "${file.name}" ಅನ್ನು ಸ್ವೀಕರಿಸಿದ್ದೇನೆ. ಫಾರ್ಮ್ ಭರ್ತಿ ಅಥವಾ ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಗಳಿಗೆ ಈ ದಾಖಲೆಯನ್ನು ಬಳಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಈ ದಾಖಲೆಯೊಂದಿಗೆ ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?`,
        isBot: true,
        timestamp: new Date(),
        suggestions: language === 'en'
          ? ["Use for Application", "Extract Information", "Verify Document"]
          : ["ಅರ್ಜಿಗಾಗಿ ಬಳಸಿ", "ಮಾಹಿತಿ ಹೊರತೆಗೆಯಿರಿ", "ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ"]
      };

      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage, botResponse]
      }));
    }
  };

  // Initialize with welcome message
  useEffect(() => {
    if (conversation.messages.length === 0 && isOpen) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: language === 'en'
          ? "👋 Hello! I'm AI Sahayak, your government services assistant. I can help you apply for services, fill forms automatically, and guide you through the process. How can I assist you today?"
          : "👋 ನಮಸ್ಕಾರ! ನಾನು AI ಸಹಾಯಕ, ನಿಮ್ಮ ಸರ್ಕಾರಿ ಸೇವೆಗಳ ಸಹಾಯಕ. ಸೇವೆಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು, ಫಾರ್ಮ್‌ಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿ ಮಾಡಲು ಮತ್ತು ಪ್ರಕ್ರಿಯೆಯ ಮೂಲಕ ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ?",
        isBot: true,
        timestamp: new Date(),
        suggestions: language === 'en'
          ? ["Apply for Driving License", "Browse Services", "Upload Documents", "Get Help"]
          : ["ಚಾಲನಾ ಪರವಾನಗಿಗೆ ಅರ್ಜಿ", "ಸೇವೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ", "ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", "ಸಹಾಯ ಪಡೆಯಿರಿ"]
      };
      setConversation(prev => ({
        ...prev,
        messages: [welcomeMessage]
      }));
    }
  }, [isOpen, language]);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl border-0 z-50 animate-pulse"
        >
          <MessageCircle size={24} className="text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'} transition-all duration-300`}>
          <Card className="w-full h-full shadow-2xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm">
            {/* Header */}
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot size={24} />
                  <CardTitle className="text-lg">
                    AI Sahayak
                  </CardTitle>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {language === 'en' ? 'Online' : 'ಆನ್‌ಲೈನ್'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-white/20 p-1"
                  >
                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 p-1"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                  {conversation.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isBot 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.isBot && <Bot size={16} className="mt-1 flex-shrink-0" />}
                          {!message.isBot && <User size={16} className="mt-1 flex-shrink-0" />}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {message.isBot && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakText(message.text)}
                              className="p-1 h-auto"
                            >
                              <Volume2 size={12} />
                            </Button>
                          )}
                        </div>
                        
                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {message.suggestions.map((suggestion, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-xs h-auto py-1 px-2"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        {message.action && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              onClick={() => handleAction(message.action)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {message.action.type === 'navigate' ? (
                                language === 'en' ? 'Go to Service' : 'ಸೇವೆಗೆ ಹೋಗಿ'
                              ) : (
                                language === 'en' ? 'Fill Form' : 'ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಿ'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <Bot size={16} />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t p-4 space-y-3">
                  {/* Voice & Speech Controls */}
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isListening ? stopListening : startListening}
                      className={isListening ? 'bg-red-100 border-red-300' : ''}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      <span className="ml-1 text-xs">
                        {isListening ? (language === 'en' ? 'Stop' : 'ನಿಲ್ಲಿಸಿ') : (language === 'en' ? 'Voice' : 'ಧ್ವನಿ')}
                      </span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isSpeaking ? stopSpeaking : () => {}}
                      disabled={!isSpeaking}
                      className={isSpeaking ? 'bg-blue-100 border-blue-300' : ''}
                    >
                      {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      <span className="ml-1 text-xs">
                        {isSpeaking ? (language === 'en' ? 'Stop' : 'ನಿಲ್ಲಿಸಿ') : (language === 'en' ? 'Speak' : 'ಮಾತನಾಡಿ')}
                      </span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                      <span className="ml-1 text-xs">
                        {language === 'en' ? 'Upload' : 'ಅಪ್‌ಲೋಡ್'}
                      </span>
                    </Button>
                  </div>

                  {/* Text Input */}
                  <div className="flex space-x-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={language === 'en' ? 'Type your message...' : 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...'}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default AISahayak;