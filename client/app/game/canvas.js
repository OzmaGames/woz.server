define(['api/datacontext', 'paper', 'game/canvas/path', 'game/canvas/selection'], function (ctx, Paper, canvasPath, canvasSelection) {

    function setup(canvas) {
        var context = canvas.getContext("2d");
        context.canvas.width = $(canvas).width()
        context.canvas.height = $(canvas).height();

        //debugger;
        if (canvasSelection.setup) canvasSelection.setup(canvas);
        if (canvasPath.setup) canvasPath.setup(canvas);
    }

    function redraw(canvas) {
        var context = canvas.getContext("2d");
        context.canvas.width = $(canvas).width()
        context.canvas.height = $(canvas).height();

        if (canvasSelection.redraw) canvasSelection.redraw(canvas);
        if (canvasPath.redraw) canvasPath.redraw(canvas);
    }

    return {
        attached: function (canvas) {
            $(window).resize(canvas, function (e) {
                redraw(e.data);
            });
        },

        compositionComplete: function (canvas) {
            setup(canvas);
        }
    };
});