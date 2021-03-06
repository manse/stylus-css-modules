var css = require('css');
var SourceMap = require('source-map');
var SelectorMap = require('./selector-map');
var LineEditor = require('./line-editor');
var string = require('./string');
var camelCase = require('camelcase');
var os = require('os');
var md5 = require('md5');

function mangle(cssSource, sourceMap, option) {
    var smc = new SourceMap.SourceMapConsumer(sourceMap);
    var ast = css.parse(cssSource);
    var rules = ast.stylesheet.rules;
    var camelCaseFn = option.camelCase ? camelCase : function(str) { return str; };
    var projection = option.projection || function(filename, name) { return '_' + md5(filename).substr(0, 7) + md5(name).substr(0, 7); };
    var selectorMap = new SelectorMap(camelCaseFn, projection);
    var lineEditor = new LineEditor(cssSource);
    var lastSelectors = [];
    var lastSource = '';

    function replaceAll(rules, fixedSource) {
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (rule.rules) {
                replaceAll(rule.rules, lastSource);
            }
            if (!rule.selectors || !rule.selectors.length) continue;

            var source;
            if (fixedSource) {
                source = fixedSource;
            } else {
                var extend = false;
                if (rule.selectors.length % lastSelectors.length === 0) {
                    extend = true;
                    for (var j = 0; j < rule.selectors.length; j++) {
                        var lastSelector = lastSelectors[j % lastSelectors.length];
                        if (rule.selectors[j].indexOf(lastSelector) !== 0 || rule.selectors[j].length <= lastSelector.length) {
                            extend = false;
                            break;
                        }
                    }
                }
                if (extend) {
                    source = lastSource;
                } else {
                    source = lastSource = smc.originalPositionFor(rule.position.start).source;
                    lastSelectors = rule.selectors;
                }
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
    }
    replaceAll(rules);

    return {
        css: lineEditor.build(),
        map: selectorMap.mangleNames
    };
}

module.exports = mangle;
