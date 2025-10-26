import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCircle, XCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";

const NotificationSettings: React.FC = () => {
  const { permission, isSupported, requestPermission, isSubscribed, subscribe, unsubscribe, sendNotification } = useNotifications();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleToggleNotifications = async () => {
    setLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        if (permission === 'default') {
          await requestPermission();
        }
        if (permission === 'granted' || Notification.permission === 'granted') {
          await subscribe();
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = () => {
    sendNotification(
      language === 'en' ? 'Test Notification 📬' : 'ಪರೀಕ್ಷಾ ಅಧಿಸೂಚನೆ 📬',
      {
        body: language === 'en' 
          ? 'This is how you will receive updates about your applications!'
          : 'ನಿಮ್ಮ ಅರ್ಜಿಗಳ ಬಗ್ಗೆ ನೀವು ನವೀಕರಣಗಳನ್ನು ಹೀಗೆ ಸ್ವೀಕರಿಸುತ್ತೀರಿ!'
      }
    );
  };

  if (!isSupported) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {language === 'en' ? 'Notifications Not Supported' : 'ಅಧಿಸೂಚನೆಗಳು ಬೆಂಬಲಿತವಾಗಿಲ್ಲ'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Your browser does not support push notifications'
              : 'ನಿಮ್ಮ ಬ್ರೌಸರ್ ಪುಶ್ ಅಧಿಸೂಚನೆಗಳನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ'
            }
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {language === 'en' ? 'Push Notifications' : 'ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು'}
          </div>
          <Badge variant={isSubscribed ? 'default' : 'secondary'}>
            {isSubscribed 
              ? (language === 'en' ? 'Active' : 'ಸಕ್ರಿಯ') 
              : (language === 'en' ? 'Inactive' : 'ನಿಷ್ಕ್ರಿಯ')
            }
          </Badge>
        </CardTitle>
        <CardDescription>
          {language === 'en' 
            ? 'Get real-time updates about your applications'
            : 'ನಿಮ್ಮ ಅರ್ಜಿಗಳ ಬಗ್ಗೆ ನೈಜ-ಸಮಯದ ನವೀಕರಣಗಳನ್ನು ಪಡೆಯಿರಿ'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : permission === 'denied' ? (
              <XCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Bell className="h-5 w-5 text-gray-400" />
            )}
            <span className="font-medium">
              {language === 'en' ? 'Permission Status' : 'ಅನುಮತಿ ಸ್ಥಿತಿ'}
            </span>
          </div>
          <Badge variant={permission === 'granted' ? 'default' : permission === 'denied' ? 'destructive' : 'secondary'}>
            {permission === 'granted' ? (language === 'en' ? 'Granted' : 'ಅನುಮತಿಸಲಾಗಿದೆ') :
             permission === 'denied' ? (language === 'en' ? 'Denied' : 'ನಿರಾಕರಿಸಲಾಗಿದೆ') :
             (language === 'en' ? 'Not Asked' : 'ಕೇಳಲಾಗಿಲ್ಲ')}
          </Badge>
        </div>

        {/* Notification Types */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">
            {language === 'en' ? 'You will receive notifications for:' : 'ನೀವು ಅಧಿಸೂಚನೆಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತೀರಿ:'}
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {language === 'en' ? 'Application status updates' : 'ಅರ್ಜಿ ಸ್ಥಿತಿ ನವೀಕರಣಗಳು'}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {language === 'en' ? 'Document verification alerts' : 'ದಾಖಲೆ ಪರಿಶೀಲನೆ ಎಚ್ಚರಿಕೆಗಳು'}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {language === 'en' ? 'Payment confirmations' : 'ಪಾವತಿ ದೃಢೀಕರಣಗಳು'}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {language === 'en' ? 'Appointment reminders' : 'ನೇಮಕಾತಿ ಜ್ಞಾಪನೆಗಳು'}
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleToggleNotifications}
            disabled={loading || permission === 'denied'}
            className="flex-1"
            variant={isSubscribed ? 'destructive' : 'default'}
          >
            {isSubscribed ? (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Disable' : 'ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ'}
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Enable' : 'ಸಕ್ರಿಯಗೊಳಿಸಿ'}
              </>
            )}
          </Button>
          
          {isSubscribed && (
            <Button
              onClick={handleTestNotification}
              variant="outline"
            >
              {language === 'en' ? 'Test' : 'ಪರೀಕ್ಷೆ'}
            </Button>
          )}
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {language === 'en' 
              ? 'Notifications are blocked. Please enable them in your browser settings.'
              : 'ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅವುಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.'
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
