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

    var time = 0;

    function update(ctx) {
        time++;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var points = CUBE;
        points = points.map(function(p) {
            // Rotate it around and make it look interesting.
            var angleX = time / 100;
            p = rotateX(p, angleX);
            var angleY = time / 70;
            p = rotateY(p, angleY);

            // Scale our point to be 100px big or so...
            p = point(p.x * 100, p.y * 100, p.z * 100);
            // and put it in the middle of the screen.
            p = point(p.x + WIDTH/2, p.y + HEIGHT/2, p.z);
            return p;
        });
        points.forEach(function(p) {
            var x = Math.floor(p.x);
            var y = Math.floor(p.y);
            ctx.fillRect(x, y, 4, 4);
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
