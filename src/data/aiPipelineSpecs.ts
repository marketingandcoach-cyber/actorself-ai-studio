export interface ModelIntegrationSpec {
  id: string;
  name: string;
  provider: 'Google Vertex AI' | 'Amazon Web Services (AWS)' | 'Open Source / Self-Hosted GPU';
  category: 'Face Swapping' | 'Motion Reenactment' | 'Video Generation & Inpainting';
  status: 'active_local' | 'ready_for_cloud_deployment' | 'authorized_eval';
  latencySeconds: string;
  costPerMinute: string;
  resolution: string;
  faceTrackingType: string;
  privacyCompliance: string;
  requirements: string[];
  description: string;
}

export const AI_PIPELINE_MODELS: ModelIntegrationSpec[] = [
  {
    id: 'actorself-neural-browser',
    name: 'ACTORSELF Neural Client Engine (En Ejecución)',
    provider: 'Open Source / Self-Hosted GPU',
    category: 'Face Swapping',
    status: 'active_local',
    latencySeconds: '< 3.5 segundos (En tiempo real en navegador)',
    costPerMinute: '$0.00 (Sin consumo de créditos)',
    resolution: '1920x1080 Full HD (60 FPS)',
    faceTrackingType: 'Tracking 3D (Yaw/Pitch/Roll) + Mesh Anatómico + Iluminación Fotométrica',
    privacyCompliance: 'Máxima: Procesamiento en memoria volátil del navegador, sin subir fotos a servidores',
    requirements: ['Navegador moderno con WebGL / Canvas 2D y Web Audio API'],
    description: 'Motor de composición fotograma a fotograma que sustituye la identidad del actor original aplicando deformación de perspectiva 3D, corrección de colorimetría y capas de oclusión cinematográficas.',
  },
  {
    id: 'gemini-omni-veo',
    name: 'Google Gemini Omni / Veo Video Pipeline',
    provider: 'Google Vertex AI',
    category: 'Video Generation & Inpainting',
    status: 'ready_for_cloud_deployment',
    latencySeconds: '12 – 25 segundos por secuencia',
    costPerMinute: '~$0.18 – $0.40 por minuto generado',
    resolution: '1080p / 4K nativo',
    faceTrackingType: 'Embeddings Multimodales de Sujeto Consistente',
    privacyCompliance: 'Consentimiento explícito y retención según políticas de Google Cloud Enterprise',
    requirements: [
      'Google Cloud Project con facturación activa',
      'Vertex AI API habilitada (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`)',
      'Cuota de generación de video Veo (`gemini-omni-1.1-flash`)',
    ],
    description: 'Modelo fundacional de video de Google para generación cinematográfica con preservación de la identidad del sujeto autorizado a través de múltiples ángulos de cámara.',
  },
  {
    id: 'liveportrait-reactor-aws',
    name: 'LivePortrait + ReActor Neural Reenactment (AWS SageMaker / Cloud Run GPU)',
    provider: 'Amazon Web Services (AWS)',
    category: 'Motion Reenactment',
    status: 'authorized_eval',
    latencySeconds: '4.8 segundos en GPU NVIDIA L4 / A10G',
    costPerMinute: '~$0.04 por clip (Instancia Spot GPU g5.xlarge)',
    resolution: '1080p ProRes / WebM',
    faceTrackingType: '512-dim ArcFace Identity Embedding + 3DMM Keypoints (68 landmarks)',
    privacyCompliance: 'Zero-Storage: Procesamiento efímero en contenedor Docker presignado',
    requirements: [
      'AWS Account con cuota de instancias EC2 G5 / SageMaker Endpoint',
      'Contenedor Docker con ONNX Runtime y CUDA 12.2',
      'Integración con Amazon Prime Video MediaConvert para transcodificación HLS/DASH',
    ],
    description: 'Pipeline de intercambio facial y reenactment de alta fidelidad que transfiere con precisión submilimétrica los gestos, parpadeos y movimientos de cabeza del actor de metraje original a la foto del usuario.',
  },
];
