import Link from 'next/link'
import { Radar, ArrowRight } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-400/8 border border-cyan-400/15 flex items-center justify-center mb-6">
        <Radar size={28} className="text-cyan-400/60"/>
      </div>
      <h3 className="font-['Syne'] text-xl font-bold text-white mb-2">No scans yet</h3>
      <p className="text-sm text-[#7a8fa6] max-w-xs mb-8">
        Run your first GEO scan to see how visible your brand is to AI search engines.
      </p>
      <Link href="/dashboard/scan"
        className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#060b14] font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
        Start first scan <ArrowRight size={15}/>
      </Link>
    </div>
  )
}
