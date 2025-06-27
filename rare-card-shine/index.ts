import shader from './shaders.wgsl';
import { initHDRCanvas, createSDRFallback } from './utils';
import { setupSensors, getLightDir } from './sensor';

const rainbowTexSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAIAAAC+O+cgAAAACXBIWXMAAAPoAAAD6AG1e1JrAAABxUlEQVR4nBXPAUYgAAAAwZUkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSUqSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJHtufjAIBmEoRmA0xmEipmA6ZmEuFmAxlmEl1mA9NmErdmA39uEgjuA4TuEsLuAyruEm7uA+HuEpXuA13uEjvuA7fuEvf/ItH/IqT3IvN3IpZ3IsB7IrW7IuK7IoczItEzIqQ9IvPdIpbdIsDVIrVVIuJVIoeZItGZIqSRIvMRIpYRIsAf//gRiC4RiFsZiAyZiGmZiD+ViEpViB1ViHjdiC7diFvTiAwziGkziD87iEq7iB27iHh3iC53iFt/iAz/iGn/iD8iOf8ibP8iC3ciXnciKHsifbsiGrsiTzMiOTMibDMiC90iXt0iKNUifVUiGlUiT5kiOZkibJkiCxEiXhEiKBBmAwhmEkxmA8JmEqZmA25mEhlmA5VmEtNmAztmEn9mA/DuEoTuA0zuEiruA6buEuHuAxnuEl3uA9PuErfuA3/v3//8qXvMuLPMqdXMuFnMqR7MuObMqaLMuCzMqUjMuIDEqfdEuHtEqT1EuNVEqZFEuB5EqWpEuKJEqcREuEhErQP+YUfpEEQfLvAAAAAElFTkSuQmCC';

interface GPUContext {
  device: GPUDevice;
  context: GPUCanvasContext;
  pipeline: GPURenderPipeline;
  uniformBuffer: GPUBuffer;
  bindGroup: GPUBindGroup;
  baseTexture: GPUTexture;
  baseSampler: GPUSampler;
}

type Fallback = { draw: (light: Float32Array, intensity: number) => void };

async function createCardPipeline(canvas: HTMLCanvasElement, img: HTMLImageElement): Promise<GPUContext | Fallback> {
  const hdrOrFallback = await initHDRCanvas(canvas, img, rainbowTexSrc);
  if ('draw' in hdrOrFallback) {
    return hdrOrFallback;
  }
  const { device, context } = hdrOrFallback;

  device.pushErrorScope('validation');
  const shaderModule = device.createShaderModule({ code: shader });
  const pipeline = await device.createRenderPipelineAsync({
    layout: 'auto',
    vertex: { module: shaderModule, entryPoint: 'vs_main' },
    fragment: { module: shaderModule, entryPoint: 'fs_main', targets: [{ format: 'rgba16float' }] },
    primitive: { topology: 'triangle-list' },
  });

  const uniformBufferSize = 4 * 4;
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });

  // Rainbow texture
  const rainbowBitmap = await createImageBitmap(await fetch(rainbowTexSrc).then(r => r.blob()));
  const rainbowTexture = device.createTexture({
    size: [rainbowBitmap.width, rainbowBitmap.height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  device.queue.copyExternalImageToTexture({ source: rainbowBitmap }, { texture: rainbowTexture }, [rainbowBitmap.width, rainbowBitmap.height]);

  // Base texture
  const imgBitmap = await createImageBitmap(img);
  const baseTexture = device.createTexture({
    size: [imgBitmap.width, imgBitmap.height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  device.queue.copyExternalImageToTexture({ source: imgBitmap }, { texture: baseTexture }, [imgBitmap.width, imgBitmap.height]);

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: rainbowTexture.createView() },
      { binding: 2, resource: sampler },
      { binding: 3, resource: baseTexture.createView() },
      { binding: 4, resource: sampler },
    ],
  });

  const err = await device.popErrorScope();
  if (err) console.warn(err);

  return { device, context, pipeline, uniformBuffer, bindGroup, baseTexture, baseSampler: sampler };
}

function frame(ctx: GPUContext, light: Float32Array, intensity: number) {
  ctx.device.queue.writeBuffer(ctx.uniformBuffer, 0, light);
  ctx.device.queue.writeBuffer(ctx.uniformBuffer, 12, new Float32Array([intensity]));

  const encoder = ctx.device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{ view: ctx.context.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store' }],
  });
  pass.setPipeline(ctx.pipeline);
  pass.setBindGroup(0, ctx.bindGroup);
  pass.draw(6);
  pass.end();
  ctx.device.queue.submit([encoder.finish()]);
}

/**
 * Start the rare card shine effect on a given card and canvas.
 */
export async function startRareShine(
  card: HTMLImageElement,
  canvas: HTMLCanvasElement,
  slider?: HTMLInputElement | null
): Promise<() => void> {
  canvas.width = card.clientWidth;
  canvas.height = card.clientHeight;
  setupSensors(canvas);

  const ctxOrFallback = await createCardPipeline(canvas, card);

  let intensity = slider ? parseFloat(slider.value) : 1;
  slider?.addEventListener('input', () => {
    intensity = parseFloat(slider.value);
  });

  let handle = 0;
  function renderLoop() {
    handle = requestAnimationFrame(renderLoop);
    const lightDir = getLightDir();
    if ('draw' in ctxOrFallback) {
      ctxOrFallback.draw(lightDir, intensity);
    } else {
      frame(ctxOrFallback as GPUContext, lightDir, intensity);
    }
  }

  renderLoop();
  return () => cancelAnimationFrame(handle);
}

async function main() {
  const card = document.querySelector<HTMLImageElement>('.card');
  const canvas = document.querySelector<HTMLCanvasElement>('.rare-shine');
  const slider = document.querySelector<HTMLInputElement>('#intensity');
  if (card && canvas) {
    await startRareShine(card, canvas, slider);
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
