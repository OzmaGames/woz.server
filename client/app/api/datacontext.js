define(['durandal/app', 'api/constants', 'api/model/path'], function (app, constants, Path) {
    var username = "ali";
    
    var model =
    {
        gameID: 0,
        players: ko.observableArray([]),

        gameOver: ko.observable(false),

        words: ko.observableArray([]),
        tiles: ko.observableArray([]),

        paths: ko.observableArray([]),

        activeWord: ko.observable(null),
        activeWords: ko.observable(null)
    };

    model.load = function (playerCount) {
        app.on("game:start", function (json) {
            model.gameID = json.id;

            model.player = find(json.players, { username: username });
            model.player.active = ko.observable(model.player.active);
            model.players(json.players);
            
            model.words(json.words);

            for (var i = 0; i < json.tiles.length; i++) {
                var metadata = find(constants.images, { id: json.tiles[i].imageID });

                json.tiles[i].description = json.tiles[i].instruction;
                json.tiles[i].imageName = metadata.imageName;
            }
            model.tiles(json.tiles);
            
            json.paths = ko.utils.arrayMap(json.paths, function (p) {
                return new Path(model, p.id, p.nWords, p.startTile, p.endTile, p.cw);
            });
            model.paths(json.paths);
            
            model.gameOver(json.gameOver);
            if(model.onLoad) model.onLoad();
        });

        app.trigger("server:game:queue", { username: username, playerCount: playerCount }, function (res) {
            if (res.success) {

            }
        });
    }
    
    model.playedWords = ko.computed(function () {
        return ko.utils.arrayFilter(model.words(), function (word) { return (word.isPlayed || false); });
    });

    model.unplayedWords = ko.computed(function () {
        return ko.utils.arrayFilter(model.words(), function (word) { return !(word.isPlayed || false); });
    });   
    
    return model;

    function find(arr, data) {
        for (var i = 0; i < arr.length; i++)
            if (match(arr[i], data)) return arr[i];

        function match(item, data) {
            for (var key in data)
                if (item[key] != data[key]) return false;
            return true;
        }
    }
});