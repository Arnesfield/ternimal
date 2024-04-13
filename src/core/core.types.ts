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
   * Pause `stdin` read stream.
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

/** The paused streams. */
export interface Paused {
  /** Determines if `stdin` read stream is paused. */
  stdin: boolean;
  /** Determines if `stdout` write stream is paused. */
  stdout: boolean;
  /** Determines if `stderr` write stream is paused. */
  stderr: boolean;
}

/** The initialize options. */
export interface Options<
  Interface extends readline.Interface | readline.promises.Interface
> {
  /** The readline interface instance. */
  rl: Interface;
  /**
   * The `stdin` read stream. Should match the
   * `input` from the {@linkcode rl} instance.
   */
  stdin: NodeJS.ReadableStream;
  /**
   * The `stdout` write stream. Should match the
   * `output` from the {@linkcode rl} instance.
   */
  stdout: NodeJS.WritableStream;
  /** The `stderr` write stream. */
  stderr?: NodeJS.WritableStream;
}

/** The terminal instance. */
export interface Terminal<
  Interface extends readline.Interface | readline.promises.Interface
> {
  /** The readline interface instance. */
  readonly rl: Interface;
  /** The console instance. */
  readonly console: Console;
  /** The `stdout` write stream of {@linkcode console}. */
  readonly stdout: NodeJS.WritableStream;
  /**
   * The `stderr` write stream of {@linkcode console}.
   *
   * If {@linkcode Options.stderr} was not provided,
   * this is the same as {@linkcode stdout}.
   */
  readonly stderr: NodeJS.WritableStream;
  /** The read and write streams from provided options. */
  readonly raw: {
    /** The `stdin` read stream. */
    readonly stdin: NodeJS.ReadableStream;
    /** The `stdout` write stream. */
    readonly stdout: NodeJS.WritableStream;
    /** The `stderr` write stream. */
    readonly stderr: NodeJS.WritableStream | undefined;
  };
  /**
   * Check if the streams are paused.
   * @returns The paused streams.
   */
  paused(): Paused;
  /**
   * Pause the read (`stdin`) and write (`stdout`, `stderr`) streams
   * only when not {@linkcode isPaused paused}.
   * @param options The pause options.
   * @returns `this` for chaining.
   */
  pause(options?: PauseOptions): this;
  /**
   * Resume read (`stdin`) and write (`stdout`, `stderr`) streams
   * only when {@linkcode isPaused paused}.
   * @returns `this` for chaining.
   */
  resume(): this;
  /** Close the {@linkcode rl} instance. */
  close(): void;
  /**
   * Set the prompt and call {@linkcode refreshLine}.
   * @param prompt The prompt.
   * @returns `this` for chaining.
   */
  setPrompt(prompt: string): this;
  /**
   * Set the line and call {@linkcode refreshLine}.
   * @param line The line.
   * @returns `this` for chaining.
   */
  setLine(line: string): this;
  /**
   * Refresh the {@linkcode rl} line.
   * @returns `this` for chaining.
   */
  refreshLine(): this;
}
