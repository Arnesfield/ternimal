import { Interface, ReadLineOptions } from 'readline';

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

/** The initialize options. */
export interface Options {
  /** The options to create the `readline.Interface` instance. */
  readline?: Omit<ReadLineOptions, 'input' | 'output'>;
  /**
   * The `stdin` read stream.
   * @default process.stdin
   */
  stdin?: NodeJS.ReadableStream;
  /**
   * The `stdout` write stream.
   * @default process.stdout
   */
  stdout?: NodeJS.WritableStream;
  /**
   * The `stderr` write stream.
   * @default process.stderr
   */
  stderr?: NodeJS.WritableStream;
}

/** The terminal instance. */
export interface Terminal {
  /** The `readline.Interface` instance. */
  readonly rl: Interface;
  /** The console instance. */
  readonly console: Console;
  /** The `stdin` read stream of {@linkcode rl}. */
  readonly stdin: NodeJS.ReadableStream;
  /** The `stdout` write stream of {@linkcode console}. */
  readonly stdout: NodeJS.WritableStream;
  /** The `stderr` write stream of {@linkcode console}. */
  readonly stderr: NodeJS.WritableStream;
  /**
   * Check if the stream is paused.
   * @param stream The stream to check.
   * @returns `true` if paused.
   */
  isPaused(stream: 'stdin' | 'stdout' | 'stderr'): boolean;
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
