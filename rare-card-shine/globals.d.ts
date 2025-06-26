type GPUDevice = any;
type GPUCanvasContext = any;
type GPURenderPipeline = any;
type GPUBuffer = any;
type GPUBindGroup = any;
type GPUTexture = any;
type GPUSampler = any;
declare const GPUBufferUsage: any;
declare const GPUTextureUsage: any;

declare module '*.wgsl?raw' {
  const src: string;
  export default src;
}

interface Navigator {
  gpu?: any;
}
