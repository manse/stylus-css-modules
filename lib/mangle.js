var css = require('css');
var SourceMap = require('source-map');
var SelectorMap = require('./selector-map');
var LineEditor = require('./line-editor');
var string = require('./string');
var camelCase = require('camelcase');
var os = require('os');

function mangle(cssSource, sourceMap, option) {
    var smc = new SourceMap.SourceMapConsumer(sourceMap);
    var ast = css.parse(cssSource);
    var rules = ast.stylesheet.rules;
    var camelCaseFn = option.camelCase ? camelCase : function(str) { return str; };
    var projection = option.projection || function(id) { return '_' + string.toBase(id) };
    var selectorMap = new SelectorMap(camelCaseFn, projection);
    var lineEditor = new LineEditor(cssSource);
    var lastSelectors = [];
    var lastSource = '';

    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (!rule.selectors || !rule.selectors.length) continue;

        var extend = false;
        if (lastSelectors.length === rule.selectors.length) {
            extend = true;
            for (var j = 0; j < lastSelectors.length; j++) {
                if (rule.selectors[j].indexOf(lastSelectors[j]) !== 0) {
                    extend = false;
                    break;
                }
            }
        }
        lastSelectors = rule.selectors;
        var source;
        if (extend) {
            source = lastSource;
        } else {
            source = lastSource = smc.originalPositionFor(rule.position.start).source;
        }
        var mangledSelectors = rule.selectors.map(function(selector) {
            return selectorMap.map(selector, source);
        });
        var index = lineEditor.indexOf('{', rule.position.start);
        if (index.line === -1) {
            throw 'invalid css syntax';
        }
        index.column--;
        lineEditor.replaceRange(rule.position.start, index, mangledSelectors.join("," + os.EOL) + ' ');
    }
    return {
        css: lineEditor.build(),
        map: selectorMap.mangleNames
    };
}

module.exports = mangle;
