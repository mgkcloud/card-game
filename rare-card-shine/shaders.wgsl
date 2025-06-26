// Vertex + fragment shader implementing iridescent HDR foil
// Tone mapping spec: https://gpuweb.github.io/gpuweb/#dom-gpucanvasconfiguration-tonemapping

struct VSOut {
  @builtin(position) position : vec4<f32>,
  @location(0) uv : vec2<f32>,
  @location(1) normal : vec3<f32>
};

// Full-screen quad generated from vertex_index
@vertex
fn vs_main(@builtin(vertex_index) vid : u32) -> VSOut {
  var positions = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0)
  );
  let pos = positions[vid];
  var out : VSOut;
  out.position = vec4<f32>(pos, 0.0, 1.0);
  out.uv = (pos + vec2<f32>(1.0)) * 0.5;
  out.normal = vec3<f32>(0.0, 0.0, 1.0);
  return out;
}

struct Params {
  lightDir : vec3<f32>,
  intensity : f32
};

@group(0) @binding(0) var<uniform> params : Params;
@group(0) @binding(1) var rainbowTex : texture_2d<f32>;
@group(0) @binding(2) var rainbowSamp : sampler;
@group(0) @binding(3) var baseTex : texture_2d<f32>;
@group(0) @binding(4) var baseSamp : sampler;

// Fragment uses view-dependent rainbow specular highlights
@fragment
fn fs_main(in: VSOut) -> @location(0) vec4<f32> {
  let viewDir = normalize(in.position.xyz);
  let dotNL = max(dot(viewDir, params.lightDir), 0.0);
  let spec = pow(dotNL, 64.0);
  let offset = dotNL * 4.0;
  let holoColor = textureSampleLevel(rainbowTex, rainbowSamp, vec2<f32>(offset, 0.0), 0.0).rgb;
  let base = textureSample(baseTex, baseSamp, in.uv).rgb;
  var final = base + holoColor * spec * params.intensity;
  final = clamp(final, vec3<f32>(0.0), vec3<f32>(4.0));
  return vec4<f32>(final, 1.0);
}
