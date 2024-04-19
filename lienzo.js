// Obtener el contexto WebGL del lienzo
var canvas = document.getElementById('webgl-canvas');
var gl = canvas.getContext('webgl');

if (!gl) {
    console.error('No se pudo obtener el contexto WebGL.');
}

// Definir los shaders
var vertexShaderSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

// Aquí colocarías el código GLSL del fragment shader que generamos antes
var fragmentShaderSource = `
// Especifica la precisión de los números de punto flotante utilizados en el shader
precision mediump float;

// Declaración de uniformes para pasar datos desde la aplicación al shader
uniform float u_time;         // Tiempo transcurrido en segundos
uniform vec2 u_resolution;    // Resolución del lienzo WebGL (ancho, alto)

// Función para generar un esquema de colores en función del tiempo
vec3 paleta(float t){
    vec3 a = vec3(1.0,0.0,0.0);     // Rojo
    vec3 b = vec3(0.9,1.0,0.0);     // Amarillo
    vec3 c = vec3(0.0353,1.0,0.0);  // Verde claro
    vec3 d = vec3(0.0,1.0,0.835);   // Verde azulado

    // Mezcla los colores utilizando una función coseno
    return a + b * cos(6.28318 * (c * t + d));
}

// Función principal donde se calcula el color de cada píxel
void main() {
    // Calcula las coordenadas normalizadas del fragmento en el rango [0, 1]
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec2 uv0 = uv;

    // Inicializa un color base
    vec3 color = vec3(1.0, 0.0, 1.0); // Magenta

    // Manipulación de las coordenadas UV
    uv *= 2.0;          // Escala las coordenadas UV
    uv = fract(uv);     // Aplica la función fractal para mantener las coordenadas dentro del rango [0, 1]
    uv -= 0.5;          // Centra las coordenadas UV en el origen

    // Calcula la distancia del fragmento al centro (0, 0)
    float circle = length(uv) - 0.8;

    // Calcula el color del fragmento utilizando la función paleta y el tiempo transcurrido
    color = paleta(length(uv0) + u_time);

    // Calcula un factor de atenuación en forma de círculo
    circle = sin(circle * 5.0 + u_time) / 2.0;
    circle = abs(circle - 0.1) - 0.05;
    circle = 0.0000045 / circle;
    circle = smoothstep(0.0, 0.00006, circle);

    // Modifica el color basado en el factor de atenuación
    color *= circle;

    // Mezcla el color con otro tono azul
    color = mix(color * tan(u_time * 0.3), vec3(0.2667, 0.0, 1.0) * sin(u_time), 5.0 - circle);

    // Establece el color del fragmento
    gl_FragColor = vec4(color, 1.0);
}
`;

// Crear los shaders
var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Crear el programa de sombreado
var shaderProgram = createProgram(gl, vertexShader, fragmentShader);

// Obtener la ubicación de los uniformes
var resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');
var timeUniformLocation = gl.getUniformLocation(shaderProgram, 'u_time');

// Crear el bucle de renderizado
function render() {
    console.log('entra a renderizando');
    // Limpiar el lienzo
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Usar el programa de sombreado
    gl.useProgram(shaderProgram);

    // Establecer el tamaño de resolución uniforme
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    

    // Establecer el tiempo uniforme (si se desea animar el fractal)
    gl.uniform1f(timeUniformLocation, performance.now() / 1000); // Utiliza el tiempo en segundos
    
    // Dibujar un rectángulo que cubre toda la pantalla
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    var positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
    console.log(' termina renderizando');
    

}

render();

// Función auxiliar para crear un shader
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.error('Error al compilar el shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

// Función auxiliar para crear un programa de sombreado
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        
        console.log('funciona');
        return program;
    }

    console.error('Error al vincular y compilar el programa de sombreado:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}