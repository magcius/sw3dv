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

    function randColor() {
        function R() { return (Math.random() * 255) | 0; }
        return 'rgba(' + R() + ', ' + R() + ', ' + R() + ', 0.4)';
    }

    CUBE_FACES.forEach(function(face) {
        face.color = randColor();
    });

    function rotateX(p, angle) {
        var sin = Math.sin(angle), cos = Math.cos(angle);
        var ry = p.y * cos - p.z * sin;
        var rz = p.y * sin + p.z * cos;
        return point(p.x, ry, rz);
    }

    function rotateY(p, angle) {
        var sin = Math.sin(angle), cos = Math.cos(angle);
        var rx =  p.x * cos + p.z * sin;
        var rz = -p.x * sin + p.z * cos;
        return point(rx, p.y, rz);
    }

    function vertexShader(p, time) {
        // Rotate it around and make it look interesting.
        var angleX = time / 100;
        p = rotateX(p, angleX);
        var angleY = time / 70;
        p = rotateY(p, angleY);

        // Move the shape back a bit so we can see it better.
        p.z -= 4;

        // Perspective divide!
        p.x /= p.z;
        p.y /= p.z;

        p.x *= 4;
        p.y *= 4;

        // Scale our point to be 100px big or so...
        p = point(p.x * 100, p.y * 100, p.z * 100);
        // and put it in the middle of the screen.
        p = point(p.x + WIDTH/2, p.y + HEIGHT/2, p.z);
        return p;
    }

    var time = 0;

    function update(ctx) {
        time++;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var points = CUBE;
        points = points.map(function(p) {
            return vertexShader(p, time);
        });

        var faces = CUBE_FACES;
        faces.forEach(function(face) {
            var facePoints = face.map(function(idx) {
                return points[idx];
            });

            ctx.beginPath();
            facePoints.forEach(function(p) {
                var x = Math.floor(p.x);
                var y = Math.floor(p.y);
                ctx.fillRect(x, y, 4, 4);
                ctx.lineTo(x, y);
            });
            ctx.save();
            ctx.fillStyle = face.color;
            ctx.fill('evenodd');
            ctx.restore();
        });
    }

    window.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        function mainloop() {
            update(ctx);
            window.requestAnimationFrame(mainloop);
        }

        mainloop();
    };

})(window);
