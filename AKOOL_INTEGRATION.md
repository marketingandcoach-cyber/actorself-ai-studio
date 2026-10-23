# ACTORSELF: AKOOL video face swap

Status: manual GitHub Actions integration implemented; live generation is NOT yet validated.

Account verification on October 23, 2026: clicking Create API Credential in the signed-in Free workspace opened an upgrade modal. The displayed Pro Max plan lists Access to API. No credential was issued, no subscription was activated and no credits were consumed. Live testing is blocked by API account entitlement; the 20 gift credits alone did not unlock credential creation. This does not connect the GitHub Pages upload button to AKOOL. Existing design, scenes and local rendering remain unchanged.

## Setup

1. In AKOOL, create an API credential. Never put it in source code, browser code, chat, or a VITE_ variable.
2. In this repository, Settings → Secrets and variables → Actions, add repository secrets:
   - `AKOOL_API_KEY`: AKOOL API key.
   - `AKOOL_SOURCE_IMAGE_URL`: HTTPS URL of the authorized face image.
   - `AKOOL_TARGET_VIDEO_URL`: HTTPS URL of the authorized MP4 scene.
3. AKOOL must be able to download these URLs. Local files, blob URLs and Google Drive viewer pages will not work. Prefer short-lived direct media URLs; do not commit private photos or signed links to the public repository.
4. Verify in AKOOL that gift credits apply to the API and chosen model. The dashboard displayed 20 gift credits and Face Swap Video at 10 credits/10 seconds (minimum 10); model-specific costs and entitlement still require verification. Use a clip of at most 10 seconds for the initial test. The script does not enforce clip duration or a provider spending cap.
5. Actions → ACTORSELF - AKOOL Face Swap → Run workflow → main. Both consent and credit confirmation must be checked. This is a manual action; no push, pull request or schedule triggers generation.
6. Download the `actorself-face-swap` artifact from the completed run. It expires after one day. Inspect actual face replacement before claiming success.

No subscriptions, cards, AWS infrastructure or servers are created by this integration. AKOOL generation consumes credits. Check GitHub Actions allowances before running; do not approve paid usage. No automatic retries of submission. A timeout may leave a running AKOOL job: check the account before submitting again.

The artifact is accessible to repository users with Actions access. For personal biometric media, review access and AKOOL retention before submitting. This is a maintainer-operated demo pipeline, not a public multiuser backend. A future web integration needs authenticated server-side processing, private uploads, per-user consent, quotas and result access control.

## Verification without credits

`node --test scripts/akool-face-swap.test.mjs`

Tests use fake API responses, never live credentials or credits. They cover consent, HTTPS validation, provider rejection, queued processing and successful video result. Live credentials, free API eligibility and end-to-end quality remain pending.

## API references

- https://docs.akool.com/ai-tools-suite/faceswap/faceswap-plus
- https://docs.akool.com/ai-tools-suite/faceswap/get-result
- https://docs.akool.com/authentication/usage
