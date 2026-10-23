import React, { useEffect, useRef, useState } from 'react';
import { FACE_SWAP_HOST, remoteErrorMessage, resultVideoUrl } from '../utils/remoteFaceSwap';
export function RemoteFaceSwapStudio({ initialVideo, initialVideoUrl }: { initialVideo?: File; initialVideoUrl?: string }) {
  const [photo,setPhoto]=useState<File>();
  const [video,setVideo]=useState<File>();
  const [preview,setPreview]=useState('');
  const [consent,setConsent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('Carga una foto frontal para personalizar los primeros 5 segundos de la escena.');
  const [output,setOutput]=useState('');
  const mounted=useRef(true), active=useRef(false);
  const clientRef=useRef<{close():void}|null>(null);
  const cancelRef=useRef<(()=>void)|null>(null);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;cancelRef.current?.();clientRef.current?.close();};},[]);
  useEffect(()=>{if(!photo){setPreview('');return;}const url=URL.createObjectURL(photo);setPreview(url);return()=>URL.revokeObjectURL(url);},[photo]);
  function selectFile(file:File|undefined,kind:'photo'|'video') {
    if(!file)return;
    const valid=kind==='photo'?/^image\/(jpeg|png|webp)$/.test(file.type):file.type==='video/mp4';
    if(!valid||file.size>(kind==='photo'?10:100)*1024*1024){setMessage(kind==='photo'?'Usa JPG, PNG o WebP de hasta 10 MB.':'Usa un MP4 de hasta 100 MB.');return;}
    if(kind==='photo')setPhoto(file);else setVideo(file);
    setOutput('');setConsent(false);
  }
  async function run(){
    const chosen=video||initialVideo;
    if(active.current||!photo||!consent||(!chosen&&!initialVideoUrl))return;
    active.current=true;setBusy(true);setOutput('');
    const update=(s:string)=>{if(mounted.current)setMessage(s);};
    let timer:ReturnType<typeof setTimeout>|undefined;
    let expired=false;
    let phase="connection";
    try{
      update('Conectando con FaceSwap Zero…');
      const {Client,handle_file}=await import('@gradio/client');
      const app=await Client.connect(FACE_SWAP_HOST,{events:['data','status']});
      clientRef.current=app;
      if(!mounted.current){app.close();return;}
      phase='scene';
      update('Preparando la escena y enviando los archivos autorizados…');
      let target:unknown;
      if(chosen)target=handle_file(chosen);
      else{
        const url=new URL(initialVideoUrl!,window.location.href);
        if(url.origin!==window.location.origin)throw new Error('Escena no válida');
        const response=await app.predict('/fetch_url',{url:url.href});
        target=(response.data as unknown[])[0];
      }
      if(!mounted.current)return;
      phase='swap';
      const job=app.submit('/swap',{source_img:handle_file(photo),target_file:target,selector_label:'Chỉ mặt lớn nhất',seg_seconds:5,seg_index:1,long_side:960});
      cancelRef.current=()=>{void job.cancel();};
      timer=setTimeout(()=>{expired=true;void job.cancel();app.close();},300000);
      let result='';
      let finalLog='';
      for await(const event of job){
        if(!mounted.current)break;
        if(event.type==='status'){
          if(event.stage==='error')throw new Error(String(event.message||'Error del servicio'));
          update(event.stage==='pending'?'Esperando turno en la GPU gratuita…':'IA sustituyendo el rostro en la escena…');
        }
        if(event.type==='data'){
          const data=event.data as unknown[];
          if(typeof data?.[2]==='string')finalLog=data[2];
          const slot=data?.[1] as {value?:{video?:unknown};video?:unknown}|null;
          if(slot?.video||slot?.value?.video)result=resultVideoUrl(data);
        }
      }
      if(expired||!result)throw new Error(finalLog||'Sin resultado');
      if(mounted.current){setOutput(result);update('Video generado por IA. Revisa la semejanza y los movimientos antes de compartirlo.');}
    }catch(error){console.warn('FaceSwap '+phase+': '+String(error instanceof Error?error.message:error).replace(/https?:\/\/\S+/g,'[URL]').replace(/\/tmp\/\S+/g,'[file]').slice(0,300));update(expired?'La espera superó 5 minutos. Comprueba la herramienta externa antes de repetir: la solicitud podría seguir procesándose.':remoteErrorMessage(error));}
    finally{if(timer)clearTimeout(timer);cancelRef.current=null;clientRef.current?.close();clientRef.current=null;active.current=false;if(mounted.current)setBusy(false);}
  }
  return <section className="mx-auto max-w-5xl p-5 sm:p-8 rounded-3xl border border-violet-700 bg-slate-900 space-y-4">
    <h2 className="text-2xl font-bold text-violet-300">Tu rostro en la escena · IA en línea</h2>
    <p className="text-sm text-slate-300">Prueba de 5 segundos con FaceSwap Zero en Hugging Face. IA neuronal remota, sujeta a cuota gratuita y disponibilidad. La semejanza puede variar.</p>
    <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm">1. Tu foto frontal<input type="file" accept="image/jpeg,image/png,image/webp" className="block mt-2 w-full text-xs" onChange={e=>selectFile(e.target.files?.[0],'photo')}/></label>
        <label className="text-sm">2. Video MP4 opcional<input type="file" accept="video/mp4" className="block mt-2 w-full text-xs" onChange={e=>selectFile(e.target.files?.[0],'video')}/><span className="block mt-2 text-xs text-slate-400">{video?.name||initialVideo?.name||(initialVideoUrl?'Se usará la escena seleccionada del catálogo.':'Selecciona un video autorizado.')}</span></label>
      </div>
      {preview&&<img src={preview} alt="Foto seleccionada para sustituir el rostro" className="h-32 w-32 rounded-xl object-cover"/>}
      <label className="flex gap-2 items-start text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Tengo autorización para usar este rostro y video. Acepto enviarlos al Space comunitario poxvnn/faceswap-zero en Hugging Face para procesarlos. No envíes material confidencial; el resultado tendrá un enlace alojado en el servicio externo.</label>
    </fieldset>
    <button className="rounded-xl px-5 py-3 bg-violet-600 disabled:opacity-40 font-semibold" disabled={busy||!photo||!consent||(!video&&!initialVideo&&!initialVideoUrl)} onClick={run}>{busy?'Procesando con IA…':'Generar 5 segundos con mi rostro'}</button>
    <p role="status" aria-live="polite" className="text-sm text-violet-200">{message}</p>
    {output&&<div className="space-y-3"><video src={output} controls playsInline className="w-full rounded-xl"/><a className="inline-block rounded-xl px-5 py-3 bg-emerald-700 font-semibold" href={output} target="_blank" rel="noopener noreferrer">Abrir o descargar video generado</a><p className="text-xs text-slate-400">Guarda el video: el enlace es temporal. Se modifica el rostro; el cabello, cuerpo y vestuario pertenecen a la escena original.</p></div>}
    <a href={FACE_SWAP_HOST} target="_blank" rel="noopener noreferrer" className="block text-xs text-violet-300 underline">Abrir FaceSwap Zero si el servicio no responde</a>
  </section>;
}
