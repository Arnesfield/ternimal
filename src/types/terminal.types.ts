import readline from 'readline';
import { InitFunction, MaybePromise, SetupFunction } from './init.types.js';
import { PauseOptions } from './pause.types.js';
import { ResumeOptions } from './resume.types.js';
import { Status } from './status.types.js';

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
   * Get the statuses of the streams (resumed, paused, muted).
   * @returns The stream statuses.
   */
  status(): Status;
  /**
   * Pause the read (`stdin`) and write (`stdout`, `stderr`) streams.
   *
   * By default, all streams are paused unless options are provided.
   * @param options The pause options.
   * @returns `this` for chaining.
   */
  pause(options?: PauseOptions): this;
  /**
   * Resume the read (`stdin`) and write (`stdout`, `stderr`) streams.
   *
   * By default, all streams are resumed unless options are provided.
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
   * Refresh the {@linkcode rl} instance prompt line.
   * @returns `this` for chaining.
   */
  refreshLine(): this;
  /**
   * Add a setup function that is rerun when the terminal is {@linkcode reinit reinitialized}.
   * @param setup The setup function.
   * @returns A promise to await this call if an async setup function were used.
   */
  use(
    setup: SetupFunction<Interface, Stdin, Stdout, Stderr>
  ): MaybePromise<void>;
  /**
   * Reinitialize the terminal and rerun all setup functions.
   *
   * Make sure to run the {@linkcode close} method first before reinitializing.
   * @param init Replace the existing `init` function.
   * @returns A promise to await this call if async setup functions were used.
   */
  reinit(
    init?: InitFunction<Interface, Stdin, Stdout, Stderr>
  ): MaybePromise<void>;
  /**
   * Run the cleanup functions returned from the setup functions
   * and close the {@linkcode rl} instance.
   * @param [close=true] Set to `false` to skip calling `rl.close()`.
   * @returns A promise to await this call if async cleanup functions were used.
   */
  cleanup(close?: boolean): MaybePromise<void>;
}
