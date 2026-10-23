# ACTORSELF — Cinematic Prototype (AI Studio)

**Amazon hackathon submission companion repository.** This is the audiovisual prototype developed in Google AI Studio. The related visual/UX web prototype is maintained separately at [actorself-demo](https://github.com/marketingandcoach-cyber/actorself-demo).

## Live face swap integration

The catalog studio now connects directly to FaceSwap Zero through the Gradio API. Open the live demo, explore the 11-scene test catalog, select a scene, upload a frontal portrait, authorize external processing and generate a five-second clip. Free shared GPU quota and provider availability apply; identity similarity varies. See [HUGGINGFACE_INTEGRATION.md](HUGGINGFACE_INTEGRATION.md). Deployment/browser verification is reported separately; provider-only generation has succeeded.

## Latest integration progress for judges

- Live ACTORSELF demo: https://marketingandcoach-cyber.github.io/actorself-ai-studio/
- Alexa+ interaction: typed web simulation with story commands and a consent gate; see [ALEXA_SIMULATION.md](ALEXA_SIMULATION.md).
- AKOOL neural video face swap: manual GitHub Actions pipeline added, API credential kept in repository secrets, polling and downloadable video artifact implemented. See [AKOOL_INTEGRATION.md](AKOOL_INTEGRATION.md).
- Five offline API contract/error-handling tests passed. Run `node --test scripts/akool-face-swap.test.mjs`.
- **Pending:** AKOOL credential setup, confirmation that gift credits cover API usage, and a successful live video generation. The public website upload flow is not connected to this manual pipeline yet. No photorealistic output is claimed as verified.

## What it does

The prototype provides an original fictional scene, **Última luz de Kepler**. A participant selects a character style and alternative ending, uploads a photograph or uses a camera, provides explicit consent, and creates a short **locally composed** audiovisual WebM scene with a player and download option.

**Important scope:** This implementation uses browser Canvas, Web Audio, and MediaRecorder. It is not generative AI video, photorealistic face replacement, Prime Video authentication, Amazon content integration, or Fire TV software. Future capabilities require separate engineering, access, licensing and consent.

## Reviewer access and demo

- Devpost entry: https://devpost.com/software/actorself
- Lovable UI demo: https://actorself-demo.lovable.app
- Companion UI source: https://github.com/marketingandcoach-cyber/actorself-demo
- This repository is private; reviewers must be invited by the owner to both repositories.
- The local prototype does not require an account login to follow its basic flow.

## Requirements

- Node.js 22 or later, npm, Git
- A modern browser with Canvas capture, MediaRecorder and Web Audio support (Chrome or Edge recommended)
- Permission to access the camera only if using the optional camera feature. Uploading a local photo is an alternative.
- No Google API key or paid generation quota is needed for the local Canvas demo.

## Installation and launch

```bash
git clone https://github.com/marketingandcoach-cyber/actorself-ai-studio.git
cd actorself-ai-studio
npm install
npm run dev
```

Open the local URL printed by the server (normally http://localhost:3000).

## Verification

```bash
npm run lint
npm test
npm run build
```

The GitHub Actions workflow at `.github/workflows/validate.yml` runs these checks automatically. These checks do not constitute a real-browser playback test. To verify audiovisual output, complete the user flow in a compatible browser, download the WebM file, and confirm playback, visible photo composition, sound and measured duration.

## Review flow

1. Launch the app and choose the available Kepler story and commander role.
2. Enter a participant name and upload a JPG/PNG/WebP photo (10 MB maximum), or use the camera.
3. Grant explicit consent to the photo use.
4. Choose a commander style and alternative ending.
5. Generate the locally rendered scene.
6. Play and download the WebM output. Confirm that it is nonempty and plays correctly.

The UI demo in the companion Lovable repository is a separate prototype, not a single deployed app wired to this audiovisual engine. The two codebases have not yet been integrated.

## Technical notes

- Frontend: React, TypeScript, Vite and Tailwind CSS.
- Server: Express, with informational endpoints `/api/health` and `/api/project-info`.
- Local scene engine: `src/utils/cinematicEngine.ts`.
- Browser-based audiovisual rendering depends on browser codec and device support.
- `.env.example` may list future integration settings, but the current local Canvas scene does not require a paid AI service.

## Rights, privacy, and licensing

Use only photographs you have permission to use. The current demo is built around an original fictional scene; it does not provide licensed Prime Video footage or claim an official Amazon partnership. Any future real face personalization, sharing, biometric handling or licensed movie access would require additional safeguards and authorization.

**Repository access:** Private, shared with approved hackathon reviewers. This repository is not offered under an open-source license.

ACTORSELF — Independent concept by Ruth García.


<!-- GitHub Pages: redeploy Vite production build after switching Pages source to GitHub Actions. -->
