import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Mail, 
  MessageSquare,
  Megaphone,
  X,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'application' | 'payment' | 'system' | 'announcement';
  actionRequired?: boolean;
}

const NotificationSystem: React.FC = () => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: language === 'en' ? 'Application Approved!' : 'ಅರ್ಜಿ ಅನುಮೋದಿಸಲಾಗಿದೆ!',
      message: language === 'en' 
        ? 'Your driving license application #DL2024001 has been approved. You can collect your license from RTO office.'
        : 'ನಿಮ್ಮ ಚಾಲನಾ ಪರವಾನಗಿ ಅರ್ಜಿ #DL2024001 ಅನ್ನು ಅನುಮೋದಿಸಲಾಗಿದೆ. ನೀವು RTO ಕಛೇರಿಯಿಂದ ನಿಮ್ಮ ಪರವಾನಗಿಯನ್ನು ಸಂಗ್ರಹಿಸಬಹುದು.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      category: 'application',
      actionRequired: true
    },
    {
      id: '2',
      type: 'info',
      title: language === 'en' ? 'Payment Received' : 'ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
      message: language === 'en' 
        ? 'Payment of ₹1,680 received for driving license application. Receipt: RCP20241008001'
        : 'ಚಾಲನಾ ಪರವಾನಗಿ ಅರ್ಜಿಗಾಗಿ ₹1,680 ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ರಸೀದಿ: RCP20241008001',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      category: 'payment'
    },
    {
      id: '3',
      type: 'warning',
      title: language === 'en' ? 'Document Verification Pending' : 'ದಾಖಲೆ ಪರಿಶೀಲನೆ ಬಾಕಿ',
      message: language === 'en' 
        ? 'Your address proof document needs verification. Please visit RTO office within 7 days.'
        : 'ನಿಮ್ಮ ವಿಳಾಸ ಪುರಾವೆ ದಾಖಲೆಗೆ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು 7 ದಿನಗಳೊಳಗೆ RTO ಕಛೇರಿಗೆ ಭೇಟಿ ನೀಡಿ.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: false,
      category: 'application',
      actionRequired: true
    },
    {
      id: '4',
      type: 'info',
      title: language === 'en' ? '🎉 System Announcement' : '🎉 ಸಿಸ್ಟಮ್ ಪ್ರಕಟಣೆ',
      message: language === 'en' 
        ? 'New feature: Voice-to-text input is now available for all government forms! Try it today.'
        : 'ಹೊಸ ವೈಶಿಷ್ಟ್ಯ: ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಫಾರ್ಮ್‌ಗಳಿಗೆ ಧ್ವನಿ-ಟು-ಟೆಕ್ಸ್ಟ್ ಇನ್‌ಪುಟ್ ಈಗ ಲಭ್ಯವಿದೆ! ಇಂದು ಪ್ರಯತ್ನಿಸಿ.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      category: 'announcement'
    }
  ];

  // Initialize notifications on component mount
  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [language]);

  // Mock real-time notification simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving a new notification every 2 minutes
      if (Math.random() > 0.7) { // 30% chance every 2 minutes
        addNewNotification();
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [language]);

  const addNewNotification = () => {
    const newNotificationTemplates = [
      {
        type: 'success' as const,
        title: language === 'en' ? 'Test Scheduled!' : 'ಪರೀಕ್ಷೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ!',
        message: language === 'en' 
          ? 'Your driving test is scheduled for tomorrow at 10:00 AM. Please bring required documents.'
          : 'ನಿಮ್ಮ ಚಾಲನಾ ಪರೀಕ್ಷೆಯನ್ನು ನಾಳೆ ಬೆಳಿಗ್ಗೆ 10:00 ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ತನ್ನಿ.',
        category: 'application' as const
      },
      {
        type: 'info' as const,
        title: language === 'en' ? 'New Update Available' : 'ಹೊಸ ಅಪ್‌ಡೇಟ್ ಲಭ್ಯವಿದೆ',
        message: language === 'en' 
          ? 'e-Nagarika app has been updated with new features and bug fixes.'
          : 'e-Nagarika ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ಹೊಸ ವೈಶಿಷ್ಟ್ಯಗಳು ಮತ್ತು ಬಗ್ ಫಿಕ್ಸ್‌ಗಳೊಂದಿಗೆ ಅಪ್‌ಡೇಟ್ ಮಾಡಲಾಗಿದೆ.',
        category: 'system' as const
      }
    ];

    const template = newNotificationTemplates[Math.floor(Math.random() * newNotificationTemplates.length)];
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...template,
      timestamp: new Date(),
      read: false,
      actionRequired: template.type === 'success'
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Play notification sound if enabled
    if (soundEnabled) {
      playNotificationSound();
    }

    // Show browser notification
    showBrowserNotification(newNotification);
  };

  const playNotificationSound = () => {
    // Mock notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBTyN2+6/diMFl');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if audio playback fails
    } catch (error) {
      // Silently handle audio errors
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error': return <X className="text-red-500" size={20} />;
      default: return <Bell className="text-blue-500" size={20} />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return language === 'en' ? 'Just now' : 'ಈಗಷ್ಟೇ';
    if (minutes < 60) return language === 'en' ? `${minutes}m ago` : `${minutes} ನಿಮಿಷ ಹಿಂದೆ`;
    if (hours < 24) return language === 'en' ? `${hours}h ago` : `${hours} ಗಂಟೆ ಹಿಂದೆ`;
    if (days < 7) return language === 'en' ? `${days}d ago` : `${days} ದಿನ ಹಿಂದೆ`;
    return timestamp.toLocaleDateString(language === 'en' ? 'en-IN' : 'kn-IN');
  };

  // Mock email notification
  const sendTestEmail = async () => {
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(language === 'en' 
      ? '📧 Test email notification sent to your registered email!'
      : '📧 ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್‌ಗೆ ಪರೀಕ್ಷಾ ಇಮೇಲ್ ಅಧಿಸೂಚನೆ ಕಳುಹಿಸಲಾಗಿದೆ!'
    );
  };

  // Mock SMS notification
  const sendTestSMS = async () => {
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(language === 'en' 
      ? '📱 Test SMS notification sent to your registered mobile number!'
      : '📱 ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಪರೀಕ್ಷಾ SMS ಅಧಿಸೂಚನೆ ಕಳುಹಿಸಲಾಗಿದೆ!'
    );
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        alert(language === 'en' 
          ? '✅ Browser notifications enabled!'
          : '✅ ಬ್ರೌಸರ್ ಅಧಿಸೂಚನೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ!'
        );
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Notification Bell & Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="text-blue-600" size={24} />
                <span>{language === 'en' ? 'Notification Center' : 'ಅಧಿಸೂಚನಾ ಕೇಂದ್ರ'}</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Manage your notifications and stay updated with real-time alerts'
                  : 'ನಿಮ್ಮ ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ನೈಜ-ಸಮಯದ ಎಚ್ಚರಿಕೆಗಳೊಂದಿಗೆ ನವೀಕೃತವಾಗಿರಿ'
                }
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {showNotifications 
                  ? (language === 'en' ? 'Hide' : 'ಮರೆಮಾಡಿ')
                  : (language === 'en' ? 'Show All' : 'ಎಲ್ಲವನ್ನೂ ತೋರಿಸಿ')
                }
              </Button>
              {unreadCount > 0 && (
                <Button size="sm" onClick={markAllAsRead}>
                  {language === 'en' ? 'Mark All Read' : 'ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Notification Settings */}
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* Sound Settings */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="text-sm">{language === 'en' ? 'Sound' : 'ಧ್ವನಿ'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? 'text-green-600' : 'text-gray-400'}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>

            {/* Email Settings */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span className="text-sm">{language === 'en' ? 'Email' : 'ಇಮೇಲ್'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={emailEnabled ? 'text-green-600' : 'text-gray-400'}
              >
                {emailEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>

            {/* SMS Settings */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare size={16} />
                <span className="text-sm">{language === 'en' ? 'SMS' : 'SMS'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={smsEnabled ? 'text-green-600' : 'text-gray-400'}
              >
                {smsEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>

          {/* Test Notifications */}
          <div className="grid md:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
              {language === 'en' ? 'Enable Browser' : 'ಬ್ರೌಸರ್ ಸಕ್ರಿಯಗೊಳಿಸಿ'}
            </Button>
            <Button variant="outline" size="sm" onClick={sendTestEmail}>
              {language === 'en' ? 'Test Email' : 'ಇಮೇಲ್ ಪರೀಕ್ಷಿಸಿ'}
            </Button>
            <Button variant="outline" size="sm" onClick={sendTestSMS}>
              {language === 'en' ? 'Test SMS' : 'SMS ಪರೀಕ್ಷಿಸಿ'}
            </Button>
            <Button variant="outline" size="sm" onClick={addNewNotification}>
              {language === 'en' ? 'Add Test Alert' : 'ಪರೀಕ್ಷಾ ಎಚ್ಚರಿಕೆ ಸೇರಿಸಿ'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      {showNotifications && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock size={20} />
              <span>{language === 'en' ? 'Recent Notifications' : 'ಇತ್ತೀಚಿನ ಅಧಿಸೂಚನೆಗಳು'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>{language === 'en' ? 'No notifications yet' : 'ಇನ್ನೂ ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ'}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-all ${
                      notification.read 
                        ? 'bg-white border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            {notification.actionRequired && (
                              <Badge variant="destructive" className="text-xs">
                                {language === 'en' ? 'Action Required' : 'ಕ್ರಮ ಅಗತ್ಯ'}
                              </Badge>
                            )}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs"
                          >
                            {language === 'en' ? 'Mark Read' : 'ಓದಲಾಗಿದೆ'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Broadcast (Mock) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="text-orange-600" size={24} />
            <span>{language === 'en' ? 'Admin Announcements' : 'ನಿರ್ವಾಹಕ ಪ್ರಕಟಣೆಗಳು'}</span>
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Important updates and announcements from government officials'
              : 'ಸರ್ಕಾರಿ ಅಧಿಕಾರಿಗಳಿಂದ ಪ್ರಮುಖ ನವೀಕರಣಗಳು ಮತ್ತು ಪ್ರಕಟಣೆಗಳು'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Megaphone className="text-yellow-600" size={16} />
                <span className="font-semibold text-yellow-700">
                  {language === 'en' ? 'System Maintenance Notice' : 'ಸಿಸ್ಟಮ್ ನಿರ್ವಹಣಾ ಸೂಚನೆ'}
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                {language === 'en' 
                  ? 'Scheduled maintenance on Oct 15, 2024 from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.'
                  : '15 ಅಕ್ಟೋಬರ್ 2024 ರಂದು ಬೆಳಿಗ್ಗೆ 2:00 ರಿಂದ 4:00 ವರೆಗೆ ನಿಗದಿತ ನಿರ್ವಹಣೆ. ಸೇವೆಗಳು ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲದಿರಬಹುದು.'
                }
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="text-green-600" size={16} />
                <span className="font-semibold text-green-700">
                  {language === 'en' ? 'New Feature Launch' : 'ಹೊಸ ವೈಶಿಷ್ಟ್ಯ ಪ್ರಾರಂಭ'}
                </span>
              </div>
              <p className="text-sm text-green-700">
                {language === 'en' 
                  ? '🎉 Voice-to-text feature is now live! Apply for government services using your voice in English and Kannada.'
                  : '🎉 ಧ್ವನಿ-ಟು-ಟೆಕ್ಸ್ಟ್ ವೈಶಿಷ್ಟ್ಯ ಈಗ ಲೈವ್! ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಬಳಸಿಕೊಂಡು ಸರ್ಕಾರಿ ಸೇವೆಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSystem;