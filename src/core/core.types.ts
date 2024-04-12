import { Interface, ReadLineOptions } from 'readline';

/** The pause options. */
export interface PauseOptions {
  /**
   * Buffer chunks from write streams (stdout, stderr) when paused.
   * These chunks are flushed and written once resumed.
   * @default true
   */
  buffer?: boolean;
}

/** The initialize options. */
export interface Options {
  /** The readline options. */
  readline?: Omit<ReadLineOptions, 'input' | 'output'>;
  /**
   * The `stdin` read stream.
   * @default process.stdin
   */
  stdin?: NodeJS.ReadStream;
  /**
   * The `stdout` write stream.
   * @default process.stdout
   */
  stdout?: NodeJS.WriteStream;
  /**
   * The `stderr` write stream.
   * @default process.stderr
   */
  stderr?: NodeJS.WriteStream;
}

/** The terminal. */
export interface Terminal {
  /** The console instance. */
  readonly console: Console;
  /** The `readline.Interface` instance. */
  readonly interface: Interface;
  /**
   * Check if the read stream is paused.
   * @returns `true` if paused.
   */
  isPaused(): boolean;
  /**
   * Pause the read (stdin) and write (stdout, stderr) streams.
   * @param options The pause options.
   * @returns `false` if already paused.
   */
  pause(options: PauseOptions): boolean;
  /**
   * Resume read (stdin) and write (stdout, stderr) streams.
   * @returns `false` is not paused.
   */
  resume(): boolean;
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
   * Refresh the {@linkcode interface} line.
   * @returns `this` for chaining.
   */
  refreshLine(): this;
}
