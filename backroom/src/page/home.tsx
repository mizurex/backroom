import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-neutral-900 relative overflow-hidden font-mono">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 4px, transparent 4px, transparent 8px), repeating-linear-gradient(90deg, #fff 0px, #fff 4px, transparent 4px, transparent 8px)`,
        backgroundSize: '32px 32px'
      }}/>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold font-mono tracking-wide text-neutral-100 mb-3">
            backroom
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            quick groups, chat anonymously
          </p>

          <div className="relative my-6">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/60 to-transparent" />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 shadow-2xl">
            <p className="text-neutral-300 text-sm mb-6">
              Spin up a private room and start chatting instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/chat" className="inline-flex justify-center">
                <button className="px-6 py-3 rounded-sm bg-violet-300 hover:bg-violet-400 text-neutral-900 transition-colors">
                  Open Chat
                </button>
              </Link>
              <Link to="/chat" className="inline-flex justify-center">
                <button className="px-6 py-3 rounded-sm bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 transition-colors">
                  Join a Room
                </button>
              </Link>
            </div>
          </div>

          <div className="relative my-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>

          <div className="text-center mt-10 text-xs text-neutral-600">
              minimal • anonymous
          </div>
        </div>
      </div>
    </main>
  )
}