import readline from 'readline';

/** The terminal options. */
export interface Options<
  Interface extends readline.Interface | readline.promises.Interface,
  Stdin extends NodeJS.ReadableStream,
  Stdout extends NodeJS.WritableStream,
  Stderr extends NodeJS.WritableStream | undefined
> {
  /** The readline interface instance. */
  rl: Interface;
  /**
   * The `stdin` read stream.
   * Should match the `input` from the {@linkcode rl} instance.
   */
  stdin: Stdin;
  /**
   * The `stdout` write stream.
   * Should match the `output` from the {@linkcode rl} instance.
   */
  stdout: Stdout;
  /** The `stderr` write stream. */
  stderr?: Stderr;
}
