const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  alert('WebGL không được hỗ trợ!');
  throw new Error('WebGL không khả dụng.');
}

const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying lowp vec4 vColor;
  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
`;

const fsSource = `
  varying lowp vec4 vColor;
  void main(void) {
    gl_FragColor = vColor;
  }
`;

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Không thể khởi tạo chương trình shader:', gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Lỗi biên dịch shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

const programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
  },
};

function initBuffers(gl) {
  const positions = [
     
    -1.0, -1.0,  1.0,   1.0, -1.0,  1.0,   1.0,  1.0,  1.0,  -1.0,  1.0,  1.0,
     
    -1.0, -1.0, -1.0,  -1.0,  1.0, -1.0,   1.0,  1.0, -1.0,   1.0, -1.0, -1.0,
     
    -1.0,  1.0, -1.0,  -1.0,  1.0,  1.0,   1.0,  1.0,  1.0,   1.0,  1.0, -1.0,
     
    -1.0, -1.0, -1.0,   1.0, -1.0, -1.0,   1.0, -1.0,  1.0,  -1.0, -1.0,  1.0,
     
    -1.0, -1.0, -1.0,  -1.0, -1.0,  1.0,  -1.0,  1.0,  1.0,  -1.0,  1.0, -1.0,
     
     1.0, -1.0, -1.0,   1.0, -1.0,  1.0,   1.0,  1.0,  1.0,   1.0,  1.0, -1.0
  ];

  const colors = [
     
    1.0, 0.0, 0.0, 1.0,   1.0, 0.0, 0.0, 1.0,   1.0, 0.0, 0.0, 1.0,   1.0, 0.0, 0.0, 1.0,
     
    0.0, 1.0, 0.0, 1.0,   0.0, 1.0, 0.0, 1.0,   0.0, 1.0, 0.0, 1.0,   0.0, 1.0, 0.0, 1.0,
     
    0.0, 0.0, 1.0, 1.0,   0.0, 0.0, 1.0, 1.0,   0.0, 0.0, 1.0, 1.0,   0.0, 0.0, 1.0, 1.0,
     
    1.0, 1.0, 0.0, 1.0,   1.0, 1.0, 0.0, 1.0,   1.0, 1.0, 0.0, 1.0,   1.0, 1.0, 0.0, 1.0,
     
    1.0, 0.0, 1.0, 1.0,   1.0, 0.0, 1.0, 1.0,   1.0, 0.0, 1.0, 1.0,   1.0, 0.0, 1.0, 1.0,
     
    0.0, 1.0, 1.0, 1.0,   0.0, 1.0, 1.0, 1.0,   0.0, 1.0, 1.0, 1.0,   0.0, 1.0, 1.0, 1.0
  ];

  const indices = [
    0, 1, 2,  0, 2, 3,  
    4, 5, 6,  4, 6, 7,  
    8, 9, 10, 8, 10,11, 
    12,13,14,12,14,15, 
    16,17,18,16,18,19, 
    20,21,22,20,22,23  
  ];

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return { position: positionBuffer, color: colorBuffer, indices: indexBuffer };
}

const buffers = initBuffers(gl);

const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);

const modelViewMatrix = mat4.create();
mat4.lookAt(modelViewMatrix, [3.0, 3.0, 6.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function animate() {
  mat4.rotateY(modelViewMatrix, modelViewMatrix, 0.01); 
  drawScene();
  requestAnimationFrame(animate);
}

animate();
