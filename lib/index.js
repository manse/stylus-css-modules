var fs = require('fs');
var path = require('path');
var mangle = require('./mangle');
var color = require('colors');
var sourceMapResolve = require('source-map-resolve');
var mkdirp = require('mkdirp');
var camelCase = require('camelcase');

/**
 * @param {object} pluginOptions
 * {
 *   dest: './src/scripts/styles/', // base path for selector map script.
 *   target: 'ts', // export format. 'ts' or 'js', can also be a function that receives the filename and selector map as params
 *   indent: 4, // indent level
 *   querySelector: false, // if true, prepend '.' as query selector
 *   projection: (id, originalClassName) => '_' + id, // mangle converter
 *   camelCase: true, // if true, convert selector name to camelCase. .text-center {} => {"textCenter": "_a"}
 * }
 */
module.exports = function(pluginOptions) {
    return function(style) {
        pluginOptions = pluginOptions || {};
        style = this || style;

        style.options.sourcemap = {
            inline: true
        };
        var srcDir = path.dirname(style.options.filename);
        var destDir = path.dirname(style.options.dest);
        var scriptDir = pluginOptions.dest || destDir;
        var target = ({'ts':'ts','js':'js'})[pluginOptions.target] || 'js';
        var ts = target === 'ts';
        var querySelector = !!pluginOptions.querySelector;
        var indent = typeof pluginOptions.indent === 'number' ? pluginOptions.indent : 4;

        style.on('end', function(err, css) {
            var sourceMap = sourceMapResolve.resolveSourceMapSync(css, null, fs.readFile);
            var mangled = mangle(css, sourceMap.map, {
                camelCase: pluginOptions.camelCase,
                projection: pluginOptions.projection
            });
            if (typeof pluginOptions.target === 'function') {
                pluginOptions.target(style.options.filename, mangled.map);
            } else {
                for (var i in mangled.map) {
                    var relativePath = path.relative(srcDir, path.resolve(destDir, i));
                    if (~relativePath.indexOf('..')) {
                        console.log(color.yellow('Traversal path "' + relativePath + '" is not output.'));
                        continue;
                    }
                    var styl = path.parse(relativePath);
                    var variableName = camelCase(styl.name);
                    var outputPath = path.resolve(scriptDir, relativePath.replace(new RegExp(styl.ext + '$'), '.' + target));
                    var source;
                    if (ts) {
                        source = 'const ' + variableName + ' = ';
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
                        source += 'export {' + variableName + "};\n";
                    }
                    if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath).toString('utf8') !== source) {
                        mkdirp.sync(path.dirname(outputPath));
                        fs.writeFileSync(outputPath, source);
                    }
                }
            }
            return mangled.css;
        });
    };
};