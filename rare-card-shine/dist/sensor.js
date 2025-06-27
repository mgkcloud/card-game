// sensor.ts
// Sensor input module: DeviceOrientationEvent on mobile, mouse on desktop
const lightDir = new Float32Array([0, 0, 1]);
let targetElement = null;
let useOrientation = false;
function normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    if (len > 0.0001) {
        v[0] /= len;
        v[1] /= len;
        v[2] /= len;
    }
}
function update(dir) {
    const alpha = 0.08;
    lightDir[0] = lightDir[0] * (1 - alpha) + dir[0] * alpha;
    lightDir[1] = lightDir[1] * (1 - alpha) + dir[1] * alpha;
    lightDir[2] = lightDir[2] * (1 - alpha) + dir[2] * alpha;
    normalize(lightDir);
}
function handleOrientation(e) {
    const beta = (e.beta ?? 0) * Math.PI / 180;
    const gamma = (e.gamma ?? 0) * Math.PI / 180;
    const x = Math.sin(gamma);
    const y = -Math.sin(beta);
    const z = Math.cos(gamma) * Math.cos(beta);
    update([x, y, z]);
}
function handleMouse(ev) {
    if (!targetElement)
        return;
    const rect = targetElement.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width - 0.5;
    const y = (ev.clientY - rect.top) / rect.height - 0.5;
    update([x, -y, 1]);
}
/**
 * Attach sensors to an element to update lightDir.
 * @param element - canvas element covering the card
 */
export function setupSensors(element) {
    targetElement = element;
    if ('DeviceOrientationEvent' in window) {
        const ask = () => {
            const perm = DeviceOrientationEvent.requestPermission;
            if (typeof perm === 'function') {
                perm.call(DeviceOrientationEvent).then((res) => {
                    if (res === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        useOrientation = true;
                    }
                });
            }
            else {
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
/**
 * Get current light direction for specular calculation.
 */
export function getLightDir() {
    return lightDir;
}
