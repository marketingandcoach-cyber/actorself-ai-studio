import React, { useEffect, useState } from 'react';
import { FaceToVideoStudio } from './FaceToVideoStudio';

type Scene = { id: string; genre: string; title: string; hook: string; synopsis: string; file: string; emoji: string };
export const TEST_SCENES: Scene[] = [
  { id:'romance',genre:'Romance',title:'El reencuentro',hook:'Hay miradas que sobreviven a cualquier distancia.',synopsis:'En una estación bañada por la última luz del día, dos destinos vuelven a cruzarse. Un instante basta para despertar todo aquello que el tiempo no pudo borrar.',file:'1000655509.mp4',emoji:'❤️' },
  { id:'aventura',genre:'Aventura',title:'El templo perdido',hook:'Algunas puertas llevan siglos esperando a quien se atreva a abrirlas.',synopsis:'En lo profundo de una selva ancestral, una expedición encuentra señales de una civilización olvidada. El descubrimiento podría cambiar la historia para siempre.',file:'1000655510.mp4',emoji:'🗺️' },
  { id:'drama',genre:'Drama',title:'La carta',hook:'Diez segundos pueden cambiar una vida entera.',synopsis:'Una carta inesperada rompe el silencio de una habitación. Entre el dolor de lo revelado y la fuerza de una decisión, comienza una nueva historia.',file:'1000655511.mp4',emoji:'✉️' },
  { id:'misterio',genre:'Misterio',title:'La llave secreta',hook:'La verdad está encerrada. Y alguien acaba de encontrar la llave.',synopsis:'Una mansión antigua guarda más preguntas que respuestas. Un detective descubre un objeto capaz de revelar lo que otros quisieron ocultar.',file:'1000655512.mp4',emoji:'🗝️' },
  { id:'scifi',genre:'Ciencia ficción',title:'La última misión',hook:'Cuando llega la señal, el destino de todos queda en tus manos.',synopsis:'A bordo de una nave espacial, una alerta interrumpe la calma del universo. El comandante deberá reaccionar antes de que sea demasiado tarde.',file:'1000655513.mp4',emoji:'🚀' },
  { id:'comedia',genre:'Comedia',title:'El gran error',hook:'El desastre está servido. La risa también.',synopsis:'En un restaurante elegante, un pequeño accidente convierte una velada perfecta en un momento inolvidable. Hay errores imposibles de disimular.',file:'1000655514.mp4',emoji:'😂' },
  { id:'aventura-extrema',genre:'Aventura extrema',title:'La cima',hook:'El mundo se ve diferente cuando decides no rendirte.',synopsis:'Después de desafiar el frío, la altura y sus propios límites, un montañista alcanza la cumbre. La victoria se escribe en su rostro.',file:'1000655515.mp4',emoji:'🏔️' },
  { id:'epoca',genre:'Época',title:'El baile de 1890',hook:'Entre cientos de invitados, una sola mirada cambia la noche.',synopsis:'En un salón de baile iluminado por candelabros, el protocolo esconde sentimientos que nadie se atreve a confesar. Hasta que dos miradas se encuentran.',file:'1000655516.mp4',emoji:'🕯️' },
  { id:'futurista',genre:'Futurista',title:'Ciudad 2150',hook:'El futuro ya está aquí. ¿Estás preparado para vivirlo?',synopsis:'Una metrópolis de luces infinitas y vehículos voladores se extiende hasta el horizonte. Frente a ella, alguien contempla el comienzo de una nueva era.',file:'1000655517.mp4',emoji:'🌆' },
  { id:'biografica',genre:'Biográfica e histórica',title:'El gran descubrimiento',hook:'Antes de cambiar el mundo, hay que atreverse a hablar.',synopsis:'En un auditorio de los años cuarenta, un científico se dispone a presentar una idea revolucionaria. Una decisión puede transformar el curso de la historia.',file:'1000655518.mp4',emoji:'📜' },
  { id:'terror',genre:'Terror',title:'La mansión del miedo',hook:'Hay puertas que nunca debieron abrirse.',synopsis:'Una presencia inexplicable habita los pasillos de una vieja mansión. Cuando el silencio se rompe, el miedo deja de ser una sospecha.',file:'1000655519.mp4',emoji:'👻' },
];

