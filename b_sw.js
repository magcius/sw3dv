(function(exports) {
    "use strict";

    var WIDTH = 400, HEIGHT = 400;

    function update(ctx) {
        // Clear the scene.
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
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
