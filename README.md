[npm-img]: https://img.shields.io/npm/v/ternimal.svg
[npm-url]: https://www.npmjs.com/package/ternimal
[preview]: https://gist.githubusercontent.com/Arnesfield/a952aead855ff6ec9b18b7fb4e794256/raw/3564db0cf6084dfcc579b2de6bdd2ed7f4817eca/preview.gif

> [!CAUTION]
>
> **_This is an alpha version of the package: currently untested and is considered unstable. Usage and API may change at any time. Use at your own risk._**

# ternimal

[![npm][npm-img]][npm-url]

Minimal readline interface wrapper for interactive CLIs.

> This project was inspired by [serverline](https://www.npmjs.com/package/serverline).

![ternimal example preview][preview]

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

term.rl.on('line', () => {
  term.prompt(true);
});
term.prompt();
term.console.log('Hello %s!', 'World');
```

```text
Hello World!
>
```

> [!TIP]
>
> See [example](example) usage that leverages popular CLI tools like [inquirer](https://www.npmjs.com/package/inquirer) and [ora](https://www.npmjs.com/package/ora).

### create(init)

Type: `(init: InitFunction) => Terminal`

The `create(init)` function returns the terminal instance and requires an init function that returns an options object.

## Options

### options.rl

Type: `readline.Interface | readline.promises.Interface`

The readline interface instance.

The `input` and `output` streams for this instance should match the [`stdin`](#optionsstdin) and [`stdout`](#optionsstdout) options respectively.

### options.stdin

Type: `NodeJS.ReadableStream`

The `stdin` read stream. Should match the `input` from the [`rl`](#optionsrl) instance.

### options.stdout

Type: `NodeJS.WritableStream`

The `stdout` write stream. Should match the `output` from the [`rl`](#optionsrl) instance.

### options.stderr

Type: `NodeJS.WritableStream` (optional)

The `stderr` write stream.

## API

The `Terminal` object contains the following properties and methods.

### rl

Type: `readline.Interface | readline.promises.Interface`

The readline interface instance.

This is the same `rl` instance passed through the terminal options.

### console

Type: `Console`

The console instance.

Logging through this console will write the output above the prompt line. The write streams ([`stdout`](#stdout), [`stderr`](#stderr)) for this console can be [paused](#pauseoptions), [resumed](#resumeoptions), and [muted](#pauseoptions).

### stdout

Type: `NodeJS.WritableStream`

The `stdout` write stream of [`console`](#console).

### stderr

Type: `NodeJS.WritableStream | undefined`

The `stderr` write stream of [`console`](#console) if provided.

### raw

Type: `object`

The read and write streams from the provided options.

- `raw.stdin` - The `stdin` read stream.
- `raw.stdout` - The `stdout` write stream.
- `raw.stderr` - The `stderr` write stream if provided.

### status

Type: `object`

Get the prompt state and the statuses of the streams.

```javascript
terminal.status.active(); // boolean
terminal.status.stdin(); // 'paused' | 'resumed'
terminal.status.stdout(); // 'paused' | 'resumed' | 'muted'
terminal.status.stderr(); // 'paused' | 'resumed' | 'muted'
```

### active(active?)

Type: `(active?: boolean) => this`

Set the prompt state manually (default `active` value: `true`). The prompt state is set to active when calling [`prompt`](#prompt) and is set to inactive when a `line` event is emitted by the [`rl`](#rl) instance.

When the prompt state is active:

- Output logs from [`console`](#console) are displayed above the prompt line.
- [`refreshLine`](#refreshlineforce) is enabled.

### prompt()

Type: `(preserveCursor?: boolean) => this`

Call `rl.prompt()` and set the prompt state to [active](#activeactive).

It is recommended to use this instead of calling `rl.prompt()` directly to properly update and keep track of the prompt state.

The prompt state is reset every time a `line` event is emitted by the [`rl`](#rl) instance.

### setPrompt(prompt)

Type: `(prompt: string) => this`

Set the prompt with `rl.setPrompt()` and call [`refreshLine`](#refreshlineforce).

### pause(options?)

Type: `(options?: PauseOptions) => this`

Pause the read (`stdin`) and write (`stdout`, `stderr`) streams.

By default, all streams are paused unless options are provided.

```javascript
// pause all streams
terminal.pause();
// pause by options
terminal.pause({
  stdin: true,
  stdout: { mute: false }, // boolean or object
  stderr: { mute: true } // boolean or object
});
```

Chunks are buffered when the write streams (`stdout`, `stderr`) are paused and are then flushed and written once resumed. Set the mute option to drop these chunks instead.

Note that this pauses the raw stdin directly via [`raw.stdin.pause()`](#raw) instead of `rl.pause()`.

### resume(options?)

Type: `(options?: ResumeOptions) => this`

Resume the read (`stdin`) and write (`stdout`, `stderr`) streams.

By default, all streams are resumed unless options are provided.

```javascript
// resume all streams
terminal.resume();
// resume stdout only
terminal.resume({ stdout: true });
```

Note that this resumes the raw stdin directly via [`raw.stdin.resume()`](#raw) instead of `rl.resume()`.

### setLine(line, refresh?)

Type: `(line: string, refresh?: boolean) => this`

Set the `rl.line` and call [`refreshLine`](#refreshlineforce).

Set the `refresh` option to call [`refreshLine`](#refreshlineforce) after setting the line (default: `true`).

### refreshLine(force?)

Type: `(force?: boolean) => this`

Refresh the [`rl`](#rl) instance prompt line.

This is disabled if `rl.terminal` is `false` or if the prompt is not active. Update the prompt state with [`prompt`](#prompt) or [`active`](#activeactive).

Set `force` option to `true` to ignore the prompt state.

### use(setup)

Type: `(setup: SetupFunction) => MaybePromise<void>`

Add and run a setup function. This function is rerun when the terminal is [reinitialized](#reinitinit).

The setup function can return an optional cleanup function that is run for [`deinit`](#deinitclose).

### reinit(init?)

Type: `(init?: InitFunction) => MaybePromise<void>`

Reinitialize the terminal and rerun all setup functions.

Make sure to run the [`deinit`](#deinitclose) method first before reinitializing the terminal.

### deinit(close?)

Type: `(close?: boolean) => MaybePromise<void>`

Run the cleanup functions returned from the setup functions and close the [`rl`](#rl) instance.

Set the `close` option to `false` to skip calling `rl.close()`.

## License

Licensed under the [MIT License](LICENSE).
