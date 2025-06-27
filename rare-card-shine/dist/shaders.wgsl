// Vertex + fragment shader implementing iridescent HDR foil
// Tone mapping spec: https://gpuweb.github.io/gpuweb/#dom-gpucanvasconfiguration-tonemapping

// Vertex shader: render full-screen quad, pass position, uv, and normal
// https://gpuweb.github.io/gpuweb/#draw-and-dispatch
struct VertexOutput {
  @builtin(position) Position : vec4<f32>;
  @location(0) uv : vec2<f32>;
  @location(1) normal : vec3<f32>;
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
  var positions = array<vec2<f32>, 6>(
    vec2(-1.0, -1.0),
    vec2(1.0, -1.0),
    vec2(-1.0,  1.0),
    vec2(-1.0,  1.0),
    vec2(1.0, -1.0),
    vec2(1.0,  1.0)
  );
  let pos = positions[vertexIndex];
  var output : VertexOutput;
  output.Position = vec4(pos, 0.0, 1.0);
  output.uv = pos * 0.5 + vec2(0.5, 0.5);
  output.normal = vec3(0.0, 0.0, 1.0);
  return output;
}

// Uniforms: light direction and intensity
struct Uniforms {
  lightDir: vec3<f32>;
  intensity: f32;
};

@group(0) @binding(0)
var<uniform> uniforms : Uniforms;

// Rainbow spectral ramp
@group(0) @binding(1)
var rainbowTex : texture_2d<f32>;
@group(0) @binding(2)
var rainbowSampler : sampler;

// Base card texture
@group(0) @binding(3)
var baseTex : texture_2d<f32>;
@group(0) @binding(4)
var baseSampler : sampler;

// Fragment shader: compute iridescent specular foil
@fragment
fn fs_main(input : VertexOutput) -> @location(0) vec4<f32> {
  // Compute view direction (NDC position)
  let viewDir = normalize(input.Position.xyz);
  // Dot with light direction
  let dp = max(dot(viewDir, uniforms.lightDir), 0.0);
  // Specular exponent for sharp shine
  let spec = pow(dp, 64.0);
  // Hue offset
  let offset = dp * 4.0;
  // Sample spectral ramp
  let holo = textureSample(rainbowTex, rainbowSampler, vec2(offset, 0.0)).rgb;
  // Sample base texture
  let baseColor = textureSample(baseTex, baseSampler, input.uv).rgb;
  // HDR composite
  let hdrColor = baseColor + holo * spec * uniforms.intensity;
  // Preserve HDR headroom
  let finalColor = clamp(hdrColor, vec3(0.0), vec3(4.0));
  return vec4(finalColor, 1.0);
}
