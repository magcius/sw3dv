
attribute vec3 a_position;
attribute vec2 a_uv;
uniform int u_time;
varying vec2 v_uv;

vec3 rotateX(vec3 p, float angle) {
    float sinF = sin(angle), cosF = cos(angle);
    float ry = p.y * cosF - p.z * sinF;
    float rz = p.y * sinF + p.z * cosF;
    return vec3(p.x, ry, rz);
}

vec3 rotateY(vec3 p, float angle) {
    float sinF = sin(angle), cosF = cos(angle);
    float rx =  p.x * cosF + p.z * sinF;
    float rz = -p.x * sinF + p.z * cosF;
    return vec3(rx, p.y, rz);
}

void main() {
    vec3 pos = a_position;

    float time = float(u_time);

    // Rotate it around and make it look interesting.
    pos = rotateX(pos, time / 100.0);
    pos = rotateY(pos, time / 70.0);

    // Move the shape back a bit so we can see it better.
    pos.z += 4.0;

    // Perspective divide!
    pos.x = pos.x / pos.z;
    pos.y = pos.y / pos.z;
    pos.z = 1.0;

    pos.x *= 2.0;
    pos.y *= 2.0;

    gl_Position = vec4(pos, 1.0);

    v_uv = a_uv;
}
