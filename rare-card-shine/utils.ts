export async function initHDRCanvas(canvas: HTMLCanvasElement, baseImg: HTMLImageElement, rainbowSrc: string) {
  if (!navigator.gpu) {
    return createSDRFallback(canvas, baseImg, rainbowSrc);
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return createSDRFallback(canvas, baseImg, rainbowSrc);
  }
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as GPUCanvasContext;
  context.configure({
    device,
    format: 'rgba16float',
    toneMapping: { mode: 'extended' } as any
  });
  return { device, context };
}

export async function createSDRFallback(canvas: HTMLCanvasElement, baseImg: HTMLImageElement, rainbowSrc: string) {
  const glCtx = canvas.getContext('webgl2');
  if (!glCtx) throw new Error('WebGL2 not supported');
  const gl = glCtx as WebGL2RenderingContext;
  const vs = `#version 300 es
  in vec2 position;
  out vec2 vUv;
  void main(){
    vUv = position*0.5+0.5;
    gl_Position = vec4(position,0.0,1.0);
  }`;
  const fs = `#version 300 es
  precision highp float;
  uniform sampler2D baseTex;
  uniform sampler2D rainbowTex;
  uniform vec3 lightDir;
  uniform float intensity;
  in vec2 vUv;
  out vec4 outColor;
  void main(){
    vec3 viewDir = normalize(vec3(gl_FragCoord.xy,1.0));
    float d = max(dot(viewDir, lightDir),0.0);
    float spec = pow(d,64.0);
    float offset = d*4.0;
    vec3 holo = texture(rainbowTex, vec2(offset,0.0)).rgb;
    vec3 base = texture(baseTex, vUv).rgb;
    vec3 col = clamp(base + holo*spec*intensity,0.0,1.0);
    outColor = vec4(col,1.0);
  }`;
  function compile(type: number, src: string){
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);

  const blurFs = `#version 300 es
  precision highp float;
  uniform sampler2D tex;
  uniform vec2 dir;
  in vec2 vUv;
  out vec4 outColor;
  void main(){
    vec3 sum = texture(tex, vUv).rgb * 0.2941176;
    sum += texture(tex, vUv + dir*1.3846153).rgb * 0.3529412;
    sum += texture(tex, vUv - dir*1.3846153).rgb * 0.3529412;
    outColor = vec4(sum,1.0);
  }`;
  const blurProg = gl.createProgram()!;
  gl.attachShader(blurProg, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(blurProg, compile(gl.FRAGMENT_SHADER, blurFs));
  gl.linkProgram(blurProg);

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const loc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const baseTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, baseTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const bmp = await createImageBitmap(baseImg);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);

  const rainbowTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, rainbowTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const rainbowBmp = await createImageBitmap(await fetch(rainbowSrc).then(r => r.blob()));
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, rainbowBmp);

  const tex1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex1);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,canvas.width,canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const tex2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex2);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,canvas.width,canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const fb1 = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb1);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex1, 0);
  const fb2 = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb2);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex2, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const uBase = gl.getUniformLocation(prog, 'baseTex');
  const uRainbow = gl.getUniformLocation(prog, 'rainbowTex');
  const uLight = gl.getUniformLocation(prog, 'lightDir');
  const uIntensity = gl.getUniformLocation(prog, 'intensity');
  const uBlurTex = gl.getUniformLocation(blurProg, 'tex');
  const uDir = gl.getUniformLocation(blurProg, 'dir');

  function draw(light: Float32Array, intensity: number) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb1);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog);
    gl.uniform3fv(uLight, light);
    gl.uniform1f(uIntensity, intensity);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, baseTex);
    gl.uniform1i(uBase, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, rainbowTex);
    gl.uniform1i(uRainbow, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb2);
    gl.useProgram(blurProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    gl.uniform1i(uBlurTex, 0);
    gl.uniform2f(uDir, 1 / canvas.width, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.uniform1i(uBlurTex, 0);
    gl.uniform2f(uDir, 0, 1 / canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  return { gl, draw };
}
