import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Settings, CheckCircle, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUserTracking } from '@/lib/user-tracking';

interface ConsentPreferences {
  allowTracking: boolean;
  allowPersonalization: boolean;
  allowMarketing: boolean;
  allowAnalytics: boolean;
}

export function GDPRConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    allowTracking: false,
    allowPersonalization: false,
    allowMarketing: false,
    allowAnalytics: false
  });

  const { setConsent, getConsentStatus } = useUserTracking();

  useEffect(() => {
    // Check if consent has already been given
    const consentStatus = getConsentStatus();
    if (!consentStatus.given) {
      // Delay showing the banner to avoid being intrusive
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [getConsentStatus]);

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      allowTracking: true,
      allowPersonalization: true,
      allowMarketing: true,
      allowAnalytics: true
    };
    setConsent(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const allRejected: ConsentPreferences = {
      allowTracking: false,
      allowPersonalization: false,
      allowMarketing: false,
      allowAnalytics: false
    };
    setConsent(allRejected);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    setConsent(preferences);
    setIsVisible(false);
  };

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-[200] p-4"
        >
          <div className="max-w-6xl mx-auto">
            <Card className="bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl">
              <CardContent className="p-0">
                {!showDetails ? (
                  // Simple consent banner
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                          Your Privacy Matters
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                          We use cookies and similar technologies to enhance your experience, 
                          personalize content, and analyze our traffic. We respect your privacy 
                          and give you control over your data.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button 
                            onClick={handleAcceptAll}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                          >
                            Accept All
                          </Button>
                          <Button 
                            onClick={handleRejectAll}
                            variant="outline"
                            className="border-border hover:bg-muted"
                          >
                            Reject All
                          </Button>
                          <Button 
                            onClick={() => setShowDetails(true)}
                            variant="ghost"
                            className="text-primary hover:bg-primary/10 flex items-center gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            Customize
                          </Button>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsVisible(false)}
                        className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Detailed consent preferences
                  <div>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Privacy Settings
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        Choose which types of cookies and tracking you're comfortable with. 
                        You can change these settings anytime.
                      </p>
                    </CardHeader>
                    
                    <div className="px-6 space-y-6">
                      {/* Essential cookies - always on */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-semibold flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Essential Cookies
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Required for the website to function properly. These cannot be disabled.
                            </p>
                          </div>
                          <Switch checked={true} disabled />
                        </div>
                        <Separator />
                      </div>

                      {/* Analytics cookies */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-semibold">Analytics Cookies</Label>
                            <p className="text-sm text-muted-foreground">
                              Help us understand how visitors interact with our website by collecting 
                              anonymous information about usage patterns.
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.allowAnalytics}
                            onCheckedChange={(checked) => updatePreference('allowAnalytics', checked)}
                          />
                        </div>
                        <Separator />
                      </div>

                      {/* Personalization cookies */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-semibold">Personalization Cookies</Label>
                            <p className="text-sm text-muted-foreground">
                              Remember your preferences and customize content based on your interests 
                              to enhance your experience.
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.allowPersonalization}
                            onCheckedChange={(checked) => updatePreference('allowPersonalization', checked)}
                          />
                        </div>
                        <Separator />
                      </div>

                      {/* Marketing cookies */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-semibold">Marketing Cookies</Label>
                            <p className="text-sm text-muted-foreground">
                              Track your activity to deliver relevant advertisements and measure 
                              the effectiveness of our marketing campaigns.
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.allowMarketing}
                            onCheckedChange={(checked) => updatePreference('allowMarketing', checked)}
                          />
                        </div>
                        <Separator />
                      </div>

                      {/* Tracking cookies */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-semibold">User Behavior Tracking</Label>
                            <p className="text-sm text-muted-foreground">
                              Track your interactions to improve user experience and provide 
                              personalized recommendations.
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.allowTracking}
                            onCheckedChange={(checked) => updatePreference('allowTracking', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Privacy notice */}
                    <div className="px-6 py-4 bg-muted/30 mt-6">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p className="mb-2">
                            <strong>Your Rights:</strong> You can access, update, or delete your personal data at any time. 
                            You also have the right to data portability and to lodge complaints with data protection authorities.
                          </p>
                          <p>
                            Read our full{' '}
                            <a href="/privacy-policy" className="text-primary hover:underline">
                              Privacy Policy
                            </a>{' '}
                            for more details about how we handle your data.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-6 pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Button 
                            onClick={() => setShowDetails(false)}
                            variant="ghost"
                            className="text-muted-foreground"
                          >
                            Back
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            onClick={handleRejectAll}
                            variant="outline"
                          >
                            Reject All
                          </Button>
                          <Button 
                            onClick={handleSavePreferences}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                          >
                            Save Preferences
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Privacy settings modal for users to change preferences later
export function PrivacySettingsModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    allowTracking: false,
    allowPersonalization: false,
    allowMarketing: false,
    allowAnalytics: false
  });

  const { setConsent, getConsentStatus, exportData, deleteData } = useUserTracking();

  useEffect(() => {
    if (isOpen) {
      const status = getConsentStatus();
      if (status.preferences) {
        const convertedPreferences: ConsentPreferences = {
          allowTracking: status.preferences.allowTracking ?? false,
          allowPersonalization: status.preferences.allowPersonalization ?? false,
          allowMarketing: status.preferences.allowMarketing ?? false,
          allowAnalytics: status.preferences.allowAnalytics ?? false,
        };
        setPreferences(convertedPreferences);
      }
    }
  }, [isOpen, getConsentStatus]);

  const handleSave = () => {
    setConsent(preferences);
    onClose();
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panickin-skywalker-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = () => {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      deleteData();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Settings
                  </CardTitle>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Current consent status */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Current Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${preferences.allowAnalytics ? 'bg-green-500' : 'bg-red-500'}`} />
                      Analytics: {preferences.allowAnalytics ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${preferences.allowPersonalization ? 'bg-green-500' : 'bg-red-500'}`} />
                      Personalization: {preferences.allowPersonalization ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${preferences.allowMarketing ? 'bg-green-500' : 'bg-red-500'}`} />
                      Marketing: {preferences.allowMarketing ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${preferences.allowTracking ? 'bg-green-500' : 'bg-red-500'}`} />
                      Tracking: {preferences.allowTracking ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>

                {/* Settings toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="font-medium">Analytics</Label>
                      <p className="text-sm text-muted-foreground">Website usage analytics</p>
                    </div>
                    <Switch 
                      checked={preferences.allowAnalytics}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, allowAnalytics: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="font-medium">Personalization</Label>
                      <p className="text-sm text-muted-foreground">Customized content and recommendations</p>
                    </div>
                    <Switch 
                      checked={preferences.allowPersonalization}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, allowPersonalization: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="font-medium">Marketing</Label>
                      <p className="text-sm text-muted-foreground">Targeted advertisements and campaigns</p>
                    </div>
                    <Switch 
                      checked={preferences.allowMarketing}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, allowMarketing: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="font-medium">User Behavior Tracking</Label>
                      <p className="text-sm text-muted-foreground">Track interactions for better experience</p>
                    </div>
                    <Switch 
                      checked={preferences.allowTracking}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, allowTracking: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Data management */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Data Management</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleExportData}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Info className="h-4 w-4" />
                      Export My Data
                    </Button>
                    <Button 
                      onClick={handleDeleteData}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Delete All Data
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You have the right to access, correct, or delete your personal data at any time.
                  </p>
                </div>

                <Separator />

                {/* Action buttons */}
                <div className="flex justify-end gap-3">
                  <Button onClick={onClose} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}