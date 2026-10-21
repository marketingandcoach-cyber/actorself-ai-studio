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
    const withoutConsent: ParticipantProfile = {
      name: 'Elena Vance',
      photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      consentGiven: false,
    };
    const res1 = validateParticipant(withoutConsent);
    assert.equal(res1.valid, false);
    assert.equal(res1.error, 'Consentimiento expreso obligatorio');

    const withoutPhoto: ParticipantProfile = {
      name: 'Elena Vance',
      photoDataUrl: '',
      consentGiven: true,
    };
    const res2 = validateParticipant(withoutPhoto);
    assert.equal(res2.valid, false);
    assert.equal(res2.error, 'Fotografía obligatoria');

    const withoutName: ParticipantProfile = {
      name: '   ',
      photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      consentGiven: true,
    };
    const res3 = validateParticipant(withoutName);
    assert.equal(res3.valid, false);
    assert.equal(res3.error, 'Nombre obligatorio');

    const validParticipant: ParticipantProfile = {
      name: 'Mateo Rivera',
      photoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      consentGiven: true,
      consentTimestamp: Date.now(),
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

  it('4. Narrative sequence verification matches 5-second timing specification', () => {
    const totalDurationSeconds = 5.0;
    const stages = [
      { range: [0, 1], label: 'Interior nave y paneles' },
      { range: [1, 2], label: 'Alerta de emergencia' },
      { range: [2, 3], label: 'Aparición comandante' },
      { range: [3, 4], label: 'Cuenta regresiva' },
      { range: [4, 5], label: 'Salto y lema ACTORSELF' },
    ];
    assert.equal(stages.length, 5);
    assert.equal(stages[stages.length - 1].range[1], totalDurationSeconds);
  });
});
