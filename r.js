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

    function fetchFile(filename) {
        var request = new XMLHttpRequest();
        request.open("GET", filename, false);
        request.overrideMimeType('text/plain');
        request.send();
        return request.responseText;
    }

    var timeLocation, positionLocation;

    var time = 0;
    function update(gl) {
        time++;

        // Clear the scene.
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1i(timeLocation, time);

        gl.vertexAttribPointer(positionLocation, 3, gl.BYTE, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
        gl.drawElements(gl.TRIANGLES, CUBE_FACES.length * 6, gl.UNSIGNED_BYTE, 0);
    }

    function compileProgram(gl) {
        var vertSource = fetchFile('r_vert.glsl');
        var vertShader = compileShader(gl, vertSource, gl.VERTEX_SHADER);
        var fragSource = fetchFile('r_frag.glsl');
        var fragShader = compileShader(gl, fragSource, gl.FRAGMENT_SHADER);

        var prog = gl.createProgram();
        gl.attachShader(prog, vertShader);
        gl.attachShader(prog, fragShader);
        gl.linkProgram(prog);

        timeLocation = gl.getUniformLocation(prog, 'u_time');
        positionLocation = gl.getAttribLocation(prog, 'a_position');

        gl.useProgram(prog);
    }

    function convertModelToGL(gl, points, faces) {
        var ITEMS_PER_POINT = 3;

        var pointsData = new Int8Array(points.length * ITEMS_PER_POINT);
        points.forEach(function(p, idx) {
            pointsData[idx*ITEMS_PER_POINT + 0] = p.x;
            pointsData[idx*ITEMS_PER_POINT + 1] = p.y;
            pointsData[idx*ITEMS_PER_POINT + 2] = p.z;
        });

        var pointsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pointsData, gl.STATIC_DRAW);

        var ITEMS_PER_FACE = 6;
        var facesData = new Uint8Array(faces.length * ITEMS_PER_FACE);
        faces.forEach(function(face, idx) {
            facesData[idx*ITEMS_PER_FACE + 0] = face[0];
            facesData[idx*ITEMS_PER_FACE + 1] = face[1];
            facesData[idx*ITEMS_PER_FACE + 2] = face[2];

            facesData[idx*ITEMS_PER_FACE + 3] = face[2];
            facesData[idx*ITEMS_PER_FACE + 4] = face[3];
            facesData[idx*ITEMS_PER_FACE + 5] = face[0];
        });

        var facesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, facesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, facesData, gl.STATIC_DRAW);
    }

    window.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        document.body.appendChild(canvas);
        var gl = canvas.getContext('webgl');
        gl.viewport(0, 0, WIDTH, HEIGHT);

        convertModelToGL(gl, CUBE, CUBE_FACES);
        compileProgram(gl);

        function mainloop() {
            update(gl);
            window.requestAnimationFrame(mainloop);
        }

        mainloop();
    };

})(window);
