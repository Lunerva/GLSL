precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

vec3 paleta(float t){
    vec3 a = vec3(1.0,0.0,0.0);
    vec3 b = vec3(0.9,1.0,0.0);
    vec3 c = vec3(0.0353,1.0,0.0);
    vec3 d = vec3(0.0,1.0,0.835);

    return a+b*cos(6.28318*(c*t+d));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec2 uv0 = uv;

    vec3 color = vec3(1.0,0.0,1.0);
    
    uv *= 2.0;
    uv =fract(uv);
    uv -= 0.5;

    float circle = length(uv) - 0.5;
    
    color = paleta(length(uv0)+u_time);

    circle = sin(circle*10.+u_time)/5.;

    circle = abs(circle-0.15) -0.04;
    circle = 0.0000045/circle;
    circle = smoothstep(0.0,0.00009, circle);

    color*=circle;

    color=mix(color*tan(u_time*0.3),vec3(0.2667, 0.0, 1.0),5.-circle);

    gl_FragColor = vec4(color,1.0);

}