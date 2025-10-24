import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VoiceInput from "./VoiceInput";

interface VoiceFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  className?: string;
}

const VoiceField: React.FC<VoiceFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  type = "text",
  className = ""
}) => {
  const handleVoiceTranscript = (transcript: string) => {
    onChange(transcript);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="space-y-2">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full"
        />
        
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          disabled={disabled}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default VoiceField;