[npm-img]: https://img.shields.io/npm/v/ternimal.svg
[npm-url]: https://www.npmjs.com/package/ternimal

> [!CAUTION]
>
> **_This is an alpha version of the package: currently untested and is considered unstable. Usage and API may change at any time. Use at your own risk._**

# ternimal

Minimal readline interface wrapper that fixes the prompt below output logs.

> This project was inspired by [serverline](https://www.npmjs.com/package/serverline).

## Install

```sh
npm install ternimal
```

## Usage

Import the module ([ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)):

```javascript
import create from 'ternimal';

const terminal = create();
terminal.rl.prompt('> ');
terminal.console.log('Hello World!');
```

```text
Hello World!
>
```

## License

Licensed under the [MIT License](LICENSE).
