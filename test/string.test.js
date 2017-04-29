var string = require('../lib/string');

test('toBase 0', () => {
    expect(string.toBase(0)).toBe('a');
});

test('toBase 1', () => {
    expect(string.toBase(1)).toBe('b');
});

test('toBase 62', () => {
    expect(string.toBase(62)).toBe('_');
});

test('toBase unique', () => {
    var total = 1000;
    var str = [];
    for (var i = 0; i < total; i++) {
        var base = string.toBase(i);
        if (str.indexOf(base) === -1) {
            str.push(base);
        }
    }
    expect(str.length).toBe(total);
});

test('toBase present something', () => {
    var total = 1000;
    var present = 0;
    for (var i = 0; i < total; i++) {
        var base = string.toBase(i);
        if (base.length) {
            present++;
        }
    }
    expect(present).toBe(total);
});
