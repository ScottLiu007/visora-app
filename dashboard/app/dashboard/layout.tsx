import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-[#060b14] flex">
      <DashboardNav userEmail={session.user.email ?? ''} />
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  )
}
