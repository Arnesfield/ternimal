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
  #paused: T.PauseOptions | null | undefined;
  readonly #output: OutputStream;
  readonly rl: Interface;
  readonly console: Console;
  readonly stdin: NodeJS.ReadableStream;
  readonly stdout: NodeJS.WritableStream;
  readonly stderr: NodeJS.WritableStream;

  constructor(options: T.Options) {
    const input = (this.stdin = options.stdin || process.stdin);
    const output = options.stdout || process.stdout;
    const stderr = options.stderr || process.stderr;
    this.rl = createInterface({ ...options.readline, input, output });
    this.#output = new OutputStream(this.rl, output, stderr);
    this.stdout = this.#output.stdout.stream;
    this.stderr = this.#output.stderr.stream;
    this.console = new Console({ stdout: this.stdout, stderr: this.stderr });
  }

  paused() {
    return {
      stdin: this.stdin.isPaused(),
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
      refreshLine(this.rl);
    }
    return this;
  }
}
