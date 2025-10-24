import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  onend: () => void;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscript, 
  placeholder = "Click to speak...", 
  disabled = false,
  className = ""
}) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        
        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
          setTranscript('');
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('');
        
        // Show user-friendly error message
        if (event.error === 'not-allowed') {
          alert(language === 'en' 
            ? 'Microphone permission denied. Please allow microphone access to use voice input.'
            : 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬಳಸಲು ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ.'
          );
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
      setIsSupported(false);
    }
  }, [language, onTranscript]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
    }
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current && !disabled) {
      setTranscript('');
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

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        {language === 'en' ? 'Voice input not supported in this browser' : 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ'}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={disabled}
        className={`transition-all duration-200 ${
          isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'hover:bg-blue-50'
        }`}
      >
        {isListening ? (
          <>
            <MicOff size={16} className="mr-1" />
            {language === 'en' ? 'Stop' : 'ನಿಲ್ಲಿಸಿ'}
          </>
        ) : (
          <>
            <Mic size={16} className="mr-1" />
            {language === 'en' ? 'Speak' : 'ಮಾತನಾಡಿ'}
          </>
        )}
      </Button>
      
      {transcript && (
        <div className="flex-1 text-sm text-gray-600 italic">
          "{transcript}"
        </div>
      )}
      
      {isListening && (
        <div className="text-xs text-blue-600 flex items-center">
          <Volume2 size={12} className="mr-1 animate-pulse" />
          {language === 'en' ? 'Listening...' : 'ಕೇಳುತ್ತಿದೆ...'}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;