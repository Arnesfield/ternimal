import readline from 'readline';
import { Options } from './options.types.js';
import { Terminal } from './terminal.types.js';

/** Type or promise type. */
export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>;

/** The context object. */
export interface Context {
  /** Determines if the terminal was reinitialized or not. */
  reinit: boolean;
}

/**
 * The initialize function.
 * @param terminal The terminal instance. For the first initialization, this value is `null`.
 * @param context The context object.
 * @returns The terminal options.
 */
export type InitFunction<
  Interface extends readline.Interface | readline.promises.Interface,
  Stdin extends NodeJS.ReadableStream,
  Stdout extends NodeJS.WritableStream,
  Stderr extends NodeJS.WritableStream | undefined
> = (
  terminal: Terminal<Interface, Stdin, Stdout, Stderr> | null,
  context: Context
) => Options<Interface, Stdin, Stdout, Stderr>;

/**
 * Setup function for {@linkcode Terminal.use}.
 * @param terminal The terminal instance.
 * @param context The context object.
 * @returns An optional cleanup function that is run for {@linkcode Terminal.cleanup}.
 */
export type SetupFunction<
  Interface extends readline.Interface | readline.promises.Interface,
  Stdin extends NodeJS.ReadableStream,
  Stdout extends NodeJS.WritableStream,
  Stderr extends NodeJS.WritableStream | undefined
> = (
  terminal: Terminal<Interface, Stdin, Stdout, Stderr>,
  context: Context
) => MaybePromise<void | (() => MaybePromise<void>)>;
