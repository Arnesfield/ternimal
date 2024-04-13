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
  Interface extends readline.Interface | readline.promises.Interface
>(options: T.Options<Interface>): T.Terminal<Interface> {
  return new Terminal(options);
}

class Terminal<
  Interface extends readline.Interface | readline.promises.Interface
> implements T.Terminal<Interface>
{
  #paused: T.PauseOptions | null | undefined;
  readonly #output: OutputStream;
  readonly rl: Interface;
  readonly console: Console;
  readonly stdout: T.Terminal<Interface>['stdout'];
  readonly stderr: T.Terminal<Interface>['stderr'];
  readonly raw: T.Terminal<Interface>['raw'];

  constructor(options: T.Options<Interface>) {
    const { rl, stdin, stdout, stderr } = options;
    this.raw = { stdin, stdout, stderr };
    this.#output = new OutputStream((this.rl = rl), stdout, stderr);
    this.stdout = this.#output.stdout.stream;
    this.stderr = this.#output.stderr?.stream || this.stdout;
    this.console = new Console({ stdout: this.stdout, stderr: this.stderr });
  }

  paused() {
    return {
      stdin: this.raw.stdin.isPaused(),
      stdout: !!(this.#paused && (this.#paused.stdout ?? true)),
      stderr: !!(this.#paused && (this.#paused.stderr ?? true))
    };
  }

  pause(options: T.PauseOptions = {}) {
    if (!this.#paused) {
      this.#paused = options;
      if (options.stdin ?? true) {
        this.rl.pause();
      }
      this.#output.pause(options);
    }
    return this;
  }

  resume() {
    if (this.#paused) {
      this.#paused = null;
      this.rl.resume();
      this.#output.flush();
    }
    return this;
  }

  close() {
    // include this redundant method just in case the
    // close implementation changes in the future (e.g. cleanup)
    this.rl.close();
  }

  setPrompt(prompt: string): this {
    this.rl.setPrompt(prompt);
    return this.refreshLine();
  }

  setLine(line: string): this {
    (this.rl as RlInterface).line = line;
    return this.refreshLine();
  }

  refreshLine(): this {
    if (!this.paused().stdout) {
      refreshLine(this.rl, this.raw.stdout);
    }
    return this;
  }
}
