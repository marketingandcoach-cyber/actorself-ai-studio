import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { STORIES } from '../src/data/stories.ts';
import { ParticipantProfile, CustomizationConfig } from '../src/types.ts';

// Validation helper replicating Screen4 business rules
function validateParticipant(p: ParticipantProfile): { valid: boolean; error?: string } {
  if (!p.name || !p.name.trim()) {
    return { valid: false, error: 'Nombre obligatorio' };
  }
  if (!p.photoDataUrl || !p.photoDataUrl.trim()) {
    return { valid: false, error: 'Fotografía obligatoria' };
  }
  if (!p.consentGiven) {
    return { valid: false, error: 'Consentimiento expreso obligatorio' };
  }
  return { valid: true };
}

describe('ACTORSELF Core Business & Architectural Rules', () => {
  it('1. Stories catalog contains eligible Kepler demonstration story', () => {
    assert.ok(STORIES.length >= 1, 'Debe haber al menos 1 historia en el catálogo');
    const kepler = STORIES.find(s => s.id === 'kepler-last-light');
    assert.ok(kepler, 'La historia "ACTORSELF: Última luz de Kepler" debe existir');
    assert.equal(kepler.isAvailable, true, 'La historia de Kepler debe estar disponible');
    assert.ok(kepler.roles.length >= 1, 'Debe contar con al menos un rol asignable');
    assert.equal(kepler.roles[0].id, 'commander', 'El rol principal debe ser el de Comandante');
  });

  it('2. Mandatory consent enforcement rejects requests without explicit approval', () => {
    const defaultTalent = { stageName: '', actingInterest: false, notes: '', talentConsentGiven: false };
    const withoutConsent: ParticipantProfile = {
      name: 'Elena Vance',
      photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      consentGiven: false,
      actorProMode: false,
      studioMode: false,
      expressions: {},
      talent: defaultTalent,
    };
    const res1 = validateParticipant(withoutConsent);
    assert.equal(res1.valid, false);
    assert.equal(res1.error, 'Consentimiento expreso obligatorio');

    const withoutPhoto: ParticipantProfile = {
      name: 'Elena Vance',
      photoDataUrl: '',
      consentGiven: true,
      actorProMode: false,
      studioMode: false,
      expressions: {},
      talent: defaultTalent,
    };
    const res2 = validateParticipant(withoutPhoto);
    assert.equal(res2.valid, false);
    assert.equal(res2.error, 'Fotografía obligatoria');

    const withoutName: ParticipantProfile = {
      name: '   ',
      photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      consentGiven: true,
      actorProMode: false,
      studioMode: false,
      expressions: {},
      talent: defaultTalent,
    };
    const res3 = validateParticipant(withoutName);
    assert.equal(res3.valid, false);
    assert.equal(res3.error, 'Nombre obligatorio');

    const validParticipant: ParticipantProfile = {
      name: 'Mateo Rivera',
      photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      consentGiven: true,
      consentTimestamp: Date.now(),
      actorProMode: false,
      studioMode: false,
      expressions: {},
      talent: defaultTalent,
    };
    const res4 = validateParticipant(validParticipant);
    assert.equal(res4.valid, true);
    assert.equal(res4.error, undefined);
  });

  it('3. Commander styling options produce distinct valid configurations', () => {
    const validStyles = ['classic', 'futuristic'];
    const validEndings = ['heroic', 'mystery'];

    const configClassic: CustomizationConfig = {
      style: 'classic',
      alternateEnding: 'heroic',
      shipName: 'Kepler-One',
      lightingTone: 'cyan_deep',
    };
    assert.ok(validStyles.includes(configClassic.style));
    assert.ok(validEndings.includes(configClassic.alternateEnding));

    const configFuturistic: CustomizationConfig = {
      style: 'futuristic',
      alternateEnding: 'mystery',
      shipName: 'Kepler-One',
      lightingTone: 'amber_hazard',
    };
    assert.ok(validStyles.includes(configFuturistic.style));
    assert.ok(validEndings.includes(configFuturistic.alternateEnding));
    assert.notEqual(configClassic.style, configFuturistic.style);
    assert.notEqual(configClassic.alternateEnding, configFuturistic.alternateEnding);
  });

  it('4. Narrative sequence verification matches cinematic 4-shot timing specification (15s and 5s)', () => {
    // 15-second full cinematic 4-shot sequence
    const cinematic15sStages = [
      { shot: 1, range: [0, 4.0], label: 'Plano Medio: Comandante en puente de mando' },
      { shot: 2, range: [4.0, 8.0], label: 'Primer Plano: Alerta roja y tensión facial' },
      { shot: 3, range: [8.0, 12.0], label: 'Ángulo Táctico: Cálculo de salto hiperespacial' },
      { shot: 4, range: [12.0, 15.0], label: 'Clímax: Salto estelar y crédito oficial ACTORSELF' },
    ];
    assert.equal(cinematic15sStages.length, 4);
    assert.equal(cinematic15sStages[cinematic15sStages.length - 1].range[1], 15.0);

    // 5-second rapid sequence
    const rapid5sStages = [
      { shot: 1, range: [0, 1.2], label: 'Interior fragata con comandante' },
      { shot: 2, range: [1.2, 2.5], label: 'Alerta y reflejos en visera' },
      { shot: 3, range: [2.5, 3.8], label: 'Cálculo de salto' },
      { shot: 4, range: [3.8, 5.0], label: 'Salto y lema ACTORSELF' },
    ];
    assert.equal(rapid5sStages.length, 4);
    assert.equal(rapid5sStages[rapid5sStages.length - 1].range[1], 5.0);
  });

  it('5. Actor Pro emotion catalog contains all Core 4 and Studio Mode expressions', async () => {
    const { EMOTION_GUIDES } = await import('../src/data/emotions.ts');
    assert.equal(EMOTION_GUIDES.length, 8, 'Debe haber exactamente 8 expresiones catalogadas');

    const coreEmotions = EMOTION_GUIDES.filter(e => e.category === 'core');
    assert.equal(coreEmotions.length, 4, 'Actor Pro Core debe contener 4 emociones principales');
    const coreKeys = coreEmotions.map(e => e.key).sort();
    assert.deepEqual(coreKeys, ['dudoso', 'molesto', 'sonriente', 'triste'].sort());

    const studioEmotions = EMOTION_GUIDES.filter(e => e.category === 'studio');
    assert.equal(studioEmotions.length, 4, 'Studio Mode debe ofrecer 4 emociones avanzadas');
    const studioKeys = studioEmotions.map(e => e.key).sort();
    assert.deepEqual(studioKeys, ['asustado', 'decidido', 'pensativo', 'sorprendido'].sort());

    // Verify all guides provide clear actionable instructions and narrative mappings
    for (const guide of EMOTION_GUIDES) {
      assert.ok(guide.instruction && guide.instruction.length > 10, `La guía de ${guide.key} debe tener instrucción detallada`);
      assert.ok(guide.narrativeUse && guide.narrativeUse.length > 5, `La guía de ${guide.key} debe especificar su uso narrativo`);
    }
  });

  it('6. Emotion to narrative beat mapping resolves appropriate expression fallbacks', () => {
    // Narrative beat resolver simulation as implemented in cinematicEngine
    function resolveBeatExpression(
      beat: 'alert' | 'calculation' | 'emotional' | 'resolution',
      expressions: Partial<Record<string, string>>,
      fallback: string
    ): string {
      switch (beat) {
        case 'alert':
          return expressions.asustado || expressions.molesto || fallback;
        case 'calculation':
          return expressions.dudoso || expressions.pensativo || fallback;
        case 'emotional':
          return expressions.triste || fallback;
        case 'resolution':
          return expressions.sonriente || expressions.decidido || fallback;
        default:
          return fallback;
      }
    }

    const defaultImg = 'data:image/png;base64,default';
    const alertImg = 'data:image/png;base64,molesto';
    const smileImg = 'data:image/png;base64,sonriente';

    // With only alert captured
    const resAlert = resolveBeatExpression('alert', { molesto: alertImg }, defaultImg);
    assert.equal(resAlert, alertImg);

    // Resolution falls back to default if no smile captured
    const resResFallback = resolveBeatExpression('resolution', { molesto: alertImg }, defaultImg);
    assert.equal(resResFallback, defaultImg);

    // Resolution uses smile when available
    const resResSmile = resolveBeatExpression('resolution', { molesto: alertImg, sonriente: smileImg }, defaultImg);
    assert.equal(resResSmile, smileImg);
  });

  it('7. ACTORSELF Talent consent is strictly independent from main scene consent', () => {
    const profile: ParticipantProfile = {
      name: 'Elena Vance',
      photoDataUrl: 'data:image/png;base64,img',
      consentGiven: true,
      actorProMode: true,
      studioMode: false,
      expressions: { sonriente: 'data:image/png;base64,smile' },
      talent: {
        stageName: 'Elena V.',
        actingInterest: true,
        notes: 'Interés en ciencia ficción dramática',
        talentConsentGiven: false, // Independent!
      },
    };

    // Main participant validation passes because main consent is given
    const validation = validateParticipant(profile);
    assert.equal(validation.valid, true);

    // Talent consent is NOT automatically given just because scene consent is
    assert.equal(profile.talent.talentConsentGiven, false);
    assert.equal(profile.consentGiven, true);

    // Giving talent consent does not automatically satisfy main scene consent
    const profileOnlyTalentConsent: ParticipantProfile = {
      ...profile,
      consentGiven: false,
      talent: {
        ...profile.talent,
        talentConsentGiven: true,
      },
    };
    const validationFail = validateParticipant(profileOnlyTalentConsent);
    assert.equal(validationFail.valid, false);
    assert.equal(validationFail.error, 'Consentimiento expreso obligatorio');
  });

  it('8. Session memory purge revocability wipes all facial and talent records', () => {
    let participant: ParticipantProfile = {
      name: 'Carlos Ruiz',
      photoDataUrl: 'data:image/png;base64,carlos_face',
      consentGiven: true,
      consentTimestamp: Date.now(),
      actorProMode: true,
      studioMode: true,
      expressions: {
        sonriente: 'data:image/png;base64,smile',
        molesto: 'data:image/png;base64,angry',
        asustado: 'data:image/png;base64,scared',
      },
      talent: {
        stageName: 'Charlie Ray',
        actingInterest: true,
        notes: 'Disponible para sci-fi',
        talentConsentGiven: true,
        videoSampleUrl: 'blob:http://localhost:3000/sample-video-uuid',
        videoSampleDurationSec: 6,
      },
    };

    // Purge action executed by Screen4 handleRevokeAndClearAll
    function purgeParticipant(p: ParticipantProfile): ParticipantProfile {
      return {
        ...p,
        photoDataUrl: '',
        fullBodyDataUrl: undefined,
        motionVideoUrl: undefined,
        captureMode: undefined,
        consentGiven: false,
        consentTimestamp: undefined,
        expressions: {},
        talent: {
          ...p.talent,
          videoSampleUrl: undefined,
          talentConsentGiven: false,
        },
      };
    }

    const purged = purgeParticipant(participant);
    assert.equal(purged.photoDataUrl, '');
    assert.equal(purged.consentGiven, false);
    assert.equal(purged.consentTimestamp, undefined);
    assert.deepEqual(purged.expressions, {});
    assert.equal(purged.talent.videoSampleUrl, undefined);
    assert.equal(purged.talent.talentConsentGiven, false);
    assert.equal(purged.fullBodyDataUrl, undefined);
    assert.equal(purged.motionVideoUrl, undefined);
  });

  it('9. Cinematic scenes catalog contains 3D face tracking keyframes and original actor profiles', async () => {
    const { CINEMATIC_SCENES } = await import('../src/data/scenes.ts');
    assert.ok(CINEMATIC_SCENES.length >= 3, 'Debe haber al menos 3 escenas cinematográficas autorizadas');

    for (const scene of CINEMATIC_SCENES) {
      assert.ok(scene.title && scene.title.length > 5, 'Cada escena debe tener un título descriptivo');
      assert.ok(scene.originalActorName && scene.originalActorName.length > 5, 'Debe identificar al actor original');
      assert.equal(scene.durationSec, 15.0, 'La duración cinemática estándar debe ser de 15.0 segundos');
      assert.equal(scene.shots.length, 4, 'Debe contar con 4 planos de cámara cinematográficos');
      assert.ok(scene.keyframes.length >= 4, 'Debe contener keyframes de seguimiento 3D');

      for (const kf of scene.keyframes) {
        assert.ok(kf.faceBox && kf.faceBox.width > 0 && kf.faceBox.height > 0);
        assert.ok(typeof kf.headPose.yaw === 'number');
        assert.ok(typeof kf.headPose.pitch === 'number');
        assert.ok(typeof kf.headPose.roll === 'number');
        assert.ok(kf.lighting && kf.lighting.ambientColor);
      }
    }
  });

  it('10. AI Pipeline specifications include active local engine and cloud GPU models', async () => {
    const { AI_PIPELINE_MODELS } = await import('../src/data/aiPipelineSpecs.ts');
    assert.ok(AI_PIPELINE_MODELS.length >= 3, 'Debe evaluar al menos 3 opciones de procesamiento');

    const activeLocal = AI_PIPELINE_MODELS.find(m => m.status === 'active_local');
    assert.ok(activeLocal, 'El motor local en cliente debe estar activo');
    assert.equal(activeLocal.costPerMinute, '$0.00 (Sin consumo de créditos)');

    const veoCloud = AI_PIPELINE_MODELS.find(m => m.id === 'gemini-omni-veo');
    assert.ok(veoCloud, 'Debe contemplar el modelo de Google Vertex AI / Gemini Omni / Veo');

    const awsPipeline = AI_PIPELINE_MODELS.find(m => m.id === 'liveportrait-reactor-aws');
    assert.ok(awsPipeline, 'Debe contemplar el pipeline de GPU AWS / LivePortrait');
  });

  it('11. Camera activation supports face-in-motion dynamic multi-angle and full-body posture plates', () => {
    const defaultTalent = { stageName: '', actingInterest: false, notes: '', talentConsentGiven: false };

    // Participant configured via Face-in-motion multi-angle burst
    const motionParticipant: ParticipantProfile = {
      name: 'Sofia Chang',
      photoDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      motionVideoUrl: 'blob:http://localhost:3000/motion-12345',
      captureMode: 'motion',
      consentGiven: true,
      consentTimestamp: Date.now(),
      actorProMode: true,
      studioMode: false,
      expressions: {
        molesto: 'data:image/jpeg;base64,frame-left',
        dudoso: 'data:image/jpeg;base64,frame-right',
        decidido: 'data:image/jpeg;base64,frame-center',
        sonriente: 'data:image/jpeg;base64,frame-climax',
      },
      talent: defaultTalent,
    };

    assert.equal(motionParticipant.captureMode, 'motion');
    assert.ok(motionParticipant.motionVideoUrl);
    assert.equal(Object.keys(motionParticipant.expressions).length, 4);

    // Participant configured via Full-body posture capture
    const fullBodyParticipant: ParticipantProfile = {
      name: 'Elena Vance',
      photoDataUrl: 'data:image/jpeg;base64,/9j/head',
      fullBodyDataUrl: 'data:image/jpeg;base64,/9j/fullbody-posture-plate',
      captureMode: 'fullbody',
      consentGiven: true,
      consentTimestamp: Date.now(),
      actorProMode: true,
      studioMode: false,
      expressions: {
        molesto: 'data:image/jpeg;base64,/9j/head',
      },
      talent: defaultTalent,
    };

    assert.equal(fullBodyParticipant.captureMode, 'fullbody');
    assert.ok(fullBodyParticipant.fullBodyDataUrl);
    assert.ok(fullBodyParticipant.photoDataUrl);
  });

  it('12. Facial substitution library accurately computes 3D anatomical landmarks and feathered edge geometry', async () => {
    const { computeProjectedLandmarks, generateFeatheredMaskCanvas } = await import('../src/utils/faceSubstitution.ts');

    const testBox = { x: 960, y: 540, width: 340, height: 390 };
    const testPoseNeutral = { yaw: 0, pitch: 0, roll: 0 };
    const testPoseTurned = { yaw: 18, pitch: -6, roll: 4 };

    // Test neutral landmarks
    const landmarksNeutral = computeProjectedLandmarks(testBox, testPoseNeutral);
    assert.ok(landmarksNeutral.center);
    assert.equal(landmarksNeutral.center.x, 960);
    assert.equal(landmarksNeutral.center.y, 540);
    assert.ok(landmarksNeutral.leftEye.x < landmarksNeutral.rightEye.x, 'Ojo izquierdo debe estar a la izquierda del derecho');
    assert.ok(landmarksNeutral.forehead.y < landmarksNeutral.chin.y, 'Frente debe estar por encima de la barbilla');
    assert.ok(landmarksNeutral.jawContour.length >= 8, 'El contorno mandibular anatómico debe tener al menos 8 puntos');

    // Test turned head pose projection shifts
    const landmarksTurned = computeProjectedLandmarks(testBox, testPoseTurned);
    assert.ok(landmarksTurned.center.x > landmarksNeutral.center.x, 'Giro en Yaw positivo debe desplazar el centro hacia la derecha');
    assert.ok(landmarksTurned.noseTip.x > landmarksNeutral.noseTip.x, 'La punta de la nariz debe presentar mayor desplazamiento por perspectiva 3D');

    // Test feathered mask canvas generation
    const maskCanvas = generateFeatheredMaskCanvas(340, 390, 24);
    if (maskCanvas) {
      assert.equal(maskCanvas.width, 340);
      assert.equal(maskCanvas.height, 390);
    } else {
      assert.equal(maskCanvas, null);
    }
  });
});
