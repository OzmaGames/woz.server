define(['api/datacontext', 'durandal/app', 'jquery'], function (ctx, app, $) {
    return {
        activate: function () {
            app.loading(true);

            ctx.onLoad = function () {
                $(window).resize();
                app.loading(false);
            }

            ctx.load(1);
        },

        binding: function () {
            return { cacheViews: false };
        },

        compositionComplete: function (view) {
            $('#menu').appendTo('body');            
            //app.loading(false);
        },

        detached: function () {
            
        }
    };
});