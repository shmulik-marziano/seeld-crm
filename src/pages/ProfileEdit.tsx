import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Upload, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().trim().min(1, 'שם מלא הוא שדה חובה').max(100, 'השם חייב להיות פחות מ-100 תווים'),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

const ProfileEdit = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/');
      return;
    }

    // Get user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    setUserRole(roleData?.role || 'client');

    // Get profile
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו לטעון את הפרופיל',
        variant: 'destructive',
      });
      return;
    }

    setProfile(profileData);
    setFullName(profileData.full_name || '');
    setPhone(profileData.phone || '');
    setAddress(profileData.address || '');
    setAvatarUrl(profileData.avatar_url || '');
    
    if (profileData.date_of_birth) {
      setDateOfBirth(new Date(profileData.date_of_birth));
    }

    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'שגיאה',
        description: 'גודל הקובץ חייב להיות פחות מ-5MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'שגיאה',
        description: 'ניתן להעלות רק קבצי תמונה',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        title: 'שגיאה בהעלאה',
        description: uploadError.message,
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    setAvatarUrl(publicUrl);
    setUploading(false);

    toast({
      title: 'הצלחה',
      description: 'התמונה הועלתה בהצלחה',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    try {
      profileSchema.parse({ full_name: fullName, phone, address });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'שגיאה בנתונים',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        date_of_birth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
        avatar_url: avatarUrl || null,
      })
      .eq('user_id', session.user.id);

    setSaving(false);

    if (error) {
      toast({
        title: 'שגיאה בשמירה',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'הצלחה',
      description: 'הפרטים עודכנו בהצלחה',
    });

    // Navigate back to appropriate dashboard
    if (userRole === 'agent' || userRole === 'admin') {
      navigate('/agent/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              עריכת פרופיל
            </CardTitle>
            <CardDescription>
              עדכן את הפרטים האישיים שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                    {fullName.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-md transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'מעלה...' : 'העלה תמונה'}</span>
                  </div>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </Label>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full-name">שם מלא *</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="הזן שם מלא"
                  required
                  maxLength={100}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="050-1234567"
                  maxLength={20}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">כתובת</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="רחוב, עיר"
                  maxLength={200}
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label>תאריך לידה</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-right font-normal',
                        !dateOfBirth && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : 'בחר תאריך'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateOfBirth}
                      onSelect={setDateOfBirth}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(userRole === 'agent' || userRole === 'admin' ? '/agent/dashboard' : '/client/dashboard')}
                  className="flex-1"
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                >
                  {saving ? 'שומר...' : 'שמור שינויים'}
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEdit;
