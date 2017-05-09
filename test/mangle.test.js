var mangle = require('../lib/mangle');
var string = require('../lib/string');
var cssmin = require('cssmin');
var cssbeautify = require('cssbeautify');

var fs = require('fs');

test('mangle', function() {
    var css = fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css').toString('utf8');
    var sourceMap = JSON.parse(fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.css.map').toString('utf8'));
    var man = mangle(css, sourceMap, {
        projection: (i) => {
            return '_' + string.toBase(1000000 + i) + '_' + string.toBase(1000 + i);
        }
    });

    expect(cssbeautify(cssmin(man.css))).not.toBe(cssbeautify(cssmin(css)));

    for (var i in man.map) {
        for (var j in man.map[i]) {
            man.css = man.css.split(man.map[i][j]).join(j);
        }
    }

    expect(cssbeautify(cssmin(man.css))).toBe(cssbeautify(cssmin(css)));
});

