import Link from 'next/link'
import { ArrowRight, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { scoreColor, scoreLabel, type ScanReport } from '@/lib/api'
import { formatRelative } from '@/lib/utils'

const statusIcon = {
  complete: <CheckCircle2 size={13} className="text-emerald-400"/>,
  running:  <Loader2     size={13} className="text-cyan-400 animate-spin"/>,
  pending:  <Clock       size={13} className="text-amber-400"/>,
  error:    <AlertCircle size={13} className="text-rose-400"/>,
}
const statusLabel = { complete: 'Complete', running: 'Running', pending: 'Queued', error: 'Error' }

export default function ScanRow({ scan }: { scan: ScanReport }) {
  const color = scoreColor(scan.score)
  const label = scoreLabel(scan.score)
  return (
    <Link href={`/dashboard/report/${scan.id}`}
      className="flex items-center gap-4 px-5 py-4 rounded-xl bg-[#0a1120] border border-[rgba(34,211,238,0.08)] hover:border-cyan-400/25 hover:bg-[#0f1b30] transition-all group">
      <div className="w-12 h-12 rounded-xl border flex flex-col items-center justify-center flex-shrink-0"
        style={{borderColor:`${color}33`,background:`${color}0d`}}>
        <span className="text-lg font-bold font-mono leading-none" style={{color}}>{scan.score}</span>
        <span className="text-[8px] font-semibold uppercase tracking-wider mt-0.5" style={{color}}>{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{scan.target_brand}</p>
        <p className="text-xs text-[#7a8fa6] truncate mt-0.5">{scan.website_url}</p>
      </div>
      <span className="hidden sm:block text-xs text-[#7a8fa6] bg-[#0f1b30] border border-[rgba(34,211,238,0.08)] px-2.5 py-1 rounded-lg flex-shrink-0">{scan.category}</span>
      <div className="flex items-center gap-1.5 flex-shrink-0">{statusIcon[scan.status]}<span className="text-xs text-[#7a8fa6]">{statusLabel[scan.status]}</span></div>
      <span className="text-xs text-[#3d5166] flex-shrink-0 hidden md:block">{formatRelative(scan.created_at)}</span>
      <ArrowRight size={15} className="text-[#3d5166] group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"/>
    </Link>
  )
}
