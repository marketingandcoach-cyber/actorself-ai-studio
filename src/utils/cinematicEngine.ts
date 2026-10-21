import { CommanderStyle, AlternateClimax, CustomizationConfig, ParticipantProfile } from '../types';

interface GenerationProgressCallback {
  (progress: number, currentPhaseText: string): void;
}

export async function generateCinematicScene(
  participant: ParticipantProfile,
  config: CustomizationConfig,
  onProgress?: GenerationProgressCallback
): Promise<{ videoBlob: Blob; videoUrl: string; durationSec: number }> {
  // Pre-load user image element
  let userImg: HTMLImageElement | null = null;
  if (participant.photoDataUrl) {
    userImg = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = participant.photoDataUrl;
    });
  }

  // Setup offscreen high-definition 16:9 canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('No se pudo inicializar el contexto 2D de Canvas');
  const context2d: CanvasRenderingContext2D = ctx;

  // Setup Web Audio API Synthesizer & Audio Destination
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const audioDest = audioCtx.createMediaStreamDestination();

  // Create real audio synthesis schedule
  setupCinematicAudio(audioCtx, audioDest, config.alternateEnding);

  // Capture canvas stream and combine with synthesized audio
  const canvasStream = canvas.captureStream(60); // 60 FPS
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  // Determine supported video MIME type
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4'
  ];
  const chosenMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
  const recorder = new MediaRecorder(combinedStream, {
    mimeType: chosenMime,
    videoBitsPerSecond: 8000000 // 8 Mbps high quality
  });

  const recordedChunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) recordedChunks.push(e.data);
  };

  // Starfield particle simulation initialization
  const stars: { x: number; y: number; z: number; size: number }[] = [];
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 1920 * 2,
      y: (Math.random() - 0.5) * 1080 * 2,
      z: Math.random() * 1000 + 10,
      size: Math.random() * 2 + 0.5,
    });
  }

  // Validate output by reading media metadata before reporting success.
  const verifyVideo = (url: string): Promise<number> => new Promise((resolve, reject) => {
    const video = document.createElement('video');
    let finished = false;
    const finish = (error?: Error, duration?: number) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      video.removeAttribute('src');
      video.load();
      if (error) reject(error);
      else resolve(duration!);
    };
    const timeout = setTimeout(() => finish(new Error('Tiempo agotado al verificar el video.')), 12000);
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) finish(undefined, duration);
      else {
        // Some WebM recordings report Infinity until seeked.
        video.currentTime = 1e9;
      }
    };
    video.onseeked = () => {
      if (Number.isFinite(video.currentTime) && video.currentTime > 0) finish(undefined, video.currentTime);
      else finish(new Error('No se pudo medir la duración del video.'));
    };
    video.onerror = () => finish(new Error('El archivo generado no se puede reproducir.'));
    video.src = url;
  });

  const totalDurationMs = 5000;
  const startTime = performance.now();
  let finished = false;
  let animationId = 0;
  let stopTimeout: ReturnType<typeof setTimeout> | undefined;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      cancelAnimationFrame(animationId);
      if (stopTimeout) clearTimeout(stopTimeout);
      combinedStream.getTracks().forEach(track => track.stop());
      audioCtx.close().catch(() => {});
    };
    const fail = (error: Error) => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(error);
    };
    recorder.onerror = () => fail(new Error('La grabación audiovisual falló.'));
    recorder.onstop = async () => {
      if (finished) return;
      finished = true;
      cleanup();
      const videoBlob = new Blob(recordedChunks, { type: chosenMime });
      if (videoBlob.size < 1024) {
        reject(new Error('El video generado está vacío o incompleto.'));
        return;
      }
      const videoUrl = URL.createObjectURL(videoBlob);
      try {
        const durationSec = await verifyVideo(videoUrl);
        if (durationSec < 1 || durationSec > 15) throw new Error('La duración del video está fuera del rango esperado.');
        resolve({ videoBlob, videoUrl, durationSec });
      } catch (error) {
        URL.revokeObjectURL(videoUrl);
        reject(error);
      }
    };
    try {
      recorder.start(100);
    } catch (error) {
      fail(error instanceof Error ? error : new Error('No se pudo iniciar la grabación.'));
      return;
    }
    function renderLoop() {
      if (finished) return;
      const elapsed = Math.min(totalDurationMs, performance.now() - startTime);
      const progress = elapsed / totalDurationMs;
      const t = elapsed / 1000;
      let phaseLabel = 'Iniciando telemetría...';
      if (t < 1.0) phaseLabel = 'Segundo 0–1: Interior de la nave Kepler-One';
      else if (t < 2.0) phaseLabel = 'Segundo 1–2: Alerta de estrella inestable';
      else if (t < 3.0) phaseLabel = `Segundo 2–3: Integrando a Comandante ${participant.name || ''}`;
      else if (t < 4.0) phaseLabel = 'Segundo 3–4: Sobrecarga térmica y cuenta regresiva';
      else phaseLabel = 'Segundo 4–5: Salto hiperespacial ejecutado';
      onProgress?.(progress, phaseLabel);
      try {
        renderFrame(context2d, t, stars, userImg, participant.name || 'COMANDANTE', config);
      } catch (error) {
        fail(error instanceof Error ? error : new Error('Error al dibujar un fotograma.'));
        if (recorder.state !== 'inactive') recorder.stop();
        return;
      }
      if (elapsed < totalDurationMs) animationId = requestAnimationFrame(renderLoop);
      else stopTimeout = setTimeout(() => {
        if (!finished && recorder.state !== 'inactive') recorder.stop();
      }, 150);
    }
    animationId = requestAnimationFrame(renderLoop);
  });
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  stars: { x: number; y: number; z: number; size: number }[],
  userImg: HTMLImageElement | null,
  participantName: string,
  config: CustomizationConfig
) {
  const w = 1920;
  const h = 1080;
  const cx = w / 2;
  const cy = h / 2;

  // Background deep space gradient
  ctx.fillStyle = '#02040a';
  ctx.fillRect(0, 0, w, h);

  // Dynamic Camera Shake on Emergency (Seconds 1.2 to 4.2)
  let shakeX = 0;
  let shakeY = 0;
  if (t >= 1.2 && t <= 4.3) {
    const shakeIntensity = t >= 3.0 ? 8 : 4;
    shakeX = (Math.random() - 0.5) * shakeIntensity;
    shakeY = (Math.random() - 0.5) * shakeIntensity;
  }

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // 1. STARFIELD SIMULATION
  ctx.fillStyle = '#ffffff';
  const speed = t >= 4.2 ? 60 : 3; // Warp speed streaks during jump
  stars.forEach((star) => {
    star.z -= speed;
    if (star.z <= 0) {
      star.z = 1000;
      star.x = (Math.random() - 0.5) * w * 2;
      star.y = (Math.random() - 0.5) * h * 2;
    }
    const k = 400 / star.z;
    const px = star.x * k + cx;
    const py = star.y * k + cy;

    if (px >= 0 && px < w && py >= 0 && py < h) {
      if (t >= 4.2) {
        // Hyperspace light streaks
        const streakLength = (400 / star.z) * 15;
        ctx.strokeStyle = 'rgba(180, 220, 255, 0.7)';
        ctx.lineWidth = star.size * k;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + (px - cx) * 0.15, py + (py - cy) * 0.15);
        ctx.stroke();
      } else {
        const starBrightness = Math.min(1, Math.max(0.2, (1000 - star.z) / 800));
        ctx.fillStyle = `rgba(220, 235, 255, ${starBrightness})`;
        ctx.beginPath();
        ctx.arc(px, py, star.size * k, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // 2. KEPLER UNSTABLE STAR (In Front of Viewport)
  // Glows and intensifies dramatically in seconds 2.5 to 4.5
  const starScale = 1 + (t / 5) * 0.5;
  const starRadius = 240 * starScale;
  const starGradient = ctx.createRadialGradient(cx, cy, 20, cx, cy, starRadius * 2);
  starGradient.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
  starGradient.addColorStop(0.3, 'rgba(255, 140, 40, 0.7)');
  starGradient.addColorStop(0.7, 'rgba(240, 60, 20, 0.35)');
  starGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = starGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, starRadius * 2, 0, Math.PI * 2);
  ctx.fill();

  // 3. EMERGENCY ALARM LIGHTING (Seconds 1.0 to 4.2)
  if (t >= 1.0 && t < 4.2) {
    const pulse = Math.sin(t * 8) * 0.5 + 0.5; // Strobe effect
    ctx.fillStyle = `rgba(225, 29, 72, ${pulse * 0.28})`;
    ctx.fillRect(0, 0, w, h);
  }

  // 4. SCI-FI COCKPIT FRAMEWORK & CANOPY STRUTS
  drawCockpitArchitecture(ctx, w, h, t, config.style);

  // 5. COMMANDER VISUAL INTEGRATION (Seconds 1.8 to 4.3)
  if (t >= 1.8 && t < 4.3) {
    drawCommanderSeatAndUser(ctx, w, h, t, userImg, participantName, config);
  }

  // 6. HOLOGRAPHIC TELEMETRY HUD & EMERGENCY WARNINGS
  drawHolographicTelemetry(ctx, w, h, t, config);

  // 7. COUNTDOWN & CLIMAX (Seconds 3.0 to 4.2)
  if (t >= 3.0 && t < 4.2) {
    drawCinematicCountdown(ctx, cx, cy, t);
  }

  // 8. HYPERSPACE JUMP & TITLE REVEAL (Seconds 4.2 to 5.0)
  if (t >= 4.2) {
    drawHyperspaceFlashAndTitle(ctx, w, h, t, participantName, config);
  }

  ctx.restore();
}

function drawCockpitArchitecture(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  style: CommanderStyle
) {
  // Canopy frame color
  const metalColor = style === 'futuristic' ? '#0f172a' : '#1e293b';
  const highlightColor = style === 'futuristic' ? '#38bdf8' : '#f59e0b';

  // Left & Right Structural Struts
  ctx.fillStyle = metalColor;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;

  // Left Pillar
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(340, 0);
  ctx.lineTo(240, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Pillar
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w - 340, 0);
  ctx.lineTo(w - 240, h);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top Canopy Arch
  ctx.beginPath();
  ctx.moveTo(280, 0);
  ctx.lineTo(w - 280, 0);
  ctx.lineTo(w - 420, 110);
  ctx.lineTo(420, 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bottom Command Console Deck
  ctx.fillStyle = '#090d16';
  ctx.strokeStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(180, h);
  ctx.lineTo(360, h - 220);
  ctx.lineTo(w - 360, h - 220);
  ctx.lineTo(w - 180, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Canopy Glass Reflection & Vignette
  const vignette = ctx.createRadialGradient(w / 2, h / 2, 300, w / 2, h / 2, 900);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.7, 'rgba(4, 9, 20, 0.4)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawCommanderSeatAndUser(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  userImg: HTMLImageElement | null,
  participantName: string,
  config: CustomizationConfig
) {
  const commanderCenterX = w / 2;
  const commanderCenterY = h / 2 + 60;
  const headRadius = 145;

  // Alpha fade in from 1.8 to 2.2
  const alpha = Math.min(1, (t - 1.8) / 0.4);
  ctx.save();
  ctx.globalAlpha = alpha;

  // Commander Command Chair Backrest
  ctx.fillStyle = config.style === 'futuristic' ? '#090d16' : '#0f172a';
  ctx.strokeStyle = config.style === 'futuristic' ? '#38bdf8' : '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(commanderCenterX, commanderCenterY + 40, 220, 260, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pilot Suit Shoulders & Collar
  ctx.fillStyle = config.style === 'futuristic' ? '#1e293b' : '#1e3a8a';
  ctx.beginPath();
  ctx.moveTo(commanderCenterX - 220, h - 80);
  ctx.quadraticCurveTo(commanderCenterX - 140, commanderCenterY + 120, commanderCenterX - 90, commanderCenterY + 100);
  ctx.lineTo(commanderCenterX + 90, commanderCenterY + 100);
  ctx.quadraticCurveTo(commanderCenterX + 140, commanderCenterY + 120, commanderCenterX + 220, h - 80);
  ctx.closePath();
  ctx.fill();

  // Suit Collar Accent / Insignia
  ctx.strokeStyle = config.style === 'futuristic' ? '#f59e0b' : '#38bdf8';
  ctx.lineWidth = 5;
  ctx.stroke();

  // User Portrait inside Cinematic Helmet / Headrest Ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(commanderCenterX, commanderCenterY - 30, headRadius, 0, Math.PI * 2);
  ctx.clip();

  if (userImg) {
    // Draw user photograph scaled and centered
    const aspect = userImg.width / userImg.height;
    const drawWidth = headRadius * 2 * Math.max(1, aspect);
    const drawHeight = (headRadius * 2) / Math.min(1, aspect);
    ctx.drawImage(
      userImg,
      commanderCenterX - drawWidth / 2,
      commanderCenterY - 30 - drawHeight / 2,
      drawWidth,
      drawHeight
    );
  } else {
    // Stylized default astronaut silhouette if no photo
    ctx.fillStyle = '#334155';
    ctx.fillRect(commanderCenterX - headRadius, commanderCenterY - 30 - headRadius, headRadius * 2, headRadius * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('COMANDANTE', commanderCenterX, commanderCenterY - 20);
  }

  // Cinematic color grading overlay on face
  const faceGrade = ctx.createLinearGradient(0, commanderCenterY - 170, 0, commanderCenterY + 120);
  if (config.style === 'futuristic') {
    faceGrade.addColorStop(0, 'rgba(56, 189, 248, 0.15)'); // Cyan top light
    faceGrade.addColorStop(1, 'rgba(245, 158, 11, 0.25)'); // Amber console glow
  } else {
    faceGrade.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    faceGrade.addColorStop(1, 'rgba(30, 58, 138, 0.3)'); // Classic navy blue reflection
  }
  ctx.fillStyle = faceGrade;
  ctx.fillRect(commanderCenterX - headRadius, commanderCenterY - 30 - headRadius, headRadius * 2, headRadius * 2);

  ctx.restore();

  // Holographic Visor Ring / HUD around head
  ctx.strokeStyle = config.style === 'futuristic' ? '#f59e0b' : '#38bdf8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(commanderCenterX, commanderCenterY - 30, headRadius + 6, 0, Math.PI * 2);
  ctx.stroke();

  // Neural Telemetry Reticle Arc (spinning)
  const rotAngle = t * 3;
  ctx.strokeStyle = config.style === 'futuristic' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(56, 189, 248, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(commanderCenterX, commanderCenterY - 30, headRadius + 20, rotAngle, rotAngle + Math.PI * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(commanderCenterX, commanderCenterY - 30, headRadius + 20, rotAngle + Math.PI, rotAngle + Math.PI * 1.6);
  ctx.stroke();

  // Name Badge Console Banner
  ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
  ctx.strokeStyle = config.style === 'futuristic' ? '#f59e0b' : '#38bdf8';
  ctx.lineWidth = 1.5;
  const badgeWidth = 420;
  const badgeHeight = 44;
  ctx.fillRect(commanderCenterX - badgeWidth / 2, commanderCenterY + 115, badgeWidth, badgeHeight);
  ctx.strokeRect(commanderCenterX - badgeWidth / 2, commanderCenterY + 115, badgeWidth, badgeHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '2px';
  ctx.fillText(`CMD. ${participantName.toUpperCase()} · KEPLER-ONE`, commanderCenterX, commanderCenterY + 143);

  ctx.restore();
}

function drawHolographicTelemetry(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  config: CustomizationConfig
) {
  const isFuturistic = config.style === 'futuristic';
  const hudColor = isFuturistic ? '#f59e0b' : '#38bdf8';
  const hudFaint = isFuturistic ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.4)';

  ctx.save();
  ctx.font = '14px monospace';
  ctx.fillStyle = hudColor;
  ctx.strokeStyle = hudColor;

  // Left Hologram Panel
  const lx = 370;
  const ly = 160;
  ctx.strokeRect(lx, ly, 260, 160);
  ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
  ctx.fillRect(lx, ly, 260, 160);

  ctx.fillStyle = hudColor;
  ctx.fillText('// KEPLER-452 RADIAL DECAY', lx + 15, ly + 30);
  ctx.fillStyle = t >= 1.0 ? '#ef4444' : '#10b981';
  ctx.fillText(t >= 1.0 ? 'CRITICAL FLARE DETECTED' : 'CORE FLUX: STABLE', lx + 15, ly + 55);

  ctx.fillStyle = hudColor;
  ctx.fillText(`GRAV FIELD: ${(3.4 + t * 0.8).toFixed(2)} Gs`, lx + 15, ly + 85);
  ctx.fillText(`HULL TEMP: ${(3800 + t * 900).toFixed(0)} K`, lx + 15, ly + 110);
  ctx.fillText(`WARP DRIVE: ${t >= 3.0 ? 'CHARGED 100%' : 'CHARGING ' + Math.min(100, Math.floor(t * 30)) + '%'}`, lx + 15, ly + 135);

  // Right Hologram Panel (Status & Trajectory)
  const rx = w - 630;
  const ry = 160;
  ctx.strokeRect(rx, ry, 260, 160);
  ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
  ctx.fillRect(rx, ry, 260, 160);

  ctx.fillStyle = hudColor;
  ctx.fillText('// EMERGENCY PROTOCOL 9', rx + 15, ry + 30);

  if (config.alternateEnding === 'mystery') {
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('UNKNOWN BEACON CAPTURED', rx + 15, ry + 55);
    ctx.fillStyle = hudColor;
    ctx.fillText('FREQ: 1420.405 MHz', rx + 15, ry + 85);
    ctx.fillText('ORIGIN: DEEP INTERSTELLAR', rx + 15, ry + 110);
  } else {
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('FLEET ESCAPE VECTOR: LOCKED', rx + 15, ry + 55);
    ctx.fillStyle = hudColor;
    ctx.fillText('VECTOR: SUB-SPACE 7', rx + 15, ry + 85);
    ctx.fillText('TARGET: COLONIAL CITADEL', rx + 15, ry + 110);
  }

  // Top Warning Banner (Seconds 1.0 to 4.2)
  if (t >= 1.0 && t < 4.2) {
    const pulse = Math.sin(t * 10) > 0;
    if (pulse) {
      ctx.fillStyle = 'rgba(225, 29, 72, 0.9)';
      ctx.fillRect(w / 2 - 300, 30, 600, 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ ALERTA DE EVACUACIÓN ESTELAR ⚠', w / 2, 62);
    }
  }

  ctx.restore();
}

function drawCinematicCountdown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  t: number
) {
  // Between 3.0 and 4.2 seconds: countdown 03, 02, 01
  let countdownNum = '03';
  if (t >= 3.4 && t < 3.8) countdownNum = '02';
  else if (t >= 3.8) countdownNum = '01';

  ctx.save();
  ctx.font = 'bold 120px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
  ctx.shadowBlur = 30;

  ctx.fillText(countdownNum, cx, cy - 200);

  ctx.font = 'bold 22px monospace';
  ctx.letterSpacing = '4px';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SALTO HIPERESPACIAL INMINENTE', cx, cy - 140);
  ctx.restore();
}

function drawHyperspaceFlashAndTitle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  participantName: string,
  config: CustomizationConfig
) {
  // Warp flash between 4.2 and 4.45
  if (t < 4.5) {
    const flashAlpha = 1 - (t - 4.2) / 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, flashAlpha * 0.95)})`;
    ctx.fillRect(0, 0, w, h);
  }

  // End Title Card between 4.45 and 5.0
  if (t >= 4.45) {
    const cardAlpha = Math.min(1, (t - 4.45) / 0.25);
    ctx.save();
    ctx.globalAlpha = cardAlpha;

    // Dark sleek background
    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, w, h);

    // Vignette & subtle particle glow
    const g = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, 800);
    g.addColorStop(0, 'rgba(30, 58, 138, 0.35)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Title: ACTORSELF
    ctx.font = '900 84px serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
    ctx.shadowBlur = 40;
    ctx.fillText('ACTORSELF', w / 2, h / 2 - 40);

    // Gold / Cyan divider
    ctx.strokeStyle = config.style === 'futuristic' ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 240, h / 2 - 10);
    ctx.lineTo(w / 2 + 240, h / 2 - 10);
    ctx.stroke();

    // Mission Statement: TU HISTORIA COMIENZA AQUÍ.
    ctx.font = 'bold 36px monospace';
    ctx.letterSpacing = '6px';
    ctx.fillStyle = '#f8fafc';
    ctx.shadowBlur = 20;
    ctx.fillText('TU HISTORIA COMIENZA AQUÍ.', w / 2, h / 2 + 50);

    // Participant Attribution
    ctx.font = '18px monospace';
    ctx.letterSpacing = '2px';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText(`PROTAGONISTA: ${participantName.toUpperCase()} · ÚLTIMA LUZ DE KEPLER`, w / 2, h / 2 + 110);

    ctx.restore();
  }
}

// Synthesize authentic cinematic soundscape using Web Audio API
function setupCinematicAudio(
  audioCtx: AudioContext,
  destination: MediaStreamAudioDestinationNode,
  ending: AlternateClimax
) {
  const now = audioCtx.currentTime;

  // 1. Deep Space Sub-Drone (0.0 to 4.3s)
  const droneOsc = audioCtx.createOscillator();
  const droneGain = audioCtx.createGain();
  droneOsc.type = 'sawtooth';
  droneOsc.frequency.setValueAtTime(55, now);
  droneOsc.frequency.exponentialRampToValueAtTime(75, now + 4.2);

  const droneFilter = audioCtx.createBiquadFilter();
  droneFilter.type = 'lowpass';
  droneFilter.frequency.setValueAtTime(140, now);

  droneGain.gain.setValueAtTime(0.3, now);
  droneGain.gain.exponentialRampToValueAtTime(0.01, now + 4.4);

  droneOsc.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(destination);

  droneOsc.start(now);
  droneOsc.stop(now + 4.5);

  // 2. Emergency Klaxon Alarm (1.0 to 3.8s)
  const alarmGain = audioCtx.createGain();
  alarmGain.gain.setValueAtTime(0, now);
  alarmGain.connect(destination);

  for (let s = 1.0; s < 3.8; s += 0.5) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now + s);
    osc.frequency.linearRampToValueAtTime(620, now + s + 0.3);

    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.2, now + s);
    g.gain.linearRampToValueAtTime(0.01, now + s + 0.35);

    osc.connect(g);
    g.connect(destination);

    osc.start(now + s);
    osc.stop(now + s + 0.4);
  }

  // 3. Countdown Beeps (3.0s, 3.4s, 3.8s)
  [3.0, 3.4, 3.8].forEach((timeOffset, idx) => {
    const beepOsc = audioCtx.createOscillator();
    const beepGain = audioCtx.createGain();
    beepOsc.type = 'sine';
    beepOsc.frequency.setValueAtTime(1200 + idx * 200, now + timeOffset);

    beepGain.gain.setValueAtTime(0.25, now + timeOffset);
    beepGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.15);

    beepOsc.connect(beepGain);
    beepGain.connect(destination);

    beepOsc.start(now + timeOffset);
    beepOsc.stop(now + timeOffset + 0.18);
  });

  // 4. Warp Jump Explosion & Shimmer Sweep (4.2s to 5.0s)
  const warpNoise = audioCtx.createBufferSource();
  const bufferSize = audioCtx.sampleRate * 1.0;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  warpNoise.buffer = noiseBuffer;

  const warpFilter = audioCtx.createBiquadFilter();
  warpFilter.type = 'lowpass';
  warpFilter.frequency.setValueAtTime(3000, now + 4.2);
  warpFilter.frequency.exponentialRampToValueAtTime(80, now + 5.0);

  const warpGain = audioCtx.createGain();
  warpGain.gain.setValueAtTime(0.5, now + 4.2);
  warpGain.gain.exponentialRampToValueAtTime(0.01, now + 5.0);

  warpNoise.connect(warpFilter);
  warpFilter.connect(warpGain);
  warpGain.connect(destination);

  warpNoise.start(now + 4.2);
  warpNoise.stop(now + 5.0);
}
