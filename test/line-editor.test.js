var LineEditor = require('../lib/line-editor');

test('replace single line', function() {
    var le = new LineEditor(`AAAAAA`);
    le.replaceRange({line: 1, column: 3}, {line: 1, column: 4}, 'BB');
    expect(le.build()).toBe(`AABBAA`);
});

test('replace single line overflow column', function() {
    var le = new LineEditor(`AAAAAA`);
    le.replaceRange({line: 1, column: 3}, {line: 1, column: 100}, 'BB');
    expect(le.build()).toBe(`AABB`);
});

test('replace single line overflow line', function() {
    var le = new LineEditor(`AAAAAA`);
    le.replaceRange({line: 1, column: 3}, {line: 100, column: 1}, 'BB');
    expect(le.build()).toBe(`AABB`);
});

test('replace multiple line', function() {
    var le = new LineEditor(`AAAAAA\nAAAAAA`);
    le.replaceRange({line: 1, column: 3}, {line: 2, column: 4}, 'BB');
    expect(le.build()).toBe(`AABBAA`);
});

test('replace multiple line overflow column', function() {
    var le = new LineEditor(`AAAAAA\nAAAAAA`);
    le.replaceRange({line: 1, column: 3}, {line: 2, column: 100}, 'BB');
    expect(le.build()).toBe(`AABB`);
});

test('replace single line with multiple line', function() {
    var le = new LineEditor(`AAAAAA`);
    le.replaceRange({line: 1, column: 3}, {line: 1, column: 4}, `BB\nCC`);
    expect(le.build()).toBe(`AABB\nCCAA`);
});

test('replace multiple line with multiple line', function() {
    var le = new LineEditor(`AAAAAA\nAAAAAA`);
    le.replaceRange({line: 1, column: 3}, {line: 2, column: 4}, `BB\nCC`);
    expect(le.build()).toBe(`AABB\nCCAA`);
});

test('find position', function() {
    var le = new LineEditor(`APPLE\nBANANA`);
    expect(le.indexOf('A', {line: 1, column: 1})).toMatchObject({line: 1, column: 1});
    expect(le.indexOf('A', {line: 1, column: 2})).toMatchObject({line: 2, column: 2});
    expect(le.indexOf('NA', {line: 2, column: 3})).toMatchObject({line: 2, column: 3});
    expect(le.indexOf('NA', {line: 2, column: 4})).toMatchObject({line: 2, column: 5});
    expect(le.indexOf('NA', {line: 2, column: 6})).toMatchObject({line: -1, column: -1});
    expect(le.indexOf('PPAP', {line: 1, column: 1})).toMatchObject({line: -1, column: -1});
});
