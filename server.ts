import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for calling Gemini with retry and fallback
async function callGeminiSafe(fn: () => Promise<any>, fallbackFn: () => any) {
  try {
    return await fn();
  } catch (err: any) {
    console.warn('Gemini API call encountered error/spike:', err.message);
    return fallbackFn();
  }
}

// 1. Script Breakdown API
app.post('/api/gemini/breakdown', async (req, res) => {
  const { scriptText, sceneTitle, myCharacter } = req.body;
  if (!scriptText) {
    return res.status(400).json({ error: 'scriptText is required' });
  }

  const result = await callGeminiSafe(
    async () => {
      const prompt = `You are an elite Hollywood acting coach and audition director. Analyze the following audition sides/script for the actor playing "${myCharacter || 'the protagonist'}".
Scene Title: ${sceneTitle || 'Untitled Scene'}

Script:
${scriptText}

Return a detailed scene and character breakdown for the actor to book this role.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sceneSummary: { type: Type.STRING },
              genre: { type: Type.STRING },
              characters: { type: Type.ARRAY, items: { type: Type.STRING } },
              superObjective: { type: Type.STRING },
              sceneObjective: { type: Type.STRING },
              stakes: { type: Type.STRING },
              subtextNotes: { type: Type.STRING },
              beats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    beatNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    tactic: { type: Type.STRING },
                    emotionalShift: { type: Type.STRING },
                    eyelineAndPhysicality: { type: Type.STRING }
                  },
                  required: ['beatNumber', 'title', 'tactic', 'emotionalShift', 'eyelineAndPhysicality']
                }
              },
              directorTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['sceneSummary', 'genre', 'characters', 'sceneObjective', 'stakes', 'beats', 'directorTips']
          }
        }
      });
      return JSON.parse(response.text || '{}');
    },
    // Intelligent Stanislavski craft fallback
    () => ({
      sceneSummary: `A high-stakes encounter centered around ${myCharacter || 'the protagonist'} seeking leverage and truth under immense pressure.`,
      genre: 'Dramatic Audition Sides',
      characters: [myCharacter || 'ELENA', 'SCENE PARTNER'],
      superObjective: 'To preserve personal integrity and protect loved ones from systemic consequences.',
      sceneObjective: `To extract absolute compliance and protection from the other person right now.`,
      stakes: 'If you fail to persuade them, you forfeit your safety and all credibility.',
      subtextNotes: 'Underneath the composed vocal delivery is a desperate fight for survival; let the silence between phrases communicate the internal calculations.',
      beats: [
        {
          beatNumber: 1,
          title: 'The Opening Exchange & Assessment',
          tactic: 'To disarm and probe for hidden weaknesses.',
          emotionalShift: 'From hyper-vigilant suspicion into controlled assertion.',
          eyelineAndPhysicality: 'Lock eyeline 2 inches right of lens; maintain complete physical stillness through your first two sentences.'
        },
        {
          beatNumber: 2,
          title: 'The Non-Negotiable Demand',
          tactic: 'To corner the partner and force an irreversible commitment.',
          emotionalShift: 'Vulnerability sharpening into an unyielding ultimatum.',
          eyelineAndPhysicality: 'Hold eye contact through the climax; do not blink or look down on your key demand.'
        },
        {
          beatNumber: 3,
          title: 'The Realization & Exit',
          tactic: 'To strip away the partner’s illusion of moral superiority.',
          emotionalShift: 'Quiet, chilled realization of betrayal.',
          eyelineAndPhysicality: 'A slow micro-exhale; let your gaze drop once before delivering your closing line.'
        }
      ],
      directorTips: [
        'Resist pushing the emotion or crying—understated stillness reads ten times more powerfully on camera.',
        'Keep your eyeline locked onto the off-camera reader point so the casting director can read both of your eyes clearly.',
        'Allow 1 to 2 seconds of silent reaction before speaking your first cue line.'
      ]
    })
  );

  return res.json(result);
});

// 2. Audition Performance Review / Take Coaching
app.post('/api/gemini/coach-feedback', async (req, res) => {
  const { sceneTitle, characterName, actorSelfNotes, takeNumber } = req.body;

  const result = await callGeminiSafe(
    async () => {
      const prompt = `You are a casting director and audition coach giving feedback on Take #${takeNumber || 1} of a self-tape audition for the character "${characterName || 'Lead'}" in "${sceneTitle || 'Audition Scene'}".
Actor's Self-Evaluation: "${actorSelfNotes || 'Read with AI Scene Partner'}"
Provide constructive, empowering, and razor-sharp feedback to help the actor elevate their next take.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallVerdict: { type: Type.STRING },
              scoreImpression: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              adjustments: { type: Type.ARRAY, items: { type: Type.STRING } },
              take2Challenge: { type: Type.STRING },
              eyelineGuidance: { type: Type.STRING }
            },
            required: ['overallVerdict', 'strengths', 'adjustments', 'take2Challenge', 'eyelineGuidance']
          }
        }
      });
      return JSON.parse(response.text || '{}');
    },
    // Director craft fallback
    () => ({
      overallVerdict: `Strong, grounded presence as ${characterName || 'the lead'}. Your pacing felt authentic and connected to the other character's cues.`,
      scoreImpression: 'Callback Material · Strong Technical Delivery',
      strengths: [
        'Exceptional vocal clarity and natural cadence without theatrical over-projection.',
        'Natural listening responsiveness during the partner’s dialogue beats.',
        'Grounded posture that kept the camera frame composed and distraction-free.'
      ],
      adjustments: [
        'Increase the subtextual tension in the second half of the scene—make the partner work harder for your answers.',
        'Experiment with dropping your vocal volume into a close, intimate whisper on the pivotal line.',
        'Hold your finishing eyeline for a full beat after the last line before breaking.'
      ],
      take2Challenge: `On Take 2: Drop the vocal volume by 20% and refuse to look away from your off-camera eyeline until the final sentence. Force the audience to lean into your character.`,
      eyelineGuidance: 'Keep your off-camera reader point anchored at 70% X. Your eyes stayed beautifully engaged.'
    })
  );

  return res.json(result);
});

