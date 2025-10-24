import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, User, Bot, Camera, CheckCircle, Download, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface FormData {
  name: string;
  aadhaar: string;
  address: string;
  phone: string;
  scheme: string;
}

const Demo = () => {
  const [step, setStep] = useState(1); // 1: Chat, 2: Scan, 3: Review, 4: Download
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Hello! I'm Karnataka Mitra, your government forms assistant. I'm here to help you apply for government schemes easily. What would you like to apply for today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    aadhaar: "",
    address: "",
    phone: "",
    scheme: ""
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = [
    "What would you like to apply for today?",
    "Great! I'll help you with that. Can you please tell me your full name?",
    "What's your phone number?",
    "Perfect! Now I'll need to scan your Aadhaar card to get your address and Aadhaar number. Please show your Aadhaar card to the camera."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: "user" | "bot") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let botResponse = "";
      
      if (currentQuestion === 0) {
        setFormData(prev => ({ ...prev, scheme: userMessage }));
        botResponse = "Great! I'll help you with that. Can you please tell me your full name?";
        setCurrentQuestion(1);
      } else if (currentQuestion === 1) {
        setFormData(prev => ({ ...prev, name: userMessage }));
        botResponse = "Thank you! What's your phone number?";
        setCurrentQuestion(2);
      } else if (currentQuestion === 2) {
        setFormData(prev => ({ ...prev, phone: userMessage }));
        botResponse = "Perfect! Now I'll need to scan your Aadhaar card to get your address and Aadhaar number. Please show your Aadhaar card to the camera.";
        setCurrentQuestion(3);
      }
      
      addMessage(botResponse, "bot");
      setIsTyping(false);
      
      if (currentQuestion === 2) {
        setTimeout(() => {
          setStep(2);
        }, 2000);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage(inputMessage, "user");
    simulateBotResponse(inputMessage);
    setInputMessage("");
  };

  const handleScanComplete = () => {
    setFormData(prev => ({
      ...prev,
      aadhaar: "XXXX XXXX 1234",
      address: "123 Demo Street, Demo City, Demo State - 123456"
    }));
    
    setTimeout(() => {
      setStep(3);
    }, 2000);
  };

  const handleFormSubmit = () => {
    setStep(4);
  };

  const renderChatStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-elegant overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Karnataka Mitra Assistant</h2>
              <p className="text-white/90">Step 1: Tell us what you need</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                {message.type === "bot" && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl ${
                    message.type === "user"
                      ? "bg-primary text-white"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === "user" ? "text-white/70" : "text-muted-foreground"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {message.type === "user" && (
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-muted p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t">
          <div className="flex space-x-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} variant="hero">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScanStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <Card className="p-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Scanning Aadhaar Card</h2>
          <p className="text-muted-foreground">Please hold your Aadhaar card steady in front of the camera</p>
        </div>

        {/* Mock Camera View */}
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse"></div>
          <div className="text-center z-10">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Processing document...</p>
          </div>
        </div>

        <Button onClick={handleScanComplete} variant="hero" size="lg" className="w-full">
          Complete Scan
        </Button>
      </Card>
    </div>
  );

  const renderReviewStep = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="mb-6 text-center">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Review Your Information</h2>
          <p className="text-muted-foreground">Please verify all details before submitting</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input value={formData.name} readOnly className="bg-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <Input value={formData.phone} readOnly className="bg-muted" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Aadhaar Number</label>
            <Input value={formData.aadhaar} readOnly className="bg-muted" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input value={formData.address} readOnly className="bg-muted" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Applying For</label>
            <Input value={formData.scheme} readOnly className="bg-muted" />
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Back to Edit
          </Button>
          <Button onClick={handleFormSubmit} variant="hero" className="flex-1">
            Confirm & Generate Form
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderDownloadStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <Card className="p-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Form Generated Successfully!</h2>
          <p className="text-muted-foreground">Your government form has been filled and is ready for download</p>
        </div>

        <div className="bg-gradient-subtle p-6 rounded-xl mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-16 bg-white border-2 border-border rounded shadow-sm flex items-center justify-center">
              <div className="text-xs text-muted-foreground">PDF</div>
            </div>
            <div>
              <h3 className="font-semibold">{formData.scheme} Application Form</h3>
              <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <Button variant="hero" size="lg" className="w-full mb-4">
            <Download className="mr-2" size={16} />
            Download Completed Form
          </Button>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            🎉 Congratulations! You've successfully used Karnataka Mitra to fill your government form.
          </p>
          <Link to="/">
            <Button variant="outline">
              <Home className="mr-2" size={16} />
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );

  const stepTitles = [
    "Conversation",
    "Scan & Draft", 
    "Review & Confirm",
    "Download Form"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container-width section-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold gradient-text">Karnataka Mitra Demo</h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {stepTitles.map((title, index) => (
              <div key={title} className={`flex items-center ${index < stepTitles.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > index + 1 ? 'bg-secondary text-white' : 
                  step === index + 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > index + 1 ? <CheckCircle size={16} /> : index + 1}
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step > index + 1 ? 'bg-secondary' : 'bg-muted'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            {stepTitles.map((title, index) => (
              <span key={title} className={`${
                step === index + 1 ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {step === 1 && renderChatStep()}
          {step === 2 && renderScanStep()}
          {step === 3 && renderReviewStep()}
          {step === 4 && renderDownloadStep()}
        </div>
      </div>
    </div>
  );
};

export default Demo;