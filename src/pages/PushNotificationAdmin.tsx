import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Send, Users, TestTube } from "lucide-react";
import Header from "@/components/Header";

const PushNotificationAdmin: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [subscribersCount, setSubscribersCount] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'https://asus-2.onrender.com/api';

  const fetchSubscribersCount = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/push/subscribers/count`);
      const data = await response.json();
      if (data.success) {
        setSubscribersCount(data.subscribersCount);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  React.useEffect(() => {
    fetchSubscribersCount();
    const interval = setInterval(fetchSubscribersCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendNotification = async () => {
    if (!title || !body) {
      alert('Please enter both title and body');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/notifications/push/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          icon: '/logo.png',
          badge: '/badge.png',
        }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setTitle('');
        setBody('');
        await fetchSubscribersCount();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setResult({ success: false, message: 'Failed to send notification' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/notifications/push/test`, {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
      await fetchSubscribersCount();
    } catch (error) {
      console.error('Error sending test notification:', error);
      setResult({ success: false, message: 'Failed to send test notification' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Bell className="h-8 w-8 text-orange-600" />
                  Push Notification Admin
                </h1>
                <p className="text-gray-600 mt-2">
                  Send push notifications to all subscribed users
                </p>
              </div>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-3xl font-bold text-blue-900">{subscribersCount}</div>
                      <div className="text-sm text-blue-700">Active Subscribers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Send Notification Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send Push Notification</CardTitle>
                <CardDescription>
                  Compose and send a push notification to all subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter notification title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500">{title.length}/50 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Body *</Label>
                  <Textarea
                    id="body"
                    placeholder="Enter notification message"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500">{body.length}/200 characters</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSendNotification}
                    disabled={loading || !title || !body || subscribersCount === 0}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Sending...' : 'Send to All Subscribers'}
                  </Button>
                  
                  <Button
                    onClick={handleTestNotification}
                    disabled={loading || subscribersCount === 0}
                    variant="outline"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                </div>

                {subscribersCount === 0 && (
                  <Alert className="border-yellow-300 bg-yellow-50">
                    <AlertDescription className="text-yellow-800">
                      No active subscribers. Visit the <a href="/notifications" className="underline font-semibold">Notifications page</a> and enable push notifications first.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Result */}
            {result && (
              <Alert className={result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  <div className="font-semibold">{result.message}</div>
                  {result.stats && (
                    <div className="mt-2 text-sm space-y-1">
                      <div>✅ Successful: {result.stats.successful}</div>
                      <div>❌ Failed: {result.stats.failed}</div>
                      <div>📊 Total Attempted: {result.stats.total}</div>
                      <div>👥 Remaining Subscribers: {result.stats.remainingSubscribers}</div>
                    </div>
                  )}
                  {result.sent !== undefined && (
                    <div className="mt-2 text-sm">
                      Sent to {result.sent} out of {result.total} subscribers
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Pre-defined notification templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setTitle('🎉 Service Update');
                    setBody('New services are now available on e-Nagarika portal!');
                  }}
                >
                  Service Update Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setTitle('✅ Application Approved');
                    setBody('Your application has been approved. Download your certificate now!');
                  }}
                >
                  Application Approved Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setTitle('🔔 Reminder');
                    setBody('You have pending applications. Please complete your submission.');
                  }}
                >
                  Reminder Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setTitle('⚠️ System Maintenance');
                    setBody('Scheduled maintenance on Sunday, 2 AM - 4 AM. Services may be unavailable.');
                  }}
                >
                  Maintenance Notice Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PushNotificationAdmin;
