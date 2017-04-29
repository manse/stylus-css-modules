var SYMBOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
var SYMBOL_LENGTH = SYMBOL.length;

module.exports = {
    toBase: function(value) {
        var str = '';
        do {
            str += SYMBOL[value % SYMBOL_LENGTH];
            value = Math.floor(value / SYMBOL_LENGTH);
        } while (value > 0);
        return str;
    }
};
