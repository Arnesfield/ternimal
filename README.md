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
  rl,
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr // optional
});

rl === term.rl; // true
term.rl.prompt();
term.rl.on('line', () => {
  term.rl.prompt();
});
term.console.log('Hello %s!', 'World');
```

```text
Hello World!
>
```

> [!NOTE]
>
> TODO: README is a work in progress.

## License

Licensed under the [MIT License](LICENSE).
