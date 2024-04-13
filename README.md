[npm-img]: https://img.shields.io/npm/v/ternimal.svg
[npm-url]: https://www.npmjs.com/package/ternimal

> [!CAUTION]
>
> **_This is an alpha version of the package: currently untested and is considered unstable. Usage and API may change at any time. Use at your own risk._**

# ternimal

[![npm][npm-img]][npm-url]

Minimal readline interface wrapper that fixes the prompt below output logs.

> This project was inspired by [serverline](https://www.npmjs.com/package/serverline).

## Install

```sh
npm install ternimal
```

## Usage

Import the module ([ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)):

```javascript
import readline from 'readline';
import create from 'ternimal';

const rl = readline.createInterface({
  prompt: '> ',
  input: process.stdin, // should match options.stdin
  output: process.stdout // should match options.stdout
});
const term = create({
  rl, // required
  stdin: process.stdin, // required
  stdout: process.stdout, // default
  stderr: process.stderr // default
});

term.rl.prompt();
term.rl.on('line', () => {
  term.setPrompt('> ');
});
term.console.log('Hello World!');
term.console.log('equal:', rl === term.rl);
```

```text
Hello World!
equal: true
>
```

> [!NOTE]
>
> TODO: README is a work in progress.

## License

Licensed under the [MIT License](LICENSE).
