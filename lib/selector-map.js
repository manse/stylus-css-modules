var camelCase = require('camelcase');

function SelectorMap(selectorFn, projectionFn) {
    this.id = 0;
    this.selectorFn = selectorFn;
    this.projectionFn = projectionFn;
    this.mangleNames = {};
}
SelectorMap.prototype.map = function(selector, filename) {
    var map;
    if (!this.mangleNames[filename]) {
        map = this.mangleNames[filename] = {};
    } else {
        map = this.mangleNames[filename];
    }
    var that = this;
    return selector.replace(/\.([\w\-:]*)/g, function(_match, name) {
        var beforeLength = name.length;
        name = name.replace(/:global/g, '');
        if (beforeLength !== name.length) {
            return '.' + name;
        }
        var segments = name.split(':');
        name = that.selectorFn(segments.shift());
        if (!map[name]) {
            map[name] = that.projectionFn(that.id++, name);
        }
        var pseudo = '';
        if (segments.length > 0) {
            pseudo = ':' + segments.join(':');
        }
        return '.' + map[name] + pseudo;
    });
};

module.exports = SelectorMap;
