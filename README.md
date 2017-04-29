# stylus-modules

A Stylus plugin to mangle selectors and generate selector map js

## Installation

```
npm install stylus-modules
```

## Usage

Specify `stylus-modules` as stylus plugin.

```sh
stylus --use stylus-modules --with "{dest:'./dest/script', target: 'ts'}" -w src/Main.styl -o dest/styles/main.css
```

### Option

```js
// all options are optional
{
  dest: './src/scripts/styles/',
  // string, base path for selector map script (default: same dir as the input .styl)

  target: 'ts',
  // string, export format. 'ts' or 'js' (default: 'js')

  indent: 4,
  // number, indent level (default: 4)

  querySelector: false,
  // boolean, if true, prepend '.' to selector (default: false)
}

```

## Result

`stylus-modules` automatically mangle all CSS selector names, and outputs converted selector name map to js.

### Input

**Main.styl**
```styl
.textCenter
    text-align center

.textMuted
    color #888

@import "Button.styl";
```

**Button.styl**
```styl
.common
    background #ccc
    padding 10px

.blue
    @extends .common
    background #0f0
    color white
```

### Output

**main.css**
```css
._d {
  text-align: center;
}
._c {
  color: #888;
}
._b,._a {
  background: #ccc;
  padding: 10px;
}
._a {
  background: #0f0;
  color: #fff;
}
```

**Main.ts**
```ts
const Main = {
    "textMuted": "_c",
    "textCenter": "_d"
};
export {Main};
```

**Button.ts**
```ts
const Button = {
    "blue": "_a",
    "common": "_b"
};
export {Button};
```

You can obtain the style refer to selector map js. Example below:

```ts
import {Button} from './Button';

const button = document.createElement('button');
button.className = Button.blue; // '_a'
```

## hyperscript

in [hyperscript](https://github.com/hyperhype/hyperscript), class name must be specified in `.query.string.format`.
`queryString` option is set to true, `.` is prepended to the mangled selector name.

**Button.ts**
```ts
const Button = {
    "blue": "._a",
    "common": "._b"
};
export {Button};
```

```ts
import {Button} from './Button';

div('.container', [
    div('.row', [
        div(`.col-xs-3${Button.blue}`, [ 'Hello' ]); // '.col-xs-3._a'
    ])
])
```

## Notes

- `stylus-modules` cannot solve `@extend` or `@mixin` between different .styl files. Please be careful or contribute to fix.
