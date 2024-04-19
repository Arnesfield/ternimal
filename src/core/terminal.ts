import { Console } from 'console';
import readline from 'readline';
import { IO } from '../stream/io.js';
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
  readonly #io: IO<Interface>;
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
    this.#io = new IO(rl, stdout, stderr);
    // references to stdout and stderr transform streams should not change!
    this.console = new Console({
      stdout: this.#io.tout,
      stderr: this.#io.terr
    });
  }

  get rl() {
    return this.#io.rl;
  }

  get stdout() {
    return this.#io.tout;
  }

  get stderr() {
    // output stderr is piped to stdout if no input stderr
    return this.#io.stderr ? this.#io.terr : undefined;
  }

  active(active = true) {
    this.#io.prompted = active;
    return this;
  }

  prompt(preserveCursor?: boolean) {
    this.#io.rl.prompt(preserveCursor);
    return this.active();
  }

  setPrompt(prompt: string): this {
    this.rl.setPrompt(prompt);
    return this.refreshLine();
  }

  pause(options?: T.PauseOptions) {
    if (!options || options.stdin) {
      this.raw.stdin.pause();
    }
    this.#io.pause(options);
    return this;
  }

  resume(options?: T.ResumeOptions) {
    if (!options || options.stdin) {
      this.raw.stdin.resume();
    }
    this.#io.flush(options);
    return this;
  }

  status() {
    return {
      stdin: getStatus(this.raw.stdin.isPaused()),
      stdout: getStatus(this.#io.paused.stdout),
      stderr: getStatus(this.#io.paused.stderr)
    };
  }

  setLine(line: string, refresh = true): this {
    (this.rl as Interface & { line: string }).line = line;
    return refresh ? this.refreshLine() : this;
  }

  refreshLine(force?: boolean): this {
    this.#io.refreshLine(force);
    return this;
  }

  async #use(
    setups: T.SetupFunction<Interface, Stdin, Stdout, Stderr>[],
    context: T.Context
  ) {
    for (const setup of setups) {
      const result = setup(this, context);
      // conditional await so that it does not pause execution for sync
      const cleanup =
        !result || typeof result === 'function' ? result : await result;
      if (typeof cleanup === 'function') {
        this.#cleanup.push(cleanup);
      }
    }
  }

  // not async, return promise!
  use(setup: T.SetupFunction<Interface, Stdin, Stdout, Stderr>) {
    this.#setup.push(setup);
    return this.#use([setup], { reinit: false });
  }

  // not async, return promise!
  reinit(init?: T.InitFunction<Interface, Stdin, Stdout, Stderr>) {
    this.#init = typeof init === 'function' ? init : this.#init;
    const context: T.Context = { reinit: true };
    const { rl, stdin, stdout, stderr } = this.#init(this, context);
    type NotReadonly<T> = { -readonly [P in keyof T]: T[P] };
    type Raw = NotReadonly<typeof this.raw>;
    // set updated streams
    // only update rl and streams to input after unpipe
    this.#io.deinit();
    this.#io.rl = rl;
    (this.raw as Raw).stdin = stdin;
    this.#io.stdout = (this.raw as Raw).stdout = stdout;
    this.#io.stderr = (this.raw as Raw).stderr = stderr as Stderr;
    // pipe transform streams to updated streams
    this.#io.init();
    // run setup functions
    return this.#use(this.#setup, context);
  }

  async deinit(close = true) {
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
}
