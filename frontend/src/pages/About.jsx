import { Github, Linkedin, Instagram, Twitter, Phone, Code2, Zap, Trophy, Users, Crown, ExternalLink } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import pfp from "../assets/pfp.jpg"
import gpt from "../assets/gpt.jpg"
import grok from "../assets/grok.jpg"
import pranav from "../assets/pranav.jpg"
import ashish from "../assets/ashish.jpg"
import prajyot from "../assets/prajyot.jpg"

const developers = [
{
    name: "Prajyot Borikar",
    role: "Poora kaam isne hi kiya hai",
    photo: prajyot,
    mobile: "+91-8421379774",
    contribution: "Poora kaam isne hi kiya hai",
    social: {
      github: "https://github.com/prajyotborikar", 
      linkedin: "https://linkedin.com/in/prajyotborikar", // ← your LinkedIn
      instagram: "https://instagram.com/prajyot.exe",     // ← your IG
      twitter: "https://twitter.com/prajyotborikar" 
    }
  },
  {
    name: "Pranav Ratnalikar",
    role: "Kya malum",
    photo: pranav,
    mobile: "+91-7758063017",
    contribution: "Kya malum",
    social: {
      github: "https://github.com/PranavPRatnalikar", 
      linkedin: "https://www.linkedin.com/in/pranav-ratnalikar/", // ← your LinkedIn
      instagram: "https://instagram.com/pranav_ratnalikar",     // ← your IG
      twitter: "https://twitter.com/pranav_ratnalikar"       // ← your Twitter/X
    }
  },
  {
    name: "Ashish Jha",
    role: "Kya malum",
    photo: ashish,
    mobile: "+91-9322501992",
    contribution: "Kya malum",
    social: {
      github: "https://github.com/ashishjha1034", 
      linkedin: "https://linkedin.com/in/ashishonln", // ← your LinkedIn
      instagram: "https://instagram.com/ashishhxz",     // ← your IG
      twitter: "https://twitter.com/ashishjha1034" 
    }
  }
]

export default function About() {
  const openLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-slate-950 via-slate-900 to-black text-white overflow-hidden relative">
      <Navbar />
{/* 
    <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl mb-5">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-emerald-600/6 to-teal-600/8" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="relative p-10 flex items-center justify-between">
                        <div className="flex items-center gap-8">

                            <div>
                                <h1 className="text-5xl font-black text-white tracking-tighter">Custom Challenges</h1>
                                <p className="text-xl text-slate-400 mt-2 font-light">Challenge friends • Private matches • Full control</p>
                            </div>
                        </div>

                    </div>
                </div> */}

      <div className="relative z-10 max-w-8xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="text-center mb-24">
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-1">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl">
              CodeX
            </span>
          </h1>
          <p className="text-3xl md:text-3xl font-bold text-slate-300 mb-8 tracking-tight">
            Real-Time 1v1 Coding Battle Arena
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: Zap, title: "Real-Time Sync", desc: "Live code collaboration powered by WebSocket" },
            { icon: Trophy, title: "Elo-Based Matchmaking", desc: "Fair 1v1 battles with dynamic rating system" },
            { icon: Code2, title: "Secure Execution", desc: "Docker + Judge0 sandbox for 50+ languages" }
          ].map((feat, i) => (
            <div
              key={i}
              className="group relative bg-gradient-to-r from-slate-950 via-slate-900 to-black backdrop-blur-2xl border border-slate-700/60 rounded-2xl p-10 text-center shadow-2xl transition-all duration-500 hover:scale-105 hover:border-emerald-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-black rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <feat.icon className="w-20 h-20 mx-auto mb-6 text-emerald-400 drop-shadow-lg" />
              <h3 className="text-2xl font-black mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {feat.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mb-24">
          <h2 className="text-5xl md:text-6xl font-black text-center mb-16 tracking-tighter">
            Powered By <span className="text-emerald-400">Cutting-Edge</span> Tech
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["React.js", "Python", "Flask", "Supabase"].map((tech) => (
              <div
                key={tech}
                className="group relative bg-slate-900 backdrop-blur-xl border border-slate-700/50 rounded-2xl py-8 text-center font-bold text-lg tracking-wider transition-all duration-300 hover:border-emerald-500/60 hover:scale-105 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-emerald-400">{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Meet the Team */}
        <div>
          <h2 className="text-5xl md:text-6xl font-black text-center mb-20 tracking-tighter">
            The <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Team</span> that Built CodeX
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {developers.map((dev) => (
              <div
                key={dev.name}
                className="group relative bg-gradient-to-bl from-slate-950 via-slate-900 to-black backdrop-blur-2xl border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 hover:border-emerald-500/60 hover:scale-105 hover:shadow-emerald-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />

                <div className="relative p-10 text-center">
                  {/* Profile Picture */}
                  {/* for glow on bg of imag: group-hover:scale-150 transition-transform duration-700 */}
                  <div className="relative mx-auto w-36 h-36 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full blur-xl scale-0 " />
                    <img
                      src={dev.photo}
                      alt={dev.name}
                      className="relative w-full h-full rounded-full object-cover border-4 border-emerald-400 shadow-lg shadow-emerald-500/40"
                    />
                  </div>

                  <h3 className="text-3xl font-black mb-2">{dev.name}</h3>
                  <p className="text-emerald-400 font-bold text-lg mb-6">{dev.role}</p>
                  {/* <p className="text-slate-300 text-sm italic leading-relaxed px-4 mb-8">
                    "{dev.contribution}"
                  </p> */}

                  {/* Social Links */}
                  <div className="flex justify-center gap-4 flex-wrap">
                    {dev.social.github && (
                      <button
                        onClick={() => openLink(dev.social.github)}
                        className="p-4 bg-slate-700/50 rounded-2xl backdrop-blur-xl border border-slate-600/50 transition-all duration-300 hover:border-emerald-500/60 hover:scale-110 hover:bg-emerald-500/10 group/social"
                        title="GitHub"
                      >
                        <Github className="w-6 h-6 text-slate-400 group-hover/social:text-emerald-400 transition-colors" />
                      </button>
                    )}
                    {dev.social.linkedin && (
                      <button
                        onClick={() => openLink(dev.social.linkedin)}
                        className="p-4 bg-slate-700/50 rounded-2xl backdrop-blur-xl border border-slate-600/50 transition-all duration-300 hover:border-emerald-500/60 hover:scale-110 hover:bg-emerald-500/10 group/social"
                        title="LinkedIn"
                      >
                        <Linkedin className="w- 6 h-6 text-slate-400 group-hover/social:text-emerald-400 transition-colors" />
                      </button>
                    )}
                    {dev.social.instagram && (
                      <button
                        onClick={() => openLink(dev.social.instagram)}
                        className="p-4 bg-slate-700/50 rounded-2xl backdrop-blur-xl border border-slate-600/50 transition-all duration-300 hover:border-emerald-500/60 hover:scale-110 hover:bg-emerald-500/10 group/social"
                        title="Instagram"
                      >
                        <Instagram className="w-6 h-6 text-slate-400 group-hover/social:text-emerald-400 transition-colors" />
                      </button>
                    )}
                    {dev.social.twitter && (
                      <button
                        onClick={() => openLink(dev.social.twitter)}
                        className="p-4 bg-slate-700/50 rounded-2xl backdrop-blur-xl border border-slate-600/50 transition-all duration-300 hover:border-emerald-500/60 hover:scale-110 hover:bg-emerald-500/10 group/social"
                        title="Twitter / X"
                      >
                        <Twitter className="w-6 h-6 text-slate-400 group-hover/social:text-emerald-400 transition-colors" />
                      </button>
                    )}
                    {dev.social.website && (
                      <button
                        onClick={() => openLink(dev.social.website)}
                        className="p-4 bg-slate-700/50 rounded-2xl backdrop-blur-xl border border-slate-600/50 transition-all duration-300 hover:border-emerald-500/60 hover:scale-110 hover:bg-emerald-500/10 group/social"
                        title="Website"
                      >
                        <ExternalLink className="w-6 h-6 text-slate-400 group-hover/social:text-emerald-400 transition-colors" />
                      </button>
                    )}
                  </div>

                   {/* Mobile */}
                  <div className="flex items-center justify-center gap-3 text-slate-400 mt-6">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium">{dev.mobile}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <hr className='mt-10'/>
        <div className="text-center mt-10">
          <p className="text-xl text-slate-500 tracking-widest">
            Semester 7 Major Project | Built with passion in 2025 
          </p>
        </div>
      </div>
    </div>
  )
}