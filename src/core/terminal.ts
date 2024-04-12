import { Console } from 'console';
import { Interface, createInterface } from 'readline';
import * as T from '../core/core.types.js';
import { RlInterface } from '../lib/internal.types.js';
import { OutputStream } from '../lib/output-stream.js';
import { refreshLine } from '../lib/refresh-line.js';

/**
 * Initialize terminal.
 * @param options The initialize options.
 * @returns The terminal.
 */
export function init(options: T.Options = {}): T.Terminal {
  return new Terminal(options);
}

class Terminal implements T.Terminal {
  readonly #input: NodeJS.ReadStream;
  readonly #output: OutputStream;
  readonly console: Console;
  readonly interface: Interface;

  constructor(options: T.Options) {
    const input = (this.#input = options.stdin || process.stdin);
    const output = options.stdout || process.stdout;
    const stderr = options.stderr || process.stderr;
    this.interface = createInterface({ ...options.readline, input, output });
    this.#output = new OutputStream(this.interface, output, stderr);
    this.console = new Console(this.#output.streams);
  }

  isPaused() {
    return this.#input.isPaused();
  }

  pause(options: T.PauseOptions) {
    if (this.isPaused()) {
      return false;
    }
    this.interface.pause();
    this.#output.pause(options);
    return true;
  }

  resume() {
    if (!this.isPaused()) {
      return false;
    }
    this.#input.resume();
    this.#output.flush();
    return true;
  }

  setPrompt(prompt: string): this {
    this.interface.setPrompt(prompt);
    return this.refreshLine();
  }

  setLine(line: string): this {
    (this.interface as RlInterface).line = line;
    return this.refreshLine();
  }

  refreshLine(): this {
    refreshLine(this.interface);
    return this;
  }
}
