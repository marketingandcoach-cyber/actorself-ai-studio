import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function mediaUrl(value) {
  const u = new URL(value);
  if (u.protocol !== 'https:' || u.username || u.password) throw new Error('Media must use HTTPS without credentials.');
  return u.href;
}
export async function generate({ key, source, target, consent, fetcher = fetch, pause = ms => new Promise(r => setTimeout(r, ms)) }) {
  if (!key) throw new Error('Configure the AKOOL_API_KEY repository secret first.');
  if (consent !== 'true') throw new Error('Explicit consent is required.');
  const body = { source_url: mediaUrl(source), target_url: mediaUrl(target), single_face_mode: true, face_enhance: false, model_style: 'realistic' };
  const request = async (endpoint, options = {}) => {
    const response = await fetcher('https://openapi.akool.com' + endpoint, {
      ...options, redirect: 'error', signal: AbortSignal.timeout(30000),
      headers: { 'Content-Type': 'application/json', 'x-api-key': key }
    });
    if (!response.ok) throw new Error('AKOOL HTTP ' + response.status);
    const data = await response.json();
    // Do not log upstream payloads: they can contain private media URLs.
    if (data.code !== 1000) throw new Error('AKOOL error code ' + Number(data.code));
    return data.data;
  };
  // Intentionally submit only once. Retrying a POST could spend credits twice.
  const submitted = await request('/api/open/v4/faceswap/faceswapPlusByImage', { method: 'POST', body: JSON.stringify(body) });
  if (!submitted?._id) throw new Error('AKOOL did not return a result ID.');
  for (let attempt = 0; attempt < 100; attempt++) {
    await pause(10000);
    const data = await request('/api/open/v3/faceswap/result/listbyids?_ids=' + encodeURIComponent(submitted._id));
    const result = data?.result?.find(item => item._id === submitted._id);
    if (result?.faceswap_status === 4) throw new Error('AKOOL could not process the selected face/video.');
    if (result?.faceswap_status === 3) return mediaUrl(result.url);
  }
  throw new Error('Timed out waiting for AKOOL. A job may still be processing; do not resubmit automatically.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const url = await generate({ key: process.env.AKOOL_API_KEY, source: process.env.SOURCE_IMAGE_URL, target: process.env.TARGET_VIDEO_URL, consent: process.env.CONSENT });
    // Result download deliberately excludes the API credential.
    const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('video/')) throw new Error('Result is not a downloadable video.');
    await mkdir('akool-output', { recursive: true });
    await writeFile('akool-output/actorself-face-swap.mp4', Buffer.from(await response.arrayBuffer()));
    console.log('Video generated. Download the actorself-face-swap artifact. Review identity and visual quality before sharing.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
