import React, { useState } from 'react'
import type { EventItem } from '../types'

interface EventsProgramProps {
  events: EventItem[]
  onSelectEvent: (eventTitle: string) => void
}

export const EventsProgram: React.FC<EventsProgramProps> = ({
  events,
  onSelectEvent
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEvents = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.tag.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section id="programa" className="py-16 bg-slate-900/40 relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black px-3.5 py-1 rounded-full uppercase">
              <i className="fa-solid fa-calendar-days mr-1"></i> Cobertura 10 al Cierre
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-white">
              Programa Oficial de Fiestas Patrias
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Explora el calendario de festejos en San Pedro Lagunillas. Haz clic en "Pedir Video/Foto" para seleccionar tu evento.
            </p>
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar fecha o evento..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-500 text-xs"></i>
            </div>
          </div>
        </div>

        {/* EVENTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    <i className="fa-solid fa-calendar-day mr-1"></i> {event.date}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md">
                    {event.tag}
                  </span>
                </div>
                <h3 className="font-serif font-black text-xl text-white group-hover:text-amber-300 transition-colors">
                  {event.title}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">{event.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <i className="fa-solid fa-camera-retro"></i> {event.badge}
                </span>
                <a
                  href="#cotizador"
                  onClick={() => onSelectEvent(event.title)}
                  className="text-amber-400 hover:text-amber-300 hover:underline font-bold flex items-center gap-1"
                >
                  Pedir Video/Foto →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
