define(['durandal/app', 'api/constants', 'api/utils'], function (app, constants, utils) {
    
    //{id, nWords, startTile, endTile, cw, phrase: { words: [ {[words-object], index},.. ] } }
    function Path(model, id, nWords, startTile, endTile, cw) {
        var base = this;

        base.id = id;
        base.nWords = nWords;
        base.startTile = utils.find(model.tiles(), { id: startTile });
        base.endTile = utils.find(model.tiles(), { id: endTile });
        base.cw = (cw === undefined ? true : cw);

        base.cw = (base.startTile.y - base.endTile.y) < 0.1;

        base.phrase = {
            playerId: 0,
            score: ko.observable(0),
            words: ko.observableArray([])   //TODO populate form the server
        };

        base.phrase.complete = ko.computed(function () {
            return this.phrase.words().length == this.nWords;
        }, base);

        base.phrase.complete.subscribe(function (complete) {
            if (complete) {
                app.trigger("confirm:show", { modal: true });

                var sub = app.on("confirm:dialog-result");
                sub.then(function (result) {
                    if (result == "cancel") {
                        base.removeAll();
                    }
                    else {
                        model.player.active(false);
                        var data = {
                            gameID: model.gameID,
                            playerID: model.player.id,
                            pathID: base.id,
                            words: ko.utils.arrayMap(base.phrase.words(), function (word) { return word.word.id; })
                        };
                        app.trigger("server:game:place-phrase", data, function () { console.log('server got it')});
                    }
                    sub.off();
                });
            }
            ko.utils.arrayForEach(base.phrase.words(), function (word) {
                word.word.isPlayed = (complete ? 2 : 1);
            });
        });

        base.addWord = function (word, index) {
            if (null != ko.utils.arrayFirst(base.phrase.words(), function (word) { return word.index === index; })) return;

            word.isPlayed = 1;
            base.phrase.words.push({ word: word, index: index });

            model.words.valueHasMutated();
        }

        base.removeAll = function () {
            var words = base.phrase.words();
            for (var i = 0; i < base.nWords; i++) {
                words[i].word.isPlayed = 0;
            }
            base.phrase.words.removeAll();

            model.words.valueHasMutated();
        }

        base.removeWord = function (word) {
            word.word.isPlayed = 0;
            base.phrase.words.remove(word);

            model.words.valueHasMutated();
        }

        base.removeWordAt = function (index) {
            var word = ko.utils.arrayFirst(base.phrase.words(), function (word) {
                return word.index === index;
            });
            base.removeWord(word);
        }
    }

    return Path;
});