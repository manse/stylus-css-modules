var camelCase = require('camelcase');

function SelectorMap(projection) {
    this.id = 0;
    this.projection = projection;
    this.mangleNames = {};
}
SelectorMap.prototype.map = function(selector, filename) {
    var map;
    var beforeLength = selector.length;
    selector = selector.replace(/:\s*global\s*$/, '');
    if (selector.length !== beforeLength) {
        return selector;
    }
    if (!this.mangleNames[filename]) {
        map = this.mangleNames[filename] = {};
    } else {
        map = this.mangleNames[filename];
    }
    var that = this;
    return selector.replace(/\.([\w\-]+)/g, function(_match, name) {
        name = camelCase(name);
        if (!map[name]) {
            map[name] = that.projection(that.id++, name);
        }
        return '.' + map[name];
    });
};

module.exports = SelectorMap;
