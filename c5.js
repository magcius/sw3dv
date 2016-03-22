(function(exports) {
    "use strict";

    var WIDTH = 400, HEIGHT = 400;

    function point(x, y, z) {
        return { x: x, y: y, z: z };
    }

    var CUBE = [
        point(-1, -1, 1),
        point( 1, -1, 1),
        point( 1,  1, 1),
        point(-1,  1, 1),
        point(-1, -1, -1),
        point( 1, -1, -1),
        point( 1,  1, -1),
        point(-1,  1, -1),
    ];

    var CUBE_FACES = [
        [0, 1, 2, 3],
        [0, 1, 5, 4],
        [4, 5, 6, 7],
        [2, 3, 7, 6],
        [1, 2, 6, 5],
        [0, 3, 7, 4],
    ];

    function compileShader(gl, str, type) {
        var shader = gl.createShader(type);

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function fetchFile(path) {
        var request = new XMLHttpRequest();
        request.open("GET", path, false);
        request.overrideMimeType('text/plain');
        request.send();
        return request.responseText;
    }

    function createProgram(gl, vertFile, fragFile) {
        var vert = fetchFile(vertFile);
        var frag = fetchFile(fragFile);

        var vertShader = compileShader(gl, vert, gl.VERTEX_SHADER);
        var fragShader = compileShader(gl, frag, gl.FRAGMENT_SHADER);

        var prog = gl.createProgram();
        gl.attachShader(prog, vertShader);
        gl.attachShader(prog, fragShader);
        gl.linkProgram(prog);

        prog.positionLocation = gl.getAttribLocation(prog, "a_position");
        prog.timeLocation = gl.getUniformLocation(prog, "u_time");

        return prog;
    }

    var time = 0;
    function update(gl, prog, model) {
        time++;

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Update time.
        gl.uniform1i(prog.timeLocation, time);

        gl.useProgram(prog);

        gl.vertexAttribPointer(prog.positionLocation, 3, gl.BYTE, false, 0, 0);
        gl.enableVertexAttribArray(prog.positionLocation);

        model.primitives.forEach(function(prim) {
            gl.drawElements(gl.TRIANGLE_STRIP, prim.count, gl.UNSIGNED_BYTE, prim.start);
        });
    }

    function convertPointsToGL(gl, points, faces) {
        var verts = new Int8Array(points.length * 3);
        points.forEach(function(p, i) {
            verts[i*3 + 0] = p.x;
            verts[i*3 + 1] = p.y;
            verts[i*3 + 2] = p.z;
        });

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        var indxs = new Int8Array(faces.length * 4);
        var primitives = [];
        faces.forEach(function(face, i) {
            indxs[i*4 + 0] = face[0];
            indxs[i*4 + 1] = face[1];
            indxs[i*4 + 2] = face[3];
            indxs[i*4 + 3] = face[2];
            primitives.push({ start: i*4, count: 4 });
        });

        var elementBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indxs, gl.STATIC_DRAW);

        return { primitives: primitives };
    }

    window.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        document.body.appendChild(canvas);
        var gl = canvas.getContext('webgl');
        gl.viewport(0, 0, WIDTH, HEIGHT);

        var prog = createProgram(gl, 'c5_vert.glsl', 'c5_frag.glsl');
        var model = convertPointsToGL(gl, CUBE, CUBE_FACES);

        function mainloop() {
            update(gl, prog, model);
            window.requestAnimationFrame(mainloop);
        }

        mainloop();
    };

})(window);
