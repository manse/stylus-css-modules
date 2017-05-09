var SelectorMap = require('../lib/selector-map');

function createSelectorMap() {
    return new SelectorMap(function(str) {
        return str;
    }, function(id) {
        return '_' + id;
    });
}

test('map', () => {
    var map = createSelectorMap();
    expect(map.map('.a,.a.b,#id,.a .b:after @media (){}', 'foo')).toBe('._0,._0._1,#id,._0 ._1:after @media (){}');
    expect(map.map('.a', 'foo')).toBe('._0');
    expect(map.map('.a', 'bar')).toBe('._2');
    expect(map.mangleNames.foo.a).toBe('_0');
    expect(map.mangleNames.foo.b).toBe('_1');
    expect(map.mangleNames.bar.a).toBe('_2');
});

test('global', () => {
    var map = createSelectorMap();
    expect(map.map('.a:global,.b,.c:global .d,.e .f:global', 'foo')).toBe('.a,._0,.c ._1,._2 .f');
});
