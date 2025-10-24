import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ThumbsUp, Send, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { useParams, useNavigate } from "react-router-dom";

interface FeedbackData {
  rating: number;
  serviceQuality: number;
  processingSpeed: number;
  staffBehavior: number;
  comments: string;
  recommend: boolean;
}

const FeedbackPage = () => {
  const { language, t } = useLanguage();
  const { applicationId } = useParams();
  const navigate = useNavigate();
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    serviceQuality: 0,
    processingSpeed: 0,
    staffBehavior: 0,
    comments: '',
    recommend: false
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://asus-2.onrender.com/api';

  const handleSubmit = async () => {
    try {
      // In production, send to backend
      // await fetch(`${API_BASE_URL}/feedback`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ applicationId, ...feedback })
      // });
      
      console.log('Feedback submitted:', { applicationId, ...feedback });
      setSubmitted(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (rating: number) => void; 
    label: string;
  }) => {
    const [hovered, setHovered] = useState(0);
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">{label}</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`${
                  star <= (hovered || value)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-gray-700">
            {value > 0 ? `${value}/5` : 'Not rated'}
          </span>
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto text-center shadow-2xl">
            <CardContent className="p-12">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'Thank You for Your Feedback!' : 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಧನ್ಯವಾದಗಳು!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'en' 
                  ? 'Your feedback helps us improve our services. Redirecting to dashboard...'
                  : 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ ನಮ್ಮ ಸೇವೆಗಳನ್ನು ಸುಧಾರಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ...'
                }
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton />
          </div>

          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {language === 'en' ? 'Rate Your Experience' : 'ನಿಮ್ಮ ಅನುಭವವನ್ನು ರೇಟ್ ಮಾಡಿ'}
            </h1>
            <p className="text-gray-600">
              {language === 'en' 
                ? 'Your feedback helps us serve you better'
                : 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ ನಿಮಗೆ ಉತ್ತಮವಾಗಿ ಸೇವೆ ಸಲ್ಲಿಸಲು ನಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ'
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Application ID: <strong>{applicationId}</strong>
            </p>
          </div>

          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Star size={28} />
                {language === 'en' ? 'Feedback Form' : 'ಪ್ರತಿಕ್ರಿಯೆ ಫಾರ್ಮ್'}
              </CardTitle>
              <CardDescription className="text-white/90">
                {language === 'en' 
                  ? 'Please rate different aspects of our service'
                  : 'ನಮ್ಮ ಸೇವೆಯ ವಿವಿಧ ಅಂಶಗಳನ್ನು ದಯವಿಟ್ಟು ರೇಟ್ ಮಾಡಿ'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Overall Rating */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
                <StarRating
                  value={feedback.rating}
                  onChange={(rating) => setFeedback({ ...feedback, rating })}
                  label={language === 'en' ? '⭐ Overall Experience' : '⭐ ಒಟ್ಟಾರೆ ಅನುಭವ'}
                />
              </div>

              {/* Service Quality */}
              <StarRating
                value={feedback.serviceQuality}
                onChange={(rating) => setFeedback({ ...feedback, serviceQuality: rating })}
                label={language === 'en' ? '🎯 Service Quality' : '🎯 ಸೇವೆಯ ಗುಣಮಟ್ಟ'}
              />

              {/* Processing Speed */}
              <StarRating
                value={feedback.processingSpeed}
                onChange={(rating) => setFeedback({ ...feedback, processingSpeed: rating })}
                label={language === 'en' ? '⚡ Processing Speed' : '⚡ ಪ್ರಕ್ರಿಯೆಯ ವೇಗ'}
              />

              {/* Staff Behavior */}
              <StarRating
                value={feedback.staffBehavior}
                onChange={(rating) => setFeedback({ ...feedback, staffBehavior: rating })}
                label={language === 'en' ? '👥 Staff Behavior' : '👥 ಸಿಬ್ಬಂದಿ ವರ್ತನೆ'}
              />

              {/* Comments */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  {language === 'en' ? '💬 Additional Comments (Optional)' : '💬 ಹೆಚ್ಚುವರಿ ಕಾಮೆಂಟ್‌ಗಳು (ಐಚ್ಛಿಕ)'}
                </Label>
                <Textarea
                  value={feedback.comments}
                  onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                  placeholder={
                    language === 'en' 
                      ? 'Tell us more about your experience...'
                      : 'ನಿಮ್ಮ ಅನುಭವದ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ಹೇಳಿ...'
                  }
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Recommendation */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-gray-900">
                      {language === 'en' 
                        ? 'Would you recommend our service to others?'
                        : 'ನೀವು ನಮ್ಮ ಸೇವೆಯನ್ನು ಇತರರಿಗೆ ಶಿಫಾರಸು ಮಾಡುತ್ತೀರಾ?'
                      }
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedback({ ...feedback, recommend: !feedback.recommend })}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                      feedback.recommend
                        ? 'bg-green-600 text-white shadow-lg scale-105'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <ThumbsUp size={20} />
                    {feedback.recommend 
                      ? (language === 'en' ? 'Yes, I recommend!' : 'ಹೌದು, ನಾನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ!')
                      : (language === 'en' ? 'Click to recommend' : 'ಶಿಫಾರಸು ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ')
                    }
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={feedback.rating === 0}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-lg py-6"
                >
                  <Send className="mr-2" size={20} />
                  {language === 'en' ? 'Submit Feedback' : 'ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ'}
                </Button>
                {feedback.rating === 0 && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    {language === 'en' 
                      ? 'Please provide an overall rating before submitting'
                      : 'ಸಲ್ಲಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ಒಟ್ಟಾರೆ ರೇಟಿಂಗ್ ನೀಡಿ'
                    }
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
