'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Zap, LayoutDashboard, PlusCircle, LogOut, ChevronRight } from 'lucide-react'

const NAV = [
  { href: '/dashboard',      icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/scan', icon: PlusCircle,       label: 'New Scan' },
]

export default function DashboardNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = userEmail.slice(0, 2).toUpperCase()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a1120] border-r border-[rgba(34,211,238,0.08)] flex flex-col z-40">
      <div className="px-6 py-5 border-b border-[rgba(34,211,238,0.08)]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center group-hover:bg-cyan-400/20 transition-colors">
            <Zap className="w-4 h-4 text-cyan-400"/>
          </div>
          <span className="font-['Syne'] text-lg font-bold tracking-tight text-white">Visora</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-[#3d5166]">Workspace</p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${active ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/15' : 'text-[#7a8fa6] hover:text-white hover:bg-[#0f1b30]'}`}>
              <Icon size={16} className={active ? 'text-cyan-400' : 'text-[#3d5166] group-hover:text-[#7a8fa6]'}/>
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-cyan-400/50"/>}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[rgba(34,211,238,0.08)] space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-[11px] font-bold text-cyan-400 font-mono">{initials}</div>
          <span className="text-xs text-[#7a8fa6] truncate flex-1">{userEmail}</span>
        </div>
        <button onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#7a8fa6] hover:text-rose-400 hover:bg-rose-400/5 transition-all group">
          <LogOut size={16} className="text-[#3d5166] group-hover:text-rose-400"/>
          Sign out
        </button>
      </div>
    </aside>
  )
}
