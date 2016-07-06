(function(exports) {
    "use strict";

    var WIDTH = 400, HEIGHT = 400;

    var CUBE = [
        { x: -1, y: -1, z: -1, attr: { u: 0, v: 0, r: 0xFF, g: 0x00, b: 0x00 } },
        { x:  1, y: -1, z: -1, attr: { u: 1, v: 0, r: 0x00, g: 0xFF, b: 0x00 } },
        { x:  1, y:  1, z: -1, attr: { u: 1, v: 1, r: 0x00, g: 0x00, b: 0xFF } },
        { x: -1, y:  1, z: -1, attr: { u: 0, v: 1, r: 0xFF, g: 0x00, b: 0xFF } },

        { x:  1, y: -1, z: -1, attr: { u: 0, v: 0, r: 0x00, g: 0xFF, b: 0xFF } },
        { x:  1, y: -1, z:  1, attr: { u: 1, v: 0, r: 0xFF, g: 0x00, b: 0xFF } },
        { x:  1, y:  1, z:  1, attr: { u: 1, v: 1, r: 0x00, g: 0xFF, b: 0xFF } },
        { x:  1, y:  1, z: -1, attr: { u: 0, v: 1, r: 0xFF, g: 0x00, b: 0xFF } },

        { x:  1, y: -1, z: -1, attr: { u: 1, v: 0, r: 0xFF, g: 0x00, b: 0x00 } },
        { x: -1, y: -1, z: -1, attr: { u: 0, v: 0, r: 0xFF, g: 0xFF, b: 0x00 } },
        { x: -1, y: -1, z:  1, attr: { u: 0, v: 1, r: 0xFF, g: 0xFF, b: 0xFF } },
        { x:  1, y: -1, z:  1, attr: { u: 1, v: 1, r: 0x00, g: 0xFF, b: 0xFF } },

        { x:  1, y: -1, z:  1, attr: { u: 1, v: 0, r: 0xFF, g: 0x00, b: 0xFF } },
        { x: -1, y: -1, z:  1, attr: { u: 0, v: 0, r: 0x00, g: 0xFF, b: 0xFF } },
        { x: -1, y:  1, z:  1, attr: { u: 0, v: 1, r: 0xFF, g: 0x00, b: 0xFF } },
        { x:  1, y:  1, z:  1, attr: { u: 1, v: 1, r: 0x00, g: 0xFF, b: 0xFF } },

        { x: -1, y: -1, z:  1, attr: { u: 1, v: 0, r: 0xFF, g: 0xFF, b: 0xFF } },
        { x: -1, y: -1, z: -1, attr: { u: 0, v: 0, r: 0xFF, g: 0xFF, b: 0xFF } },
        { x: -1, y:  1, z: -1, attr: { u: 0, v: 1, r: 0xFF, g: 0xFF, b: 0xFF } },
        { x: -1, y:  1, z:  1, attr: { u: 1, v: 1, r: 0xFF, g: 0xFF, b: 0xFF } },

        { x: -1, y:  1, z: -1, attr: { u: 1, v: 0, r: 0xFF, g: 0x00, b: 0x00 } },
        { x:  1, y:  1, z: -1, attr: { u: 0, v: 0, r: 0x00, g: 0xFF, b: 0xFF } },
        { x:  1, y:  1, z:  1, attr: { u: 0, v: 1, r: 0x00, g: 0xFF, b: 0x00 } },
        { x: -1, y:  1, z:  1, attr: { u: 1, v: 1, r: 0x00, g: 0xFF, b: 0x00 } },
    ];

    var CUBE_FACES = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
        [16, 17, 18, 19],
        [20, 21, 22, 23],
    ];

    function edgeFunction(ax, ay, bx, by, px, py) {
        // Put everything in the space of A.
        bx -= ax; by -= ay; px -= ax; py -= ay;
        // Signed area of the paralellogram decided by B and P.
        return (bx * py - by * px);
    }

    function mixColor(ca, cb, t) {
        var at = t, bt = 1-t;
        var r = ((ca >>> 24) & 0xFF) * at + ((cb >>> 24) & 0xFF) * bt;
        var g = ((ca >>> 16) & 0xFF) * at + ((cb >>> 16) & 0xFF) * bt;
        var b = ((ca >>>  8) & 0xFF) * at + ((cb >>>  8) & 0xFF) * bt;
        return r << 24 | g << 16 | b << 8;
    }

    function loadImage(src) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var data = null;
        ctx.load = function() {
            if (!data)
                data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            return data;
        };

        var img = document.createElement('img');
        img.src = src;
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            data = null;
        };

        return ctx;
    }

    var crate = loadImage('crate2.jpg');

    function texture2D(img, u, v) {
        var x = (img.width * u) | 0;
        var y = (img.height * v) | 0;
        var idx = (y * img.width + x) * 4;
        return (img.data[idx + 0] << 24 | img.data[idx + 1] << 16 |
                img.data[idx + 2] <<  8 | img.data[idx + 3]);
    }

    function shadePixel(vtx) {
        var texColor = texture2D(crate.load(), vtx.u, vtx.v);
        var vtxColor = vtx.r << 24 | vtx.g << 16 | vtx.b << 8;
        var color = mixColor(texColor, vtxColor, .5);

        return color | 0x000000FF;
    }

    function renderTri(buffer, points, i1, i2, i3) {
        // Our three points.
        var P1 = points[i1];
        var P2 = points[i2];
        var P3 = points[i3];

        // Edges.
        var E1x1 = P2.x, E1y1 = P2.y, E1x2 = P3.x, E1y2 = P3.y;
        var E2x1 = P3.x, E2y1 = P3.y, E2x2 = P1.x, E2y2 = P1.y;
        var E3x1 = P1.x, E3y1 = P1.y, E3x2 = P2.x, E3y2 = P2.y;

        // Extremeties.
        var minX = (Math.min(P1.x, P2.x, P3.x) | 0);
        var minY = (Math.min(P1.y, P2.y, P3.y) | 0);
        var maxX = (Math.max(P1.x, P2.x, P3.x) | 0) + 1;
        var maxY = (Math.max(P1.y, P2.y, P3.y) | 0) + 1;

        // Clamp to image bounds.
        minX = Math.max(minX, 0); minY = Math.max(minY, 0);
        maxX = Math.min(maxX, WIDTH); maxY = Math.min(maxY, HEIGHT);

        // Twice the tri's area.
        var area = (P3.y - P1.y) * (P2.x - P1.x) - (P2.y - P1.y) * (P3.x - P1.x);

        var img = buffer.img;

        // Precompute inverses.
        var P1_invW = 1/P1.w;
        var P2_invW = 1/P2.w;
        var P3_invW = 1/P3.w;

        for (var y = minY; y < maxY; y++) {
            for (var x = minX; x < maxX; x++) {
                var E1 = edgeFunction(E1x1, E1y1, E1x2, E1y2, x, y);
                var E2 = edgeFunction(E2x1, E2y1, E2x2, E2y2, x, y);
                var E3 = edgeFunction(E3x1, E3y1, E3x2, E3y2, x, y);

                // Inside our tri?
                if (E1 < 0 || E2 < 0 || E3 < 0)
                    continue;

                // Barycentric coordinates in clip space. Weights for
                // how close we are to P1...
                E1 /= area;
                E2 /= area;
                E3 /= area;

                // Compute Z, which we can linearly interpolate in screen space...
                var Z = P1.z*E1 + P2.z*E2 + P3.z*E3;
                // Convert to 16-bit.
                Z = Z * 0xFFFF;

                // Early depth test.
                var i = (y * img.width + x);
                if (buffer.depth[i] < Z)
                    continue;

                // Compute 1/P1.w*E1, etc.
                var E1w = P1_invW*E1;
                var E2w = P2_invW*E2;
                var E3w = P3_invW*E3;

                // Get our perspective-correct w.
                var w = 1 / (E1w + E2w + E3w);

                // Calculate vertex attributes.
                var attr = {};
                for (var k in P1.attr)
                    attr[k] = (P1.attr[k]*E1w + P2.attr[k]*E2w + P3.attr[k]*E3w) * w; 

                var p = shadePixel(attr);

                var idx = i * 4;
                img.data[idx + 0] = (p >>> 24) & 0xFF;
                img.data[idx + 1] = (p >>> 16) & 0xFF;
                img.data[idx + 2] = (p >>> 8) & 0xFF;
                img.data[idx + 3] = p & 0xFF;
                buffer.depth[i] = Z;
            }
        }
    }

    function renderFace(buffer, face, points) {
        // Each face is guaranteed to be a quad.
        if (face.length !== 4) XXX;

        renderTri(buffer, points, face[0], face[1], face[2]);
        renderTri(buffer, points, face[2], face[3], face[0]);
    }

    function memset(b, v) {
        for (var i = 0; i < b.length; i++) b[i] = v;
    }

    function renderDepth(buffer, img) {
        var o = 0;
        for (var i = 0; i < buffer.length; i++) {
            var v = (buffer[i] / 0xFFFF) * 0xFF;
            img.data[o++] = v;
            img.data[o++] = v;
            img.data[o++] = v;
            img.data[o++] = 255;
        }
    }

    function renderModel(buffer, faces, points) {
        // Clear.
        memset(buffer.img.data, 0);
        memset(buffer.depth, 0xFFFF);

        faces.forEach(function(face) { renderFace(buffer, face, points); });
        // renderDepth(buffer.depth, buffer.img)
        buffer.ctx.putImageData(buffer.img, 0, 0);
    }

    function copy(o) {
        var x = {};
        for (var i in o)
            x[i] = o[i];
        return x;
    }

    function set(o, n) {
        for (var k in n)
            o[k] = n[k];
    }

    function rotateX(p, a) {
        var sin = Math.sin(a),
            cos = Math.cos(a);
        var ry = p.y * cos - p.z * sin;
        var rz = p.y * sin + p.z * cos;
        return set(p, { y: ry, z: rz });
    }

    function rotateY(p, a) {
        var sin = Math.sin(a),
            cos = Math.cos(a);
        var rx =  p.x * cos + p.z * sin;
        var rz = -p.x * sin + p.z * cos;
        return set(p, { x: rx, z: rz });
    }

    function scalePoint(p, m) {
        return set(p, { x: p.x * m, y: p.y * m, z: p.z * m });
    }

    function translatePoint(p, tx, ty, tz) {
        return set(p, { x: p.x + tx, y: p.y + ty, z: p.z + tz });
    }

    function transform(points) {
        return points.map(function(p) {
            p = copy(p);

            // Make it look cool by rotating it around...
            rotateY(p, angle);
            rotateX(p, angle * 0.7);

            // So we're not in the immediate center of it.
            translatePoint(p, 0, 0, +document.querySelector('#zoff').value);

            // Perspective divide!
            if (p.z <= 0)
                p.z = 0.01;

            p.w = p.z;
            p.x /= p.w;
            p.y /= p.w;

            // The near plane is at 0, the far plane is at 10.
            var FAR_PLANE = 10;
            // Depth remap to [0-1].
            var Z = p.z / FAR_PLANE;
            // Clamp.
            Z = Math.min(Math.max(Z, 0), 1);

            scalePoint(p, +document.querySelector('#zoff').value);

            // So we can see the point...
            scalePoint(p, 80);
            translatePoint(p, 200, 200, 200);

            p.z = Z;

            return p;
        });
    }

    var angle = 0.25;

    var buffer = {};
    function init(ctx) {
        buffer.img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        buffer.depth = new Uint16Array(buffer.img.width * buffer.img.height);
        buffer.ctx = ctx;
    }

    function update(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        angle += 0.02;
        var points = CUBE;
        points = transform(points);
        renderModel(buffer, CUBE_FACES, points);
    }

    window.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        init(ctx);

        function mainloop() {
            update(ctx);
            window.requestAnimationFrame(mainloop);
        }

        mainloop();
    };

})(window);
