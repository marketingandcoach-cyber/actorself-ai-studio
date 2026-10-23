import React, { useState } from 'react';

export function AlexaSimulation({ onCommand, context }: {
  onCommand: (command: string) => string;
  context: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{user: string; answer: string}[]>([]);
  const examples = ['Alexa, open ACTORSELF', 'Choose Kepler', 'Choose mystery ending', 'Prepare my scene'];
  const send = (command: string) => {
    if (!command.trim()) return;
    const answer = onCommand(command);
    setMessages(previous => [...previous.slice(-7), { user: command, answer }]);
    setInput('');
  };
  return <section className="max-w-5xl w-full mx-auto px-4 pt-5" aria-label="Alexa+ experience simulator">
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}
      className="w-full rounded-xl border border-cyan-600 bg-slate-900 px-5 py-3 text-left font-semibold text-cyan-200">
      {open ? '−' : '+'} Alexa+ · ACTORSELF conversational simulator
    </button>
    {open && <div className="rounded-xl border border-cyan-900 bg-slate-900 p-5 space-y-4">
      <p className="text-xs text-slate-400">Web simulation for the Alexa+ track. Commands control this prototype. No live Alexa+, Prime Video or AWS connection. / Simulación web sin conexión real a Alexa+.</p>
      <p className="text-sm text-cyan-200" role="status">{context}</p>
      <div className="space-y-3 max-h-64 overflow-auto" role="log" aria-live="polite">
        {messages.length === 0 && <p>Welcome! Ask me to open ACTORSELF, choose Kepler, Fog or Neon, change the ending, or prepare your scene. También puedes escribir en español.</p>}
        {messages.map((message, index) => <div key={index} className="text-sm">
          <p className="text-slate-400">You: {message.user}</p>
          <p className="text-cyan-100">Simulator: {message.answer}</p>
        </div>)}
      </div>
      <div className="flex flex-wrap gap-2">{examples.map(example => <button key={example} type="button"
        onClick={() => send(example)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800">{example}</button>)}</div>
      <form onSubmit={event => { event.preventDefault(); send(input); }} className="flex gap-2">
        <input aria-label="Message to Alexa simulator" value={input} onChange={event => setInput(event.target.value)}
          placeholder="Alexa, choose Neon / Alexa, elige Neón" className="min-w-0 flex-1 rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm" />
        <button type="submit" className="rounded-lg bg-cyan-700 px-4 py-2 font-semibold">Send</button>
      </form>
    </div>}
  </section>;
}
