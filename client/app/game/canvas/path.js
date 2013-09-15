define(['api/datacontext', 'paper', 'jquery'], function (ctx, Paper, $) {

    var scope = paper;
    var paths = ctx.paths();
    var activeWord = ctx.activeWord;
    var activeWords = ctx.activeWords;
    var transparent = new scope.Color(0, 0);

    var options = {
        tileRadius: 80,
        tileMargin: 5,
        rectSize: new paper.Point(30, 15),
        hoverMargin: 120,
        rectMargin: 10,
        rectStrokeColor: "#986b31",
        rectStrokeWidth: 1,
        minArc: 20,
        debug: 0,
        container: null
    };

    var Events = {
        mouseEnter: function (rect, e) {
            /// <param name='rect' value='{data: new RectMetadata()}'/>
            rect.data.mouseEnter({ obsWord: activeWord, obsWords: activeWords });
        },
        mouseLeave: function (rect, e) {
            /// <param name='rect' value='{data: new RectMetadata()}'/>            
            rect.data.mouseLeave({ obsWord: activeWord, obsWords: activeWords });
        },
        //doesn't detect mouse-up
        mouseMove: function (rect, e) {
            /// <param name='rect' value='{data: new RectMetadata()}'/> 
            if (e.event.which === 0 && activeWords() == null) {
                rect.data.mouseUp();
            }
        },

        mouseDown: function (rect, e) {
            /// <param name='rect' value='{data: new RectMetadata()}'/>              
            rect.data.mouseDown({ obsWords: activeWords });
            activeWords(null);
        }
    }

    $('<button/>', { text: 'debug', style: "padding:10px;position:absolute;z-index:10,top:0,right:0" }).click(function () {
        options.debug = 1;
        var btn = $(this).hide();

        draw();
        var div = $('<div/>', { id: 'tileDebugWin', class: '', style: "position:absolute;margin:10px;width: 200px;height: 300px;z-index:10;background-color:white" });
        div.append($('<input/>', { type: "number", value: paths[0].nWords }).change(function () { paths[0].nWords = $(this).val(); update() }));
        div.append($('<input/>', { type: "number", value: paths[1].nWords }).change(function () { paths[1].nWords = $(this).val(); update() }));
        div.append($('<input/>', { type: "number", value: paths[2].nWords }).change(function () { paths[2].nWords = $(this).val(); update() }));
        div.append($('<input/>', { type: "number", value: paths[3].nWords }).change(function () { paths[3].nWords = $(this).val(); update() }));
        div.append($('<hr/>'));
        div.append($('<div/>', { text: 'min arc:' }));
        div.append($('<input/>', { type: "number", value: options.minArc }).change(function () { options.minArc = $(this).val(); update() }));
        div.append($('<div/>', { text: 'box size:' }));
        div.append($('<input/>', { type: "blah", value: options.rectSize.x + ',' + options.rectSize.y }).change(function () { options.rectSize = new paper.Point($(this).val().split(',')[0] * 1, $(this).val().split(',')[1] * 1); update() }));
        div.append($('<div/>', { text: 'tile margin:' }));
        div.append($('<input/>', { type: "number", value: options.tileMargin }).change(function () { options.tileMargin = $(this).val() * 1; update() }));
        div.append($('<div/>', { text: 'box margin:' }));
        div.append($('<input/>', { type: "number", value: options.rectMargin }).change(function () { options.rectMargin = $(this).val() * 1; update() }));
        div.append($('<div/>', { text: 'drop area:' }));
        div.append($('<input/>', { type: "number", value: options.hoverMargin }).change(function () { options.hoverMargin = $(this).val() * 1; update() }));
        div.append($('<hr/>'));
        div.append($('<input/>', { type: "checkbox", checked: options.debug }).change(function () { options.debug = $(this).is('checked'); update(); }));
        div.append($('<span/>', { text: 'debug:' }));

        div.append($('<button/>', { text: 'close', style: 'padding:10px' }).click(function () {
            btn.show(); $(this).closest('div').hide(); options.debug = 0;
            $(window).trigger('resize');
        }));

        function update() {
            $(window).trigger('resize');
        }
        div.appendTo('body');
    }).appendTo('body');

    function updateModel() {

        options.container = {
            width: $('#tiles').width(),
            height: $('#tiles').height(),
            left: $('#tiles').offset().left,
            top: $('#tiles').offset().top
        };

        for (var i = 0; i < paths.length; i++) {
            var pm = paths[i];

            pm.startTile.center = getTileCenterPoint(pm.startTile.x, pm.startTile.y);
            pm.endTile.center = getTileCenterPoint(pm.endTile.x, pm.endTile.y);
        }

        function getTileCenterPoint(x, y) {
            var point = new scope.Point();
            point.x = options.container.width * x + options.container.left;
            point.y = options.container.height * y + options.container.top;

            return point;
        }
    }

    function setup(canvas) {
        //scope = new paper.PaperScope();
        //scope.setup(canvas);
        updateModel();
        draw();
    }

    function redraw() {

        for (var i = 0; i < displayItems.length; i++) {
            if (displayItems[i].data instanceof RectMetadata) {
                displayItems[i].data.dispose();
            }
            displayItems[i].remove();
        }
        displayItems = [];

        paths = ctx.paths();

        updateModel();
        draw();
        paper.view.draw();
    }

    var displayItems = [];

    function shortestArc(from, to, desiredLength, clockwise, accuracy) {
        var line = new scope.Path.Line(from, to),
            cPoint = line.getPointAt(line.length / 2),
            vector = line.getNormalAt(line.length / 2).normalize(-500 * (clockwise ? 1 : -1));
        line.remove();

        line = new scope.Path.Line(cPoint.add(vector.normalize(-options.minArc)), cPoint.subtract(vector));
        if (options.debug) {
            line.strokeColor = 'orange';
            line.dashArray = [10, 12];
            var circle = new scope.Path.Circle(cPoint, 5);
            circle.fillColor = 'orange';

            displayItems.push(circle);
        }

        var S = 0, E = line.length, bestDelta = 10000, M = line.length, bestArc;
        accuracy = accuracy || 10;
        for (var i = 0; i < accuracy, M /= 2.0; i++) {
            var through = line.getPointAt((S + E) / 2);
            var arc = new scope.Path.Arc(from, through, to);

            if (Math.abs(arc.length - desiredLength) < bestDelta) {
                if (bestArc) bestArc.remove();
                bestDelta = Math.abs(arc.length - desiredLength);
                bestArc = arc;
            } else {
                arc.remove();
            }

            if (arc.length > desiredLength) E -= M; else S += M;
        }

        if (!options.debug) line.remove();
        else
            displayItems.push(line);

        return bestArc;
    }

    function getDesiredLength(n) {
        return n * (options.rectSize.x + options.rectMargin) * 2 + (options.tileMargin + options.tileRadius) * 2;
    }

    function draw() {
        console.log('%c Path Drew', 'background: orange; color: white');
        var gap = options.tileMargin + options.tileRadius + options.rectSize.x + options.rectMargin;

        for (var i = 0; i < paths.length ; i++) {
            var pm = paths[i], nWords = pm.nWords;
            if (nWords == 0) continue;

            var desiredLength = getDesiredLength(pm.nWords);
            path = shortestArc(pm.startTile.center, pm.endTile.center, desiredLength, pm.cw !== false);
            path.strokeColor = 'grey';

            displayItems.push(path);

            var group = paths[i].guiRects = new scope.Group();
            var delta = path.length - desiredLength,
                visualLength = path.length - 2 * (options.tileMargin + options.tileRadius);

            for (var j = 0; j < nWords; j++) {
                var offset = gap + (j / nWords) * visualLength;
                offset += delta / (nWords * 2);    //centering boxes if the length of arc is bigger

                var point = path.getPointAt(offset);
                var tangent = path.getTangentAt(offset);

                var rect = new scope.Path.Rectangle(point.subtract(options.rectSize), point.add(options.rectSize));
                rect.rotate(tangent.angle);
                rect.data = new RectMetadata(rect, j + 1, pm, point, tangent.angle);

                var nextOffset = (offset + (gap + ((j + 1) / nWords) * visualLength) + delta / (nWords * 2)) / 2,
                    nextPoint = path.getPointAt(nextOffset),
                    nextNoramal = path.getNormalAt(nextOffset).normalize(-options.hoverMargin);

                var prevOffset = (offset + (gap + ((j - 1) / nWords) * visualLength) + delta / (nWords * 2)) / 2,
                    prevPoint = path.getPointAt(prevOffset),
                    prevNoramal = path.getNormalAt(prevOffset).normalize(options.hoverMargin);

                var hover = new scope.Path(
                    prevPoint.add(prevNoramal), prevPoint.subtract(prevNoramal),
                    nextPoint.add(nextNoramal), nextPoint.subtract(nextNoramal));
                hover.closePath();
                hover.data = rect;

                hover.on({
                    mouseenter: function (e) { Events.mouseEnter(this.data, e); },
                    mouseleave: function (e) { Events.mouseLeave(this.data, e); },
                    mousemove: function (e) { Events.mouseMove(this.data, e); },
                    mousedown: function (e) { Events.mouseDown(this.data, e); }
                });

                hover.fillColor = new scope.Color(0, 0);

                displayItems.push(hover);
                displayItems.push(rect);

                group.addChild(rect);                

                if (options.debug) hover.strokeColor = 'lightgreen'
            }

            group.strokeColor = options.rectStrokeColor;
            group.strokeWidth = options.rectStrokeWidth;

            if (!options.debug) path.remove();
        }

        paper.view.draw();
    }


    function RectMetadata(rect, index, pm, point, angle) {
        this.index = index;
        this.pathModel = pm;
        this.active = false;
        this.hasData = false;
        this.cPoint = point;
        this.angle = angle;
        this.wordModel = null;

        this._guiRect = rect;
        this._guiText = null;

        var base = this;

        base.mouseEnter = function (data) {
            /// <param name='data' value='{obsWords: ko.observableArray(), obsWord: ko.observable()}'/>

            if (!base.hasData) {
                //if a group of words is selected
                if (data.obsWords && data.obsWords() != null) {
                    var nWord = base.pathModel.nWords;
                    var activeWords = data.obsWords();
                    if (activeWords.length == nWord) {
                        var guiRects = this.pathModel.guiRects;
                        for (var i = 0; i < guiRects.children.length; i++) {
                            var metadata = guiRects.children[i].data;
                            metadata.mouseEnter({ obsWord: function () { return activeWords[i]; } });
                        }
                    }
                }
                    //hover a single word
                else if (data.obsWord() != null) {
                    base.active = true;

                    base.wordModel = data.obsWord();

                    base._guiRect.strokeColor = 'red';
                    base._guiRect.scale(1.1);

                    if (base._guiText) base._guiText.remove();

                    base._guiText = base.createText(base.wordModel.lemma);
                }
            }
        };

        base.mouseLeave = function (data) {
            /// <param name='data' value='{obsWords: ko.observableArray(), obsWord: ko.observable()}'/>
            if (base.active && !base.hasData) {
                if (data && data.obsWords && data.obsWords() != null) {
                    var guiRects = this.pathModel.guiRects;
                    for (var i = 0; i < guiRects.children.length; i++) {
                        var metadata = guiRects.children[i].data;
                        metadata.mouseLeave();
                    }
                }
                else {
                    if (base._guiText) base._guiText.remove();
                    base._guiText = null;
                    base.active = false;
                    base._guiRect.strokeColor = options.rectStrokeColor;
                    base._guiRect.scale(1 / 1.1);
                }
            }
        };

        base.mouseUp = function () {
            if (base.active && !base.hasData && base.wordModel != null) {
                base.pathModel.addWord(base.wordModel, base.index);
            }
        };

        base.mouseDown = function (data) {
            /// <param name='data' value='{obsWords: ko.observableArray(), obsWord: ko.observable()}'/>
            if (!base.hasData && data.obsWords() != null) {
                var nWord = base.pathModel.nWords;
                var activeWords = data.obsWords();
                if (activeWords.length == nWord) {
                    for (var i = 0; i < activeWords.length; i++) {
                        base.pathModel.addWord(activeWords[i], i + 1);
                    }
                }
            }
        };

        showWordOnPath(getWordAt(pm.phrase.words(), base.index));

        var subscription = pm.phrase.words.subscribe(function (arr) {
            var item = getWordAt(arr, base.index);
            showWordOnPath(item);
        });

        this.dispose = function () {
            subscription.dispose();
        }

        function getWordAt(arr, index) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].index === index) {
                    return arr[i];
                }
            }
            return null;
        }

        function showWordOnPath(item) {
            if (item != null) {
                if (!base.hasData) {
                    base.hasData = true;

                    base.pathModel.guiRects.removeChildren(base._guiRect);
                    base._guiRect.remove();
                    if (base._guiText) base._guiText.remove();

                    var div = $('<div/>', { 'class': 'magnet', text: item.word.lemma });
                    div.css({
                        left: options.container.width / 2,
                        top: options.container.top + options.container.height / 2
                    });
                    div.appendTo('#tiles');
                    div.css({
                        left: base.cPoint.x - options.container.left - div.outerWidth() / 2,
                        top: base.cPoint.y - options.container.top - 18,
                        "-webkit-transform": "rotate(" + base.angle + "deg)",
                        "-moz-transform": "rotate(" + base.angle + "deg)",
                        "-ms-transform": "rotate(" + base.angle + "deg)",
                        "-o-transform": "rotate(" + base.angle + "deg)",
                        "transform": "rotateY(" + base.angle + "deg)"
                    });

                    div.one("click", function () {
                        base.pathModel.removeWordAt(base.index);
                    });

                    base._guiText = div;
                }
                if (base.active) {
                    base.active = false;
                    base._guiRect.strokeColor = options.rectStrokeColor;
                    base._guiRect.scale(1 / 1.1);
                }
            }
            else if (base.hasData) {
                base._guiRect = new scope.Path.Rectangle(base.cPoint.subtract(options.rectSize), base.cPoint.add(options.rectSize));
                base._guiRect.rotate(base.angle);
                base._guiRect.data = base;
                base._guiRect.strokeColor = options.rectStrokeColor;
                base.pathModel.guiRects.addChild(base._guiRect);
                displayItems.push(base._guiRect);

                base.hasData = false;
                base.wordModel = null;
                base._guiRect.fillColor = transparent;
                base._guiText.remove();
                base._guiText = null;
            }

        }
    }

    RectMetadata.prototype.createText = function (content) {
        if (this._guiText) this._guiText.remove();

        var text = new scope.PointText({
            point: this.cPoint,
            content: content,
            strokeColor: 'grey',
            justification: 'center',
            fontSize: 18,
            font: 'CopseRegular'
        });
        text.position.y += 5;
        text.rotate(this.angle, this.cPoint);
        text.characterStyle.fontStyle = 'bold';

        this._guiText = text;

        return text;
    }

    return { draw: draw, setup: setup, redraw: redraw };

});