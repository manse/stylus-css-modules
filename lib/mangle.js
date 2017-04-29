var css = require('css');
var SourceMap = require('source-map');
var SelectorMap = require('./selector-map');
var LineEditor = require('./line-editor');
var string = require('./string');

function mangle(cssSource, sourceMap, option) {
    var smc = new SourceMap.SourceMapConsumer(sourceMap);
    var ast = css.parse(cssSource);
    var rules = ast.stylesheet.rules;
    var selectorMap = new SelectorMap(option.projection || function(id) {
        return '_' + string.toBase(id);
    });
    var lineEditor = new LineEditor(cssSource);
    for (var i = rules.length - 1; i >= 0; i--) {
        var rule = rules[i];
        if (!rule.selectors || !rule.selectors.length) continue;
        var source = smc.originalPositionFor(rule.position.start).source;
        var mangledSelector = rule.selectors.map(function(selector) {
            return selectorMap.map(selector, source);
        });
        var index = lineEditor.indexOf('{', rule.position.start);
        if (index.line === -1) {
            throw 'invalid css syntax';
        }
        index.column--;
        lineEditor.replaceRange(rule.position.start, index, mangledSelector + ' ');
    }
    return {
        css: lineEditor.build(),
        map: selectorMap.mangleNames
    };
}

module.exports = mangle;
