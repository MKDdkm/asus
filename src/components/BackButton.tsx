import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface BackButtonProps {
  to?: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label, 
  variant = "ghost",
  className = ""
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const defaultLabel = language === 'en' ? 'Go Back' : 'ಹಿಂದೆ ಹೋಗಿ';

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back one page in history
    }
  };

  return (
    <Button 
      onClick={handleClick}
      variant={variant}
      className={className}
    >
      <ArrowLeft className="mr-2" size={20} />
      {label || defaultLabel}
    </Button>
  );
};

export default BackButton;
