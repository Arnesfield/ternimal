import { Console } from 'console';
import readline from 'readline';
import { Input } from '../stream/input.js';
import { Output } from '../stream/output.js';
import { getStatus } from '../stream/status.js';
import * as T from '../types/index.js';

/**
 * Create the terminal instance.
 * @param init The initialize function.
 * @returns The terminal instance.
 */
export function create<
  Interface extends readline.Interface | readline.promises.Interface,
  Stdin extends NodeJS.ReadableStream,
  Stdout extends NodeJS.WritableStream,
  Stderr extends NodeJS.WritableStream | undefined
>(
  init: T.InitFunction<Interface, Stdin, Stdout, Stderr>
): T.Terminal<Interface, Stdin, Stdout, Stderr> {
  return new Terminal(init);
}

class Terminal<
  Interface extends readline.Interface | readline.promises.Interface,
  Stdin extends NodeJS.ReadableStream,
  Stdout extends NodeJS.WritableStream,
  Stderr extends NodeJS.WritableStream | undefined
> implements T.Terminal<Interface, Stdin, Stdout, Stderr>
{
  readonly #input: Input<Interface>;
  readonly #output: Output<Interface>;
  #init: T.InitFunction<Interface, Stdin, Stdout, Stderr>;
  readonly #setup: T.SetupFunction<Interface, Stdin, Stdout, Stderr>[] = [];
  readonly #cleanup: (() => T.MaybePromise<void>)[] = [];
  readonly console: Console;
  readonly raw: T.Terminal<Interface, Stdin, Stdout, Stderr>['raw'];

  constructor(init: T.InitFunction<Interface, Stdin, Stdout, Stderr>) {
    this.#init = init;
    const { rl, stdin, stdout, stderr } = init(null, { reinit: false });
    // allow stderr to be undefined
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.raw = { stdin, stdout, stderr };
    this.#input = new Input(rl, stdout, stderr);
    this.#output = new Output(this.#input);
    // references to stdout and stderr transform streams should not change!
    this.console = new Console({
      stdout: this.#output.stdout,
      stderr: this.#output.stderr
    });
  }

  get rl() {
    return this.#input.rl;
  }

  get stdout() {
    return this.#output.stdout;
  }

  get stderr() {
    // output stderr is piped to stdout if no input stderr
    return this.#input.stderr ? this.#output.stderr : undefined;
  }

  status() {
    return {
      stdin: getStatus(this.raw.stdin.isPaused()),
      stdout: getStatus(this.#output.paused.stdout),
      stderr: getStatus(this.#output.paused.stderr)
    };
  }

  pause(options?: T.PauseOptions) {
    if (!options || options.stdin) {
      this.raw.stdin.pause();
    }
    this.#output.pause(options);
    return this;
  }

  resume(options?: T.ResumeOptions) {
    if (!options || options.stdin) {
      this.raw.stdin.resume();
    }
    this.#output.flush(options);
    return this;
  }

  setPrompt(prompt: string): this {
    this.rl.setPrompt(prompt);
    return this.refreshLine();
  }

  setLine(line: string, refresh = true): this {
    (this.rl as Interface & { line: string }).line = line;
    return refresh ? this.refreshLine() : this;
  }

  refreshLine(): this {
    this.#input.refreshLine();
    return this;
  }

  async use(setup: T.SetupFunction<Interface, Stdin, Stdout, Stderr>) {
    this.#setup.push(setup);
    const result = setup(this, { reinit: false });
    // conditional await so that it does not pause execution for sync
    const cleanup =
      !result || typeof result === 'function' ? result : await result;
    if (typeof cleanup === 'function') {
      this.#cleanup.push(cleanup);
    }
  }

  async cleanup(close = true) {
    // clear up cleanup array, then run cleanup and close rl
    for (const cleanup of this.#cleanup.splice(0, this.#cleanup.length)) {
      const result = cleanup();
      // conditional await so that it does not pause execution for sync
      result && (await result);
    }
    if (close) {
      this.rl.close();
    }
  }

  async reinit(init?: T.InitFunction<Interface, Stdin, Stdout, Stderr>) {
    if (typeof init === 'function') {
      this.#init = init;
    }
    const context: T.InitContext = { reinit: true };
    const { rl, stdin, stdout, stderr } = this.#init(this, context);
    type NotReadonly<T> = { -readonly [P in keyof T]: T[P] };
    type Raw = NotReadonly<typeof this.raw>;
    // set updated streams
    this.#output.unpipe();
    // only update rl and streams to input after unpipe
    this.#input.rl = rl;
    (this.raw as Raw).stdin = stdin;
    this.#input.stdout = (this.raw as Raw).stdout = stdout;
    this.#input.stderr = (this.raw as Raw).stderr = stderr as Stderr;
    // update output and console to use updated streams
    this.#output.init();
    // run setup functions
    for (const setup of this.#setup) {
      // NOTE: duplicate of use() for proper conditional await
      const result = setup(this, context);
      // conditional await so that it does not pause execution for sync
      const cleanup =
        !result || typeof result === 'function' ? result : await result;
      if (typeof cleanup === 'function') {
        this.#cleanup.push(cleanup);
      }
    }
  }
}
