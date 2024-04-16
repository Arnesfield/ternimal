import readline from 'readline';
import { Transform } from 'stream';
import { PauseOptions } from '../types/pause.types.js';
import { ResumeOptions } from '../types/resume.types.js';
import { getLines } from './lines.js';
import { pipe } from './pipe.js';

interface WriteBuffer {
  name: 'stdout' | 'stderr';
  chunk: any;
  encoding: BufferEncoding;
  callback(error: Error | null | undefined): void;
}

export type Interface = (readline.Interface | readline.promises.Interface) & {
  _refreshLine?(): void;
};

// control rl and streams
export class IO<
  TInterface extends readline.Interface | readline.promises.Interface
> {
  prompted = false;
  readonly tout = this.transform('stdout');
  readonly terr = this.transform('stderr');
  readonly paused: Omit<PauseOptions, 'stdin'> = {};
  // maintain one shared array for buffered writes for
  // both stdout and stderr to properly keep order of writes
  private readonly writes: WriteBuffer[] = [];

  constructor(
    // allow replacing these instances
    public rl: TInterface & Interface,
    public stdout: NodeJS.WritableStream,
    public stderr: NodeJS.WritableStream | undefined
  ) {
    this.init();
  }

  init(): void {
    this.rl.on('line', () => (this.prompted = false));
    // pipe transform streams to provided streams
    pipe(this.tout, this.stdout);
    pipe(this.terr, this.stderr || this.stdout);
  }

  // NOTE: make sure to call this before replacing the streams
  deinit(): void {
    // unpipe all may be destructive so unpipe destination streams only
    this.tout.unpipe(this.stdout);
    this.terr.unpipe(this.stderr || this.stdout);
    // no need to remove rl line event listener
    // since it is probably removed in rl.close()
  }

  pause(options: Omit<PauseOptions, 'stdin'> | undefined): void {
    // fallback to current value if not pausing
    this.paused.stdout = !options || options.stdout || this.paused.stdout;
    this.paused.stderr = !options || options.stderr || this.paused.stderr;
  }

  flush(options: Omit<ResumeOptions, 'stdin'> | undefined): void {
    const out = !options || options.stdout;
    const err = !options || options.stderr;
    // skip if not resuming anything
    if (!out && !err) return;
    if (out) this.paused.stdout = false;
    if (err) this.paused.stderr = false;
    // only flush and remove entries for the resumed streams
    // NOTE: taken from https://stackoverflow.com/a/15996017/7013346
    for (let index = 0; index < this.writes.length; ) {
      const w = this.writes[index];
      if ((out && w.name === 'stdout') || (err && w.name === 'stderr')) {
        this[w.name]?.write(w.chunk, w.encoding, w.callback);
        this.writes.splice(index, 1);
      } else {
        index++;
      }
    }
  }

  private transform(name: 'stdout' | 'stderr') {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const transform = new Transform();
    transform._transform = function (chunk, encoding, callback) {
      // save to buffer when paused, but skip when muted
      const paused = self.paused[name];
      if (paused && (paused === true || !paused.mute)) {
        self.writes.push({ name, chunk, encoding, callback });
        return;
      }
      if (!paused) {
        // save before and after chunks
        const chunks = self.chunks();
        chunks && this.push(chunks.before);
        this.push(chunk, encoding);
        chunks && this.push(chunks.after);
      }
      self.refreshLine();
      callback();
    };
    return transform;
  }

  // get chunks to write before and after the main chunk to write before the prompt line
  chunks(): { before: string; after: string } | null {
    // only allow when columns number is set (tty)
    const cols = (this.stdout as NodeJS.WriteStream).columns;
    const lines =
      this.prompted &&
      this.rl.terminal &&
      typeof cols === 'number' &&
      isFinite(cols) &&
      cols > 0
        ? getLines(this.rl.getPrompt() + this.rl.line, cols)
        : 0;
    // make sure to only render these chunks when there is a line prompt
    return lines > 0
      ? {
          before:
            '\n\r' + // keep current line
            `\x1b[${lines}A` + // cursor up lines
            '\x1b[0J', // clear from cursor to end of screen
          after: '\n'.repeat(lines - 1)
        }
      : null;
  }

  refreshLine(): void {
    if (!this.prompted || !this.rl.terminal) {
      // do nothing
    } else if (typeof this.rl._refreshLine === 'function') {
      this.rl._refreshLine();
    } else {
      // NOTE: emitting resize event triggers refresh
      // see https://github.com/nodejs/node lib/internal/readline/interface.js
      // include data to differentiate
      // original resize (undefined) from workaround (refreshLine)
      this.stdout.emit('resize', { reason: 'refreshLine' });
    }
  }
}
