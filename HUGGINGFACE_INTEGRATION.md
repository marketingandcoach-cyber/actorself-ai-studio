# FaceSwap Zero integration

The catalog Face-to-Video studio now offers a remote neural face-swap panel. Select a catalog scene, upload a frontal portrait, authorize transmission to the community Hugging Face Space and generate the first five seconds at 960px maximum. Original media and the experimental local compositor remain available.

Provider: https://huggingface.co/spaces/poxvnn/faceswap-zero (community service, not operated by ACTORSELF).
Client: @gradio/client 2.7.1; /fetch_url downloads the selected public catalog scene; /swap receives the authorized portrait and scene with largest-face selection, five-second first segment and 960px maximum. Custom MP4 files are uploaded through handle_file. No token, subscription, paid hardware or persistent API secret is configured.

The provider has a free daily GPU quota, a shared queue and temporary result storage. Files leave the device only after the remote consent checkbox and Generate button are used. Do not upload confidential material. Output is linked directly from the provider and may expire. The prototype does not promise unlimited use, production privacy guarantees, or exact identity reproduction. Hair, body and clothing remain from the scene.

Verified before integration: a five-second ACTORSELF science-fiction clip was processed successfully (120 frames, 960x540, about 25 seconds GPU). Frame comparison showed face changes with partial identity similarity. Web integration verification is reported separately in the delivery; this provider-only test does not prove the deployed button works.

TypeScript and the 12 existing tests passed locally. Additional tests validate output URL restrictions, missing outputs and quota error handling. No automatic generation retry or paid fallback is implemented.
