# ACTORSELF — Alexa+ web simulation

This prototype implements the hackathon's simulated Alexa+ experience path. It is not a deployed Alexa Skill, MCP server, Amazon partner integration, or Prime Video integration. The conversational interface uses typed English/Spanish commands and deterministic intent matching, not a live Alexa model. No microphone, account linking, AWS runtime, or permanent keys are required.

## Run
Use the existing project instructions: npm install, then npm run dev. Open the displayed local URL in a Windows browser, or the existing deployed web preview. Expand “Alexa+ · ACTORSELF conversational simulator”.

## Demo sequence
1. Send “Alexa, open ACTORSELF”: opens the story picker.
2. Send “Choose Kepler”: selects that story and its protagonist role.
3. Send “Choose mystery ending”: updates the ending while retaining the chosen story.
4. Send “Status” or “My role”: reads the current context.
5. Send “Prepare my scene”: routes to the identity/consent form until consent is manually confirmed.
6. Review/upload your own photo and manually confirm consent. The assistant cannot grant consent.
7. Send “Prepare my scene” again: opens the existing scene generator. Review and use its generation button.
8. “Open scene catalog” opens the original test video catalog.

Spanish commands include “elige Niebla”, “elige Neón”, “final heroico”, “mi rol”, “estado”, “prepara mi escena” and “abre catálogo”.

The panel controls application state directly. Existing generation functionality and its limitations remain unchanged; selecting an ending does not prove generative face substitution or licensed Prime Video access. Only demonstrate results that actually work. No original assets, videos or branding are replaced.

## Product feedback / friction log
AWS OIDC setup was attempted but the account's simplified IAM console gated identity providers behind advanced features. The linked account documentation described an upgrade and removal of spending limits. The prototype therefore does not depend on AWS or claim a successful AWS integration. Windows was also incompatible with the supported Vega simulator environment; the submission uses the rules' web simulation route for Alexa+ instead.