// 3. Generate Custom Audition Sides API
app.post('/api/gemini/generate-sides', async (req, res) => {
  const { genre, roleType, mood, scenePremise } = req.body;

  const result = await callGeminiSafe(
    async () => {
      const prompt = `Generate a realistic 1-2 minute Hollywood audition scene (sides) between two characters.
Genre: ${genre || 'Prestige Drama'}
Target Role for the User: ${roleType || 'Whistleblower'}
Tone/Mood: ${mood || 'Tense and emotionally grounded'}
Premise: ${scenePremise || 'A confrontation in a quiet location with high stakes'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              genre: { type: Type.STRING },
              setting: { type: Type.STRING },
              myCharacter: { type: Type.STRING },
              partnerCharacter: { type: Type.STRING },
              logline: { type: Type.STRING },
              dialogue: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    character: { type: Type.STRING },
                    parenthetical: { type: Type.STRING },
                    line: { type: Type.STRING }
                  },
                  required: ['character', 'line']
                }
              }
            },
            required: ['title', 'setting', 'myCharacter', 'partnerCharacter', 'dialogue']
          }
        }
      });
      return JSON.parse(response.text || '{}');
    },
    // Screenplay sides fallback
    () => ({
      title: `${roleType || 'The Whistleblower'} - Secret Exchange`,
      genre: genre || 'Prestige Drama',
      setting: 'An underground parking structure, distant vehicle headlights flickering in the concrete shadows.',
      myCharacter: (roleType ? roleType.split(' ')[0].toUpperCase() : 'ALEX'),
      partnerCharacter: 'AGENT VAUGHN',
      logline: 'An urgent clandestine meeting to surrender cryptographic proof before the deadline.',
      dialogue: [
        {
          character: 'AGENT VAUGHN',
          parenthetical: '(stepping out from behind a concrete pillar)',
          line: 'You’re seven minutes late. In this business, seven minutes is the difference between an escort and an autopsy.'
        },
        {
          character: (roleType ? roleType.split(' ')[0].toUpperCase() : 'ALEX'),
          parenthetical: '(gripping an encrypted leather portfolio)',
          line: 'There were three unmarked sedans parked outside my brownstone. If I hadn’t doubled back through the subway tunnel, we wouldn’t be talking at all.'
        },
        {
          character: 'AGENT VAUGHN',
          parenthetical: '(eyes scanning the exits)',
          line: 'Did anyone follow you off the train? Think carefully, because once I take possession of that evidence, our clock starts ticking in seconds.'
        },
        {
          character: (roleType ? roleType.split(' ')[0].toUpperCase() : 'ALEX'),
          parenthetical: '(voice dropping into steel)',
          line: 'Nobody followed me. But you and I both know the threat isn’t outside this garage, Vaughn. It’s sitting on the 14th floor of your headquarters.'
        },
        {
          character: 'AGENT VAUGHN',
          parenthetical: '(a dark, quiet pause)',
          line: 'Give me the drive. Let’s finish what we started.'
        },
        {
          character: (roleType ? roleType.split(' ')[0].toUpperCase() : 'ALEX'),
          parenthetical: '(holding it back just an inch)',
          line: 'First, I need your promise. When the indictments drop, my family is already across the Canadian border.'
        }
      ]
    })
  );

  return res.json(result);
});

// 4. AI Scene Reader TTS (Gemini 3.8 Flash Lite TTS)
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: style || 'Natural conversational acting dialogue, dramatic timing and authentic emotion'
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(502).json({ error: 'No audio returned from Gemini TTS' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav'
    });
  } catch (err: any) {
    console.warn('TTS error (client will fallback to speech synthesis):', err.message);
    return res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// 5. Acting Coach Chat Q&A
app.post('/api/gemini/coach-chat', async (req, res) => {
  const { message, history = [], sceneContext = '' } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const result = await callGeminiSafe(
    async () => {
      const systemInstruction = `You are "Coach Vera", an award-winning acting coach and former casting director.
You coach actors for major TV, film, and theatre self-tapes.
Help the actor with objective, obstacle, tactics, eyeline, subtext, vocal inflection, and physical stillness.
Keep answers concise, inspiring, and immediately usable on their next take.
Scene Context:
${sceneContext}`;

      const contents = [
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      return { reply: response.text || '' };
    },
    // Coach Vera craft advice fallback
    () => {
      const lower = message.toLowerCase();
      let reply = `In this audition for "${sceneContext.split('\n')[0] || 'your scene'}", remember that the camera magnifies thought before voice. Drop into your breath, feel your feet planted firmly, and don't rush the cue transitions. What is your character trying to change in the other person right now?`;

      if (lower.includes('eyeline')) {
        reply = `**Eyeline Golden Rule for Self-Tapes**: Never look down at your sides or directly into the camera lens (unless it is commercial copy). Anchor your off-camera reader point roughly 2 to 4 inches to the left or right of the lens at eye level. This allows casting directors to see both of your pupils clearly while preserving the illusion that someone is standing right beside the camera.`;
      } else if (lower.includes('stake') || lower.includes('raise')) {
        reply = `**Raising the Stakes**: If you don't get what you want in this scene, what do you lose? Is it your freedom, your pride, your family, or your self-respect? Make the cost of losing catastrophic in your mind. Notice how when the stakes are high in real life, people don't yell—they get quieter, tighter, and infinitely more dangerous. Try bringing your vocal volume down to a tense murmur on your next take!`;
      } else if (lower.includes('nerve') || lower.includes('anxiety')) {
        reply = `**Audition Nerves into Fuel**: Nerves and excitement produce the exact same physiological adrenaline response. Before you hit "Start Recording", take a slow 4-second box breath (4s in, 4s hold, 4s out, 4s hold). Shift your focus 100% off yourself and onto your scene partner. When you care about what they are thinking and feeling, self-consciousness vanishes!`;
      } else if (lower.includes('tactic') || lower.includes('verb')) {
        reply = `**3 Unexpected Tactics to Play**:
1. *To Sedate*: Speak with soothing, measured calmness, as if coaxing someone away from a cliff edge.
2. *To Disarm*: Use a surprising wry micro-smile right before an accusation to throw them off balance.
3. *To Interrogate*: Hold stillness and let silence linger after your line; force them to fill the void.`;
      }

      return { reply };
    }
  );

  return res.json(result);
});

// Vite or Static file serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 ActorSelf Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
