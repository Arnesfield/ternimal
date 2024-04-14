import { Console } from 'console';
import readline from 'readline';
import * as T from '../core/core.types.js';
import { RlInterface } from '../lib/internal.types.js';
import { OutputStream } from '../lib/output-stream.js';
import { refreshLine } from '../lib/refresh-line.js';

/**
 * Create the terminal instance.
 * @param options The terminal options.
 * @returns The terminal instance.
 */
export function create<
  Interface extends readline.Interface | readline.promises.Interface,
  Stdin extends NodeJS.ReadableStream,
  Stdout extends NodeJS.WritableStream,
  Stderr extends NodeJS.WritableStream | undefined
>(
  options: T.Options<Interface, Stdin, Stdout, Stderr>
): T.Terminal<Interface, Stdin, Stdout, Stderr> {
  return new Terminal(options);
}

class Terminal<
  Interface extends readline.Interface | readline.promises.Interface,
  Stdin extends NodeJS.ReadableStream,
  Stdout extends NodeJS.WritableStream,
  Stderr extends NodeJS.WritableStream | undefined
> implements T.Terminal<Interface, Stdin, Stdout, Stderr>
{
  readonly #output: OutputStream;
  readonly rl: Interface;
  readonly console: Console;
  readonly stdout: NodeJS.WritableStream;
  readonly stderr: NodeJS.WritableStream | undefined;
  readonly raw: T.Terminal<Interface, Stdin, Stdout, Stderr>['raw'];

  constructor(options: T.Options<Interface, Stdin, Stdout, Stderr>) {
    const { rl, stdin, stdout, stderr } = options;
    // allow stderr to be undefined
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.raw = { stdin, stdout, stderr };
    this.#output = new OutputStream((this.rl = rl), stdout, stderr);
    this.stdout = this.#output.stdout;
    this.stderr = this.#output.stderr;
    this.console = new Console({ stdout: this.stdout, stderr: this.stderr });
  }

  paused() {
    return {
      stdin: this.raw.stdin.isPaused(),
      stdout: !!this.#output.paused.stdout,
      stderr: !!this.#output.paused.stderr
    };
  }

  pause(options: T.PauseOptions = {}) {
    if (options.stdin ?? true) {
      this.rl.pause();
    }
    this.#output.pause(options);
    return this;
  }

  resume(options: T.ResumeOptions = {}) {
    if (options.stdin ?? true) {
      this.rl.resume();
    }
    this.#output.flush(options);
    return this;
  }

  setLine(line: string): this {
    (this.rl as RlInterface).line = line;
    return this;
  }

  refreshLine(): this {
    if (!this.paused().stdout) {
      refreshLine(this.rl, this.raw.stdout);
    }
    return this;
  }
}
