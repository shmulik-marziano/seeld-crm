import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  User,
  Building2,
  CreditCard,
  Bell,
  FileText,
  Shield,
  Loader2,
  Save,
  Upload,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AgentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  license_number?: string;
  company_name?: string;
  company_id?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  bank_name?: string;
  bank_branch?: string;
  bank_account?: string;
  logo_url?: string;
  signature_url?: string;
}

interface AgentSettingsData {
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  auto_reminders: boolean;
  reminder_days_before: number;
  default_signature_type: string;
  vsign_api_key?: string;
  default_fee_deposit: number;
  default_fee_accumulated: number;
  default_return_rate: number;
}

const AgentSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState<AgentProfile>({
    id: '',
    first_name: '',
    last_name: '',
    email: ''
  });

  const [settings, setSettings] = useState<AgentSettingsData>({
    email_notifications: true,
    sms_notifications: true,
    whatsapp_notifications: false,
    auto_reminders: true,
    reminder_days_before: 7,
    default_signature_type: 'remote',
    default_fee_deposit: 4,
    default_fee_accumulated: 1.05,
    default_return_rate: 4
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/agent/auth');
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile({
          id: user.id,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: user.email || '',
          phone: profileData.phone,
          license_number: profileData.license_number,
          company_name: profileData.company_name,
          company_id: profileData.company_id,
          address: profileData.address,
          city: profileData.city,
          postal_code: profileData.postal_code,
          bank_name: profileData.bank_name,
          bank_branch: profileData.bank_branch,
          bank_account: profileData.bank_account,
          logo_url: profileData.logo_url,
          signature_url: profileData.signature_url
        });
      }

      // Fetch agent settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('agent_settings')
        .select('*')
        .eq('agent_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        // Not found - use defaults
      }

      if (settingsData) {
        setSettings({
          email_notifications: settingsData.email_notifications ?? true,
          sms_notifications: settingsData.sms_notifications ?? true,
          whatsapp_notifications: settingsData.whatsapp_notifications ?? false,
          auto_reminders: settingsData.auto_reminders ?? true,
          reminder_days_before: settingsData.reminder_days_before ?? 7,
          default_signature_type: settingsData.default_signature_type || 'remote',
          vsign_api_key: settingsData.vsign_api_key,
          default_fee_deposit: settingsData.default_fee_deposit ?? 4,
          default_fee_accumulated: settingsData.default_fee_accumulated ?? 1.05,
          default_return_rate: settingsData.default_return_rate ?? 4
        });
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "שגיאה בטעינת הנתונים",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          license_number: profile.license_number,
          company_name: profile.company_name,
          company_id: profile.company_id,
          address: profile.address,
          city: profile.city,
          postal_code: profile.postal_code,
          bank_name: profile.bank_name,
          bank_branch: profile.bank_branch,
          bank_account: profile.bank_account,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "הפרופיל נשמר בהצלחה",
        description: "הפרטים עודכנו במערכת"
      });
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירה",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('agent_settings')
        .upsert({
          agent_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "ההגדרות נשמרו בהצלחה"
      });
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירה",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">הגדרות</h1>
            <p className="text-muted-foreground">נהל את הפרופיל וההגדרות שלך</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              פרופיל
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              עסק
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              התראות
            </TabsTrigger>
            <TabsTrigger value="defaults" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              ברירות מחדל
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>פרטים אישיים</CardTitle>
                <CardDescription>
                  עדכן את הפרטים האישיים שלך
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שם פרטי</Label>
                    <Input
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>שם משפחה</Label>
                    <Input
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>דוא"ל</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>טלפון</Label>
                    <Input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>מספר רישיון</Label>
                    <Input
                      value={profile.license_number || ''}
                      onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <h4 className="font-medium">כתובת</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>רחוב</Label>
                    <Input
                      value={profile.address || ''}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>עיר</Label>
                    <Input
                      value={profile.city || ''}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>מיקוד</Label>
                    <Input
                      value={profile.postal_code || ''}
                      onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 ml-2" />
                    )}
                    שמור שינויים
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>פרטי עסק</CardTitle>
                <CardDescription>
                  פרטי החברה או העוסק
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שם החברה / עוסק</Label>
                    <Input
                      value={profile.company_name || ''}
                      onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ח.פ / עוסק מורשה</Label>
                    <Input
                      value={profile.company_id || ''}
                      onChange={(e) => setProfile({ ...profile, company_id: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <h4 className="font-medium">פרטי בנק</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>שם הבנק</Label>
                    <Input
                      value={profile.bank_name || ''}
                      onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>מספר סניף</Label>
                    <Input
                      value={profile.bank_branch || ''}
                      onChange={(e) => setProfile({ ...profile, bank_branch: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>מספר חשבון</Label>
                    <Input
                      value={profile.bank_account || ''}
                      onChange={(e) => setProfile({ ...profile, bank_account: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <h4 className="font-medium">לוגו וחתימה</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>לוגו</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        גרור קובץ או לחץ להעלאה
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        בחר קובץ
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>חתימה דיגיטלית</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        גרור קובץ או לחץ להעלאה
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        בחר קובץ
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 ml-2" />
                    )}
                    שמור שינויים
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>הגדרות התראות</CardTitle>
                <CardDescription>
                  קבע כיצד תרצה לקבל התראות
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">התראות במייל</Label>
                      <p className="text-sm text-muted-foreground">
                        קבל התראות על אירועים חשובים במייל
                      </p>
                    </div>
                    <Switch
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, email_notifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">התראות SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        קבל התראות בהודעות SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.sms_notifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, sms_notifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">התראות WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">
                        קבל התראות בוואטסאפ
                      </p>
                    </div>
                    <Switch
                      checked={settings.whatsapp_notifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, whatsapp_notifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">תזכורות אוטומטיות</Label>
                      <p className="text-sm text-muted-foreground">
                        קבל תזכורות על משימות ופגישות
                      </p>
                    </div>
                    <Switch
                      checked={settings.auto_reminders}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, auto_reminders: checked })
                      }
                    />
                  </div>

                  {settings.auto_reminders && (
                    <div className="mr-6 space-y-2">
                      <Label>ימים לפני האירוע</Label>
                      <Select
                        value={settings.reminder_days_before.toString()}
                        onValueChange={(value) =>
                          setSettings({ ...settings, reminder_days_before: parseInt(value) })
                        }
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">יום אחד</SelectItem>
                          <SelectItem value="3">3 ימים</SelectItem>
                          <SelectItem value="7">שבוע</SelectItem>
                          <SelectItem value="14">שבועיים</SelectItem>
                          <SelectItem value="30">חודש</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 ml-2" />
                    )}
                    שמור שינויים
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Defaults Tab */}
          <TabsContent value="defaults">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>הגדרות חתימה</CardTitle>
                  <CardDescription>
                    הגדר ברירות מחדל לחתימה דיגיטלית
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>סוג חתימה ברירת מחדל</Label>
                      <Select
                        value={settings.default_signature_type}
                        onValueChange={(value) =>
                          setSettings({ ...settings, default_signature_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">חתימה מרחוק</SelectItem>
                          <SelectItem value="frontal">חתימה פרונטלית</SelectItem>
                          <SelectItem value="frontal_image">פרונטלית עם תמונה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>מפתח API של VSign</Label>
                      <Input
                        type="password"
                        value={settings.vsign_api_key || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, vsign_api_key: e.target.value })
                        }
                        placeholder="הזן מפתח API"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ברירות מחדל למחשבון</CardTitle>
                  <CardDescription>
                    ערכי ברירת מחדל למחשבון החיסכון
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>תשואה ברירת מחדל (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.default_return_rate}
                        onChange={(e) =>
                          setSettings({ ...settings, default_return_rate: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>דמ"נ מהפקדה (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.default_fee_deposit}
                        onChange={(e) =>
                          setSettings({ ...settings, default_fee_deposit: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>דמ"נ מצבירה (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.default_fee_accumulated}
                        onChange={(e) =>
                          setSettings({ ...settings, default_fee_accumulated: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 ml-2" />
                  )}
                  שמור שינויים
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentSettings;
