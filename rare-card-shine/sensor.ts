const lightDir = new Float32Array([0, 0, 1]);
let targetElement: HTMLElement | null = null;
let useOrientation = false;

function normalize(v: Float32Array): void {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len > 0.0001) {
    v[0] /= len; v[1] /= len; v[2] /= len;
  }
}

function update(dir: [number, number, number]): void {
  const alpha = 0.08;
  lightDir[0] = lightDir[0] * (1 - alpha) + dir[0] * alpha;
  lightDir[1] = lightDir[1] * (1 - alpha) + dir[1] * alpha;
  lightDir[2] = lightDir[2] * (1 - alpha) + dir[2] * alpha;
  normalize(lightDir);
}

function handleOrientation(e: DeviceOrientationEvent): void {
  const beta = (e.beta ?? 0) * Math.PI / 180;
  const gamma = (e.gamma ?? 0) * Math.PI / 180;
  const x = Math.sin(gamma);
  const y = -Math.sin(beta);
  const z = Math.cos(gamma) * Math.cos(beta);
  update([x, y, z]);
}

function handleMouse(ev: MouseEvent): void {
  if (!targetElement) return;
  const rect = targetElement.getBoundingClientRect();
  const x = (ev.clientX - rect.left) / rect.width - 0.5;
  const y = (ev.clientY - rect.top) / rect.height - 0.5;
  update([x, -y, 1]);
}

export function setupSensors(element: HTMLElement): void {
  targetElement = element;
  if ('DeviceOrientationEvent' in window) {
    const ask = () => {
      const perm = (DeviceOrientationEvent as any).requestPermission;
      if (typeof perm === 'function') {
        perm.call(DeviceOrientationEvent).then((res: string) => {
          if (res === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            useOrientation = true;
          }
        });
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
        useOrientation = true;
      }
      window.removeEventListener('click', ask);
    };
    window.addEventListener('click', ask, { once: true });
  }
  if (!useOrientation) {
    window.addEventListener('mousemove', handleMouse);
  }
}

export function getLightDir(): Float32Array {
  return lightDir;
}