export function TestSceneCatalog() {
  const [files,setFiles] = useState<Record<string,File>>({});
  const [active,setActive] = useState<string|null>(null);
  const [previews,setPreviews] = useState<Record<string,string>>({});
  useEffect(() => {
    const urls:Record<string,string>={};
    Object.entries(files).forEach(([id,file])=>{urls[id]=URL.createObjectURL(file);});
    setPreviews(urls);
    return ()=>Object.values(urls).forEach(url=>URL.revokeObjectURL(url));
  },[files]);
  const scene = TEST_SCENES.find(s=>s.id===active);
  return <section id="catalogo-pruebas" className="mx-auto max-w-6xl px-4 py-8 space-y-6">
    <header className="space-y-2">
      <p className="text-xs tracking-[0.25em] uppercase text-sky-400 font-semibold">ACTORSELF ORIGINALS · DEMO</p>
      <h2 className="text-3xl font-bold text-white">Catálogo de escenas de prueba</h2>
      <p className="text-slate-300">11 historias. 11 oportunidades de convertirte en protagonista. Explora el argumento, asocia el video original y prueba tu rostro en una escena en movimiento.</p>
      <p className="text-xs text-amber-200">Prototipo experimental: los videos se seleccionan desde tu dispositivo. No se suben automáticamente a GitHub. La transferencia facial actual es una composición 2D con seguimiento, no una sustitución neuronal fotorrealista.</p>
    </header>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {TEST_SCENES.map((s,index)=><article key={s.id} className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xl flex flex-col">
        {previews[s.id] ? <video className="w-full aspect-video object-cover bg-black" src={previews[s.id]} controls muted playsInline preload="metadata"/> :
          <div className="aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-sky-950 flex flex-col justify-center items-center gap-3"><span className="text-5xl" aria-hidden>{s.emoji}</span><span className="text-xs uppercase tracking-widest text-slate-400">Escena {String(index+1).padStart(2,'0')} · 10 segundos</span></div>}
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          <span className="text-xs text-sky-300 uppercase tracking-widest">{s.genre}</span>
          <h3 className="text-xl font-bold text-white">{s.title}</h3>
          <p className="text-amber-200 italic text-sm">{s.hook}</p>
          <p className="text-slate-300 text-sm leading-relaxed flex-1">{s.synopsis}</p>
          <label className="text-xs text-slate-300 block cursor-pointer">Asociar video {s.file}
            <input type="file" accept="video/*" className="block w-full mt-2 text-xs" onChange={e=>{const f=e.target.files?.[0];if(f)setFiles(prev=>({...prev,[s.id]:f}));}}/>
          </label>
          <button type="button" disabled={!files[s.id]} onClick={()=>{setActive(s.id);setTimeout(()=>document.getElementById('actorself-studio')?.scrollIntoView({behavior:'smooth'}),0);}} className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-500">
            {files[s.id] ? '🎬 Protagonizar esta escena' : 'Selecciona el MP4 para probar'}
          </button>
        </div>
      </article>)}
    </div>
    {scene && files[scene.id] && <div id="actorself-studio" className="space-y-3">
      <div className="rounded-xl border border-sky-700 bg-sky-950/50 p-4"><p className="text-xs text-sky-300 uppercase">Escena seleccionada</p><h3 className="text-xl font-bold">{scene.title}</h3><p className="text-slate-300 text-sm">{scene.synopsis}</p></div>
      <FaceToVideoStudio key={scene.id} initialVideo={files[scene.id]}/>
    </div>}
  </section>;
}
