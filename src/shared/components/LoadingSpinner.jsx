export default function LoadingSpinner({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#16171d] z-[9999] gap-4">
        {/* Animated Orbs Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-35">
          <div className="absolute top-[15%] left-[10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[130px] animate-pulse" />
        </div>

        <div className="relative flex flex-col items-center gap-6">
          {/* Logo / Brand */}
          <div className="text-white text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            SEO<span className="text-[#c084fc]">Insight</span>
          </div>
          {/* Spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-[#c084fc] animate-spin" />
          </div>
          <div className="text-gray-400 text-[10px] font-mono tracking-widest uppercase mt-2">
            Restoring Session
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-8 h-8 rounded-full border-3 border-white/5 border-t-[#c084fc] animate-spin" />
    </div>
  )
}
