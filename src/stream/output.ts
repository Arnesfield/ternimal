import readline from 'readline';
import { Transform } from 'stream';
import { PauseOptions } from '../types/pause.types.js';
import { ResumeOptions } from '../types/resume.types.js';
import { colorize } from './colorize.js';
import { Input } from './input.js';

interface WriteBuffer {
  name: 'stdout' | 'stderr';
  chunk: any;
  encoding: BufferEncoding;
  callback(error: Error | null | undefined): void;
}

function pipe(from: Transform, to: NodeJS.WritableStream) {
  // colorize transform stream if stream (stdout/stderr) does so
  colorize(from, to);
  from.pipe(to);
}

/** Console output stream to write before the prompt line. */
export class Output<
  Interface extends readline.Interface | readline.promises.Interface
> {
  readonly stdout: Transform;
  readonly stderr: Transform;
  readonly paused: Omit<PauseOptions, 'stdin'> = {};
  // maintain one shared array for buffered writes for
  // both stdout and stderr to properly keep order of writes
  private readonly writes: WriteBuffer[] = [];

  constructor(private readonly input: Input<Interface>) {
    this.stdout = this.transform('stdout');
    this.stderr = this.transform('stderr');
    this.init();
  }

  // NOTE: make sure to call this before updating input streams
  unpipe(): void {
    // unpipe all may be destructive so
    // unpipe destination streams only
    this.stdout.unpipe(this.input.stdout);
    this.stderr.unpipe(this.input.stderr || this.input.stdout);
  }

  init(): void {
    pipe(this.stdout, this.input.stdout);
    pipe(this.stderr, this.input.stderr || this.input.stdout);
  }

  pause(options: PauseOptions | undefined): void {
    // fallback to current value if not pausing
    this.paused.stdout = !options || options.stdout || this.paused.stdout;
    this.paused.stderr = !options || options.stderr || this.paused.stderr;
  }

  flush(options: ResumeOptions | undefined): void {
    const out = !options || options.stdout;
    const err = !options || options.stderr;
    // skip if not resuming anything
    if (!out && !err) return;
    if (out) this.paused.stdout = false;
    if (err) this.paused.stderr = false;
    // only flush and remove entries for the resumed streams
    // NOTE: taken from https://stackoverflow.com/a/15996017/7013346
    for (let index = this.writes.length; index-- > 0; ) {
      const w = this.writes[index];
      if ((out && w.name === 'stdout') || (err && w.name === 'stderr')) {
        this.input[w.name]?.write(w.chunk, w.encoding, w.callback);
        this.writes.splice(index, 1);
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
        const chunks = self.input.chunks();
        chunks && this.push(chunks.before);
        this.push(chunk, encoding);
        chunks && this.push(chunks.after);
      }
      self.input.refreshLine();
      callback();
    };
    return transform;
  }
}
