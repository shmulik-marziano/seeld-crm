import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HubPage } from '@/components/hub/HubPage';

export default async function Hub() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <HubPage userName={user.user_metadata?.full_name || user.email || 'שלום'} />;
}
