import readline from 'readline';

/** The write stream pause options. */
export interface PauseStreamOptions {
  /**
   * Buffer chunks from write streams (stdout, stderr) when paused.
   * These chunks are flushed and written once resumed.
   * @default true
   */
  buffer?: boolean;
}

/** The pause options. */
export interface PauseOptions {
  /**
   * Pause the `stdin` read stream.
   * @default true
   */
  stdin?: boolean;
  /**
   * Set boolean or options for pausing the `stdout` write stream.
   * @default true
   */
  stdout?: boolean | PauseStreamOptions;
  /**
   * Set boolean or options for pausing the `stderr` write stream.
   * @default true
   */
  stderr?: boolean | PauseStreamOptions;
}

/** The resume options. */
export interface ResumeOptions {
  /**
   * Resume the `stdin` read stream.
   * @default true
   */
  stdin?: boolean;
  /**
   * Resume the `stdout` write stream.
   * @default true
   */
  stdout?: boolean;
  /**
   * Resume the `stderr` write stream.
   * @default true
   */
  stderr?: boolean;
}

/** The paused streams. */
export interface Paused {
  /** Determines if `stdin` read stream is paused. */
  stdin: boolean;
  /** Determines if `stdout` write stream is paused. */
  stdout: boolean;
  /** Determines if `stderr` write stream is paused. */
  stderr: boolean;
}

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

/** The terminal instance. */
export interface Terminal<
  Interface extends readline.Interface | readline.promises.Interface,
  Stdin extends NodeJS.ReadableStream,
  Stdout extends NodeJS.WritableStream,
  Stderr extends NodeJS.WritableStream | undefined
> {
  /** The readline interface instance. */
  readonly rl: Interface;
  /** The console instance. */
  readonly console: Console;
  /** The `stdout` write stream of {@linkcode console}. */
  readonly stdout: NodeJS.WritableStream;
  /** The `stderr` write stream of {@linkcode console} if provided. */
  readonly stderr: NodeJS.WritableStream | undefined;
  /** The read and write streams from provided options. */
  readonly raw: {
    /** The `stdin` read stream. */
    readonly stdin: Stdin;
    /** The `stdout` write stream. */
    readonly stdout: Stdout;
    /** The `stderr` write stream. */
    readonly stderr: Stderr;
  };
  /**
   * Check if the streams are paused.
   * @returns The paused streams.
   */
  paused(): Paused;
  /**
   * Pause the read (`stdin`) and write (`stdout`, `stderr`) streams.
   * @param options The pause options.
   * @returns `this` for chaining.
   */
  pause(options?: PauseOptions): this;
  /**
   * Resume read (`stdin`) and write (`stdout`, `stderr`) streams.
   * @param options The resume options.
   * @returns `this` for chaining.
   */
  resume(options?: ResumeOptions): this;
  /**
   * Set the prompt with `rl.setPrompt()` and call {@linkcode refreshLine}.
   * @param prompt The prompt.
   * @returns `this` for chaining.
   */
  setPrompt(prompt: string): this;
  /**
   * Set the `rl.line` and call {@linkcode refreshLine}.
   * @param line The line.
   * @param [refresh=true] Whether to call {@linkcode refreshLine} after setting the line.
   * @returns `this` for chaining.
   */
  setLine(line: string, refresh?: boolean): this;
  /**
   * Refresh the {@linkcode rl} line.
   * @returns `this` for chaining.
   */
  refreshLine(): this;
}
