# FaceSwap Zero integration

The catalog Face-to-Video studio now offers a remote neural face-swap panel. Select a catalog scene, upload a frontal portrait, authorize transmission to the community Hugging Face Space and generate the first five seconds at 960px maximum. Original media and the experimental local compositor remain available.

Provider: https://huggingface.co/spaces/poxvnn/faceswap-zero (community service, not operated by ACTORSELF).
Client: @gradio/client 2.7.1; /fetch_url downloads the selected public catalog scene; /swap receives the authorized portrait and scene with largest-face selection, five-second first segment and 960px maximum. Custom MP4 files are uploaded through handle_file. No token, subscription, paid hardware or persistent API secret is configured.

The provider has a free daily GPU quota, a shared queue and temporary result storage. Files leave the device only after the remote consent checkbox and Generate button are used. Do not upload confidential material. Output is linked directly from the provider and may expire. The prototype does not promise unlimited use, production privacy guarantees, or exact identity reproduction. Hair, body and clothing remain from the scene.

Verified before integration: a five-second ACTORSELF science-fiction clip was processed successfully (120 frames, 960x540, about 25 seconds GPU). Frame comparison showed face changes with partial identity similarity. Web integration verification is reported separately in the delivery; this provider-only test does not prove the deployed button works.

TypeScript and the 12 existing tests passed locally. Additional tests validate output URL restrictions, missing outputs and quota error handling. No automatic generation retry or paid fallback is implemented.

## Deployed browser verification — October 23, 2026

Successfully tested from https://marketingandcoach-cyber.github.io/actorself-ai-studio/ in Chrome: selected La última misión, uploaded the authorized commander demo portrait, checked external-processing consent and clicked Generate. The application returned its generated-video confirmation, player and download link. The HTML video reported duration 5 seconds, 960x540 pixels, readyState 4 and no media error; the generated file downloaded successfully. Identity similarity remains partial. This proves the catalog's remote flow for this example, not arbitrary scene/face quality or continuous provider availability.

Live API differences handled: long_side must be numeric 960 despite the provider-generated example showing a string; Gradio may wrap the returned video inside a component update's value property. Streamed intermediate responses are allowed before the final video.
