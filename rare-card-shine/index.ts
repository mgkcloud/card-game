import shader from './shaders.wgsl?raw';
import { initHDRCanvas } from './utils';
import { setupSensors, getLightDir } from './sensor';

const rainbowTexSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAIAAAC+O+cgAAAACXBIWXMAAAPoAAAD6AG1e1JrAAABxUlEQVR4nBXPAUYgAAAAwZUkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSUqSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJHtufjAIBmEoRmA0xmEipmA6ZmEuFmAxlmEl1mA9NmErdmA39uEgjuA4TuEsLuAyruEm7uA+HuEpXuA13uEjvuA7fuEvf/ItH/IqT3IvN3IpZ3IsB7IrW7IuK7IoczItEzIqQ9IvPdIpbdIsDVIrVVIuJVIoeZItGZIqSRIvMRIpYRIsAf//gRiC4RiFsZiAyZiGmZiD+ViEpViB1ViHjdiC7diFvTiAwziGkziD87iEq7iB27iHh3iC53iFt/iAz/iGn/iD8iOf8ibP8iC3ciXnciKHsifbsiGrsiTzMiOTMibDMiC90iXt0iKNUifVUiGlUiT5kiOZkibJkiCxEiXhEiKBBmAwhmEkxmA8JmEqZmA25mEhlmA5VmEtNmAztmEn9mA/DuEoTuA0zuEiruA6buEuHuAxnuEl3uA9PuErfuA3/v3//8qXvMuLPMqdXMuFnMqR7MuObMqaLMuCzMqUjMuIDEqfdEuHtEqT1EuNVEqZFEuB5EqWpEuKJEqcREuEhErQP+YUfpEEQfLvAAAAAElFTkSuQmCC';

interface CardContext {
  device: GPUDevice;
  context: GPUCanvasContext;
  pipeline: GPURenderPipeline;
  uniformBuffer: GPUBuffer;
  bindGroup: GPUBindGroup;
  baseTexture: GPUTexture;
  baseSampler: GPUSampler;
}

type Fallback = { draw: (light: Float32Array, intensity: number) => void };

async function createCardPipeline(canvas: HTMLCanvasElement, img: HTMLImageElement): Promise<CardContext | Fallback> {
  const hdr = await initHDRCanvas(canvas, img, rainbowTexSrc);
  if (!(hdr as any).device) {
    // fallback path
    return hdr as Fallback;
  }
  const { device, context } = hdr as { device: GPUDevice; context: GPUCanvasContext };

  device.pushErrorScope('validation');

  const module = device.createShaderModule({ code: shader });
  const pipeline = await device.createRenderPipelineAsync({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs_main' },
    fragment: { module, entryPoint: 'fs_main', targets: [{ format: 'rgba16float' }] },
    primitive: { topology: 'triangle-list' }
  });

  const uniformBuffer = device.createBuffer({
    size: 4 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
  const rainbowImg = await createImageBitmap(await fetch(rainbowTexSrc).then(r => r.blob()));
  const rainbowTex = device.createTexture({
    size: [rainbowImg.width, rainbowImg.height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
  });
  device.queue.copyExternalImageToTexture({ source: rainbowImg }, { texture: rainbowTex }, [rainbowImg.width, rainbowImg.height]);

  const baseImg = await createImageBitmap(img);
  const baseTexture = device.createTexture({
    size: [baseImg.width, baseImg.height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
  });
  device.queue.copyExternalImageToTexture({ source: baseImg }, { texture: baseTexture }, [baseImg.width, baseImg.height]);

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: rainbowTex.createView() },
      { binding: 2, resource: sampler },
      { binding: 3, resource: baseTexture.createView() },
      { binding: 4, resource: sampler }
    ]
  });

  const err = await device.popErrorScope();
  if (err) console.warn(err.message);

  return { device, context, pipeline, uniformBuffer, bindGroup, baseTexture, baseSampler: sampler };
}

function frame(ctx: CardContext, light: Float32Array, intensity: number) {
  const device = ctx.device;
  device.queue.writeBuffer(ctx.uniformBuffer, 0, light);
  device.queue.writeBuffer(ctx.uniformBuffer, 12, new Float32Array([intensity]));

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{ view: ctx.context.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store' }]
  });
  pass.setPipeline(ctx.pipeline);
  pass.setBindGroup(0, ctx.bindGroup);
  pass.draw(6);
  pass.end();
  device.queue.submit([encoder.finish()]);
}

export async function startRareShine(card: HTMLImageElement, canvas: HTMLCanvasElement, slider?: HTMLInputElement | null): Promise<() => void> {
  canvas.width = card.clientWidth;
  canvas.height = card.clientHeight;
  setupSensors(canvas);
  const ctx = await createCardPipeline(canvas, card);
  const draw = 'draw' in ctx ? ctx.draw : (light: Float32Array, i: number) => frame(ctx as CardContext, light, i);
  let intensity = slider ? parseFloat(slider.value) : 1;
  slider?.addEventListener('input', () => { intensity = parseFloat((slider as HTMLInputElement).value); });

  let handle = 0;
  function loop() {
    handle = requestAnimationFrame(loop);
    draw(getLightDir(), intensity);
  }
  loop();
  return () => cancelAnimationFrame(handle);
}

async function main() {
  const card = document.querySelector('.card') as HTMLImageElement | null;
  const canvas = document.querySelector('.rare-shine') as HTMLCanvasElement | null;
  const slider = document.getElementById('intensity') as HTMLInputElement | null;
  if (card && canvas) {
    await startRareShine(card, canvas, slider);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => { main(); });
  } else {
    main();
  }
}
