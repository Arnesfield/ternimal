import { Console } from 'console';
import { Interface, createInterface } from 'readline';
import * as T from '../core/core.types.js';
import { RlInterface } from '../lib/internal.types.js';
import { OutputStream } from '../lib/output-stream.js';
import { refreshLine } from '../lib/refresh-line.js';

/**
 * Initialize terminal.
 * @param options The terminal options.
 * @returns The terminal instance.
 */
export function init(options: T.Options = {}): T.Terminal {
  return new Terminal(options);
}

class Terminal implements T.Terminal {
  #paused = false;
  readonly #output: OutputStream;
  readonly rl: Interface;
  readonly console: Console;

  constructor(options: T.Options) {
    const input = options.stdin || process.stdin;
    const output = options.stdout || process.stdout;
    const stderr = options.stderr || process.stderr;
    this.rl = createInterface({ ...options.readline, input, output })
      .on('pause', () => (this.#paused = true))
      .on('resume', () => (this.#paused = false));
    this.#output = new OutputStream(this.rl, output, stderr);
    this.console = new Console(this.#output.streams);
  }

  isPaused() {
    return this.#paused;
  }

  pause(options: T.PauseOptions) {
    if (!this.isPaused()) {
      this.rl.pause();
      this.#output.pause(options);
    }
    return this;
  }

  resume() {
    if (this.isPaused()) {
      this.rl.resume();
      this.#output.flush();
    }
    return this;
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
    refreshLine(this.rl);
    return this;
  }
}
