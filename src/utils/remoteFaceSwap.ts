export const FACE_SWAP_HOST = 'https://poxvnn-faceswap-zero.hf.space';
export function resultVideoUrl(data: unknown): string {
  if (!Array.isArray(data)) throw new Error('Sin video');
  const slot = data[1]?.value ?? data[1];
  const video = slot?.video;
  const value = typeof video === 'string' ? video : video?.url;
  if (typeof value !== 'string') throw new Error('Sin video');
  const url = new URL(value, FACE_SWAP_HOST);
  if (url.origin !== FACE_SWAP_HOST || !url.pathname.startsWith('/gradio_api/file=')) throw new Error('Enlace no válido');
  return url.href;
}
export function remoteErrorMessage(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  if (/quota|exceeded|requested vs|limit/i.test(text)) return 'La cuota gratuita no alcanza. Inténtalo cuando se renueve; no se activarán pagos.';
  return 'El servicio gratuito no pudo completar la solicitud. Puede estar ocupado o no detectar el rostro. No se generó un resultado verificado. Inténtalo más tarde o abre la herramienta externa.';
}
