#include <common>
#include <fog_pars_vertex>

uniform float uTime;
uniform float uWindSpeed;
uniform float uWindAmplitude;

attribute vec2 aTexOffset;

varying vec2 vUv;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    #include <begin_vertex>
    #include <project_vertex>

    vUv = uv * vec2(0.5, 1.0) + aTexOffset;

    mat4 instanceWorldMatrix = modelMatrix;

    #ifdef USE_INSTANCING
        instanceWorldMatrix = modelMatrix * instanceMatrix;
    #endif

    vec4 worldPos = instanceWorldMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float scaleX = length(instanceWorldMatrix[0].xyz);
    float scaleY = length(instanceWorldMatrix[1].xyz);

    vec3 cameraRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 cameraUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

    float windPhase = noise(worldPos.xz) * 6.28318;
    float wind = sin(uTime * uWindSpeed + windPhase) * uWindAmplitude;

    float heightFactor = (position.y + 0.5);
    vec3 windOffset = cameraRight * wind * heightFactor * 0.5 * scaleX;

    vec3 billboardPos = worldPos.xyz + cameraRight * position.x * scaleX + cameraUp * position.y * scaleY + windOffset;

    gl_Position = projectionMatrix * viewMatrix * vec4(billboardPos, 1.0);

    #include <fog_vertex>
}
