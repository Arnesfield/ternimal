[npm-img]: https://img.shields.io/npm/v/ternimal.svg
[npm-url]: https://www.npmjs.com/package/ternimal

> [!CAUTION]
>
> **_This is an alpha version of the package: currently untested and is considered unstable. Usage and API may change at any time. Use at your own risk._**
>
> **_Additionally, this README document is currently a work in progress and may not reflect the current API._**

# ternimal

[![npm][npm-img]][npm-url]

Minimal readline interface wrapper for interactive CLIs.

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

const term = create(() => ({
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr, // optional
  rl: readline.createInterface({
    prompt: '> ',
    input: process.stdin, // should match options.stdin
    output: process.stdout // should match options.stdout
  })
}));

term.rl.prompt();
term.rl.on('line', () => {
  term.rl.prompt(true);
});
term.console.log('Hello %s!', 'World');
```

```text
Hello World!
>
```

> [!TIP]
>
> See [example](example) usage that leverages popular CLI tools like [inquirer](https://www.npmjs.com/package/inquirer) and [ora](https://www.npmjs.com/package/ora).

## Options

The `create(init)` function requires an init function that returns an options object.

### options.rl

Type: `readline.Interface | readline.promises.Interface`

The readline interface instance.

### options.stdin

Type: `NodeJS.ReadableStream`

The `stdin` read stream. Should match the `input` from the `rl` instance.

### options.stdout

Type: `NodeJS.WritableStream`

The `stdout` write stream. Should match the `output` from the `rl` instance.

### options.stderr

Type: `NodeJS.WritableStream` (optional)

The `stderr` write stream.

## Terminal

The `create(init)` function returns a `Terminal` object.

### rl

Type: `readline.Interface | readline.promises.Interface`

The readline interface instance.

This is the same `rl` instance passed through the terminal options.

### console

Type: `Console`

The console instance.

Logging through this console will write the output above the prompt line. The write streams ([`stdout`](#stdout), [`stderr`](#stderr)) for this console can be paused and resumed.

### stdout

Type: `NodeJS.WritableStream`

The `stdout` write stream of [`console`](#console).

### stderr

Type: `NodeJS.WritableStream | undefined`

The `stderr` write stream of [`console`](#console) if provided.

### raw

Type: `object`

The read and write streams from provided options.

- `raw.stdin` - The `stdin` read stream.
- `raw.stdout` - The `stdout` write stream.
- `raw.stderr` - The `stderr` write stream.

These streams are the same references passed through the terminal options.

### paused()

Type: `() => Paused`

Check if the streams are paused.

```javascript
// paused object
{ stdin: false, stdout: false, stderr: false }
```

### pause(options?)

Type: `(options?: PauseOptions) => this`

Pause the read (`stdin`) and write (`stdout`, `stderr`) streams.

Pass an options object to specify what streams to pause.

```javascript
terminal.pause({
  stdin: true, // default for all stream options
  stdout: { buffer: true }, // default buffer option
  stderr: { buffer: false }
});
```

Setting the `buffer` option will buffer chunks from the write streams (`stdout`, `stderr`) when paused. These chunks are flushed and written once resumed.

Note that this paused the raw stdin directly via [`raw.stdin.pause()`](#raw) instead of `rl.pause()`.

### resume(options?)

Type: `(options?: ResumeOptions) => this`

Resume read (`stdin`) and write (`stdout`, `stderr`) streams.

Pass an options object to specify what streams to resume.

```javascript
terminal.resume({
  stdin: true, // default
  stdout: true, // default
  stderr: true // default
});
```

Note that this resumes the raw stdin directly via [`raw.stdin.resume()`](#raw) instead of `rl.resume()`.

### setPrompt(prompt)

Type: `(prompt: string) => this`

Set the prompt with `rl.setPrompt()` and call [`refreshLine`](#refreshline).

### setLine(line, refresh?)

Type: `(line: string, refresh?: boolean) => this`

Set the `rl.line` and call [`refreshLine`](#refreshline).

### refreshLine()

Type: `() => this`

Refresh the [`rl`](#rl) instance prompt line.

## License

Licensed under the [MIT License](LICENSE).
