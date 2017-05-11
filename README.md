# stylus-css-modules

A Stylus plugin to mangle selectors and generate selector map js

## Installation

```
npm install stylus-css-modules
```

## Usage

Specify `stylus-css-modules` as stylus plugin.

```sh
stylus --use stylus-css-modules --with "{dest:'./dest/script', target: 'ts'}" -w src/Main.styl -o dest/styles/main.css
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

  camelCase: false,
  // boolean, convert selector name to camelCase (default: false)
  //   false: `.text-center {}` => `{"text-center": "_a"}`
  //   true:  `.text-center {}` => `{"textCenter": "_a"}`
}

```

## Result

`stylus-css-modules` automatically mangle all CSS selector names, and outputs converted selector name map to js.

### Input

**main.styl**
```styl
.text-center
    text-align center

.text-muted
    color #888

@import "mixin.styl"
@import "button.styl";
@import "../traversal.styl";
```

**button.styl**
```styl
.common
    background #ccc
    padding 10px

.blue
    finger()
    background #0f0
    color white

.red:global
    finger()
    background #f00
    color white
```

**mixin.styl**
```styl
finger()
    position relative

    &:after
        content '👆'
        display inline
        left 0
        bottom -20px
        position absolute
```

### Output

**main.css**
```css
._a {
  text-align: center;
}
._b {
  color: #888;
}
._c {
  background: #ccc;
  padding: 10px;
}
._d {
  position: relative;
  background: #0f0;
  color: #fff;
}
._d:after {
  content: '👆';
  display: inline;
  left: 0;
  bottom: -20px;
  position: absolute;
}
.red {
  position: relative;
  background: #f00;
  color: #fff;
}
.red:after {
  content: '👆';
  display: inline;
  left: 0;
  bottom: -20px;
  position: absolute;
}
._e {
  color: #008000;
}
```

**Main.ts**
```ts
const main = {
    "textCenter": "_a",
    "textMuted": "_b"
};
export {main};
```

**Button.ts**
```ts
const button = {
    "common": "_c",
    "blue": "_d"
};
export {button};
```

You can obtain the style refer to selector map js. Example below:

```ts
import {button} from './button';

const elem = document.createElement('button');
elem.className = button.blue; // '_a'
```

## hyperscript

in [hyperscript](https://github.com/hyperhype/hyperscript), class name must be specified in `.query.selector.format`.
`querySelector` option is set to true, `.` is prepended to the mangled selector name.

**Button.ts**
```ts
const button = {
    "common": "._c",
    "blue": "._d"
};
export {button};
```

```ts
import {button} from './button';

div('.container', [
    div('.row', [
        div(`.col-xs-3${button.blue}`, [ 'Hello' ]); // '.col-xs-3._d'
    ])
])
```

## Notes

- `stylus-css-modules` cannot solve `@extend` mappings between different .styl files. Please be careful or
someone please make something better.
