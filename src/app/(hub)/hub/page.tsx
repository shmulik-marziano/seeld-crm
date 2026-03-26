import { redirect } from 'next/navigation';
import { HubPage } from '@/components/hub/HubPage';

export default async function Hub() {
  // Skip auth if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <HubPage userName="שמוליק" />;
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <HubPage userName={user.user_metadata?.full_name || user.email || 'שלום'} />;
}
