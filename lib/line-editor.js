var os = require('os');

function LineEditor(source) {
    this.lines = source.split(/\r?\n/);
}
LineEditor.prototype.indexOf = function(keyword, start) {
    var index = this.lines[start.line - 1].indexOf(keyword, start.column - 1);
    if (~index) {
        return { line: start.line, column: index + 1 };
    }
    for (var i = start.line; i < this.lines.length; i++) {
        index = this.lines[i].indexOf(keyword);
        if (~index) {
            return { line: i + 1, column: index + 1 };
        }
    }
    return {
        line: -1,
        column: -1
    };
};
LineEditor.prototype.replaceRange = function(start, end, string) {
    var left = this.lines[start.line - 1] ? this.lines[start.line - 1].substr(0, start.column - 1) : '';
    var right = this.lines[end.line - 1] ? this.lines[end.line - 1].substr(end.column) : '';
    this.lines.splice.apply(this.lines, [start.line - 1, end.line - start.line + 1].concat((left + string + right).split(os.EOL)));
};
LineEditor.prototype.build = function() {
    return this.lines.join(os.EOL);
};

module.exports = LineEditor;
