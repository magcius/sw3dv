
attribute vec3 a_position;
uniform int u_time;

varying vec3 v_position;

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
    v_position = a_position;

    vec3 pos = a_position;
    float time = float(u_time);

    pos = rotateX(pos, time / 100.0);
    pos = rotateY(pos, time / 70.0);

    pos.z += 4.0;

    gl_Position = vec4(pos, pos.z);
}
