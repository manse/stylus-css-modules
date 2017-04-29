var fs = require('fs');
var path = require('path');
var mangle = require('./mangle');
var color = require('colors');
var sourceMapResolve = require('source-map-resolve');
var mkdirp = require('mkdirp');

/**
 * @param {object} option
 * {
 *   dest: './src/scripts/styles/', // base path for selector map script.
 *   target: 'ts', // export format. 'ts' or 'js'
 *   indent: 4, // indent level
 *   querySelector: false, // if true, prepend '.' as query selector
 * }
 */
module.exports = function(option) {
    return function(style) {
        option = option || {};
        style = this || style;

        style.options.sourcemap = {
            inline: true
        };
        var srcDir = path.dirname(style.options.filename);
        var destDir = path.dirname(style.options.dest);
        var scriptDir = option.dest || destDir;
        var target = ({'ts':'ts','js':'js'})[option.target] || 'js';
        var ts = target === 'ts';
        var querySelector = !!option.querySelector;
        var indent = typeof option.indent === 'number' ? option.indent : 4;

        style.on('end', function(err, css) {
            var sourceMap = sourceMapResolve.resolveSourceMapSync(css, null, fs.readFile);
            var mangled = mangle(css, sourceMap.map, {});
            for (var i in mangled.map) {
                var relativePath = path.relative(srcDir, path.resolve(destDir, i));
                if (~relativePath.indexOf('..')) {
                    console.log(color.yellow('Traversal path "' + relativePath + '" is not output.'));
                    continue;
                }
                var styl = path.parse(relativePath);
                var outputPath = path.resolve(scriptDir, relativePath.replace(new RegExp(styl.ext + '$'), '.' + target));
                var source;
                if (ts) {
                    source = 'const ' + styl.name + ' = ';
                } else {
                    source = 'module.exports = ';
                }
                var map = mangled.map[i];
                if (querySelector) {
                    for (var j in map) {
                        map[j] = '.' + map[j];
                    }
                }
                source += JSON.stringify(map, null, indent) + ";\n";
                if (ts) {
                    source += 'export {' + styl.name + "};\n";
                }
                mkdirp.sync(path.dirname(outputPath));
                fs.writeFileSync(outputPath, source);
            }
            return mangled.css;
        });
    };
};