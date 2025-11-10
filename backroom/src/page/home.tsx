import Button2 from "@/components/button2";
import Header from "@/components/header";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="h-screen w-full bg-neutral-900 relative overflow-hidden font-mono overflow-y-hidden">
      <Header />
     <img src={"/home-bg.png"} alt="background" className="absolute inset-0 mix-blend-screen right-0 object-cover object-right-bottom opacity-70 pointer-events-none " loading="lazy" width={960} />

      <div className="relative z-10  flex items-center justify-center py-40">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl tracking-wide text-neutral-100 mb-3 font-light">
            backroom
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            quick groups, chat anonymously
          </p>

          <div className="relative">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/60 to-transparent" />
          </div>

          <div className=" border border-neutral-900 rounded-lg p-8 shadow-2xl">
            <p className="text-neutral-500 text-sm mb-6">
              Spin up a private room and start chatting instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-7 justify-center">
              <Link to="/chat" className="inline-flex justify-center">
                <Button2 text="Open Chat" />
              </Link>
              
              <Link to="/chat" className="inline-flex justify-center">
                <Button2 text="Join a Room" />
              </Link>
            </div>
          </div>

          <div className="relative ">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-600 to-transparent" />
          </div>

      
        </div>
      </div>
    </main>
  )
}