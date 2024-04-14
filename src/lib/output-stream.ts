import { Interface } from 'readline';
import { Transform } from 'stream';
import {
  PauseOptions,
  PauseStreamOptions,
  ResumeOptions
} from '../core/core.types.js';
import { getChunks } from './get-chunks.js';
import { refreshLine } from './refresh-line.js';

interface WriteBuffer {
  name: 'stdout' | 'stderr';
  stream: NodeJS.WritableStream;
  chunk: any;
  encoding: BufferEncoding;
  callback(error: Error | null | undefined): void;
}

export interface WrappedStream {
  // note that this stream is exposed to consumer
  stream: NodeJS.WritableStream;
  paused?: boolean | PauseStreamOptions | null;
}

/** Console output stream to write before the prompt line. */
export class OutputStream {
  readonly stdout: NodeJS.WritableStream;
  readonly stderr: NodeJS.WritableStream | undefined;
  readonly paused: {
    stdout?: boolean | PauseStreamOptions | null;
    stderr?: boolean | PauseStreamOptions | null;
  } = {};
  // maintain one shared array for buffered writes for
  // both stdout and stderr to properly keep order of writes
  private readonly writes: WriteBuffer[] = [];

  constructor(
    private readonly rl: Interface,
    stdout: NodeJS.WritableStream,
    stderr: NodeJS.WritableStream | undefined
  ) {
    this.stdout = this.transform('stdout', stdout);
    if (stderr) {
      this.stderr = this.transform('stderr', stderr);
    }
  }

  pause(options: PauseOptions): void {
    // only update when not yet paused
    this.paused.stdout ??= options.stdout ?? true;
    this.paused.stderr ??= options.stderr ?? true;
  }

  flush(options: ResumeOptions): void {
    const out = options.stdout ?? true;
    const err = options.stderr ?? true;
    // skip if not resuming
    if (!out && !err) return;
    if (out) this.paused.stdout = null;
    if (err) this.paused.stderr = null;
    // only flush and remove entries for the resumed streams
    // NOTE: taken from https://stackoverflow.com/a/15996017/7013346
    for (let index = this.writes.length; index-- > 0; ) {
      const w = this.writes[index];
      if ((out && w.name === 'stdout') || (err && w.name === 'stderr')) {
        w.stream.write(w.chunk, w.encoding, w.callback);
        this.writes.splice(index, 1);
      }
    }
  }

  private transform(name: 'stdout' | 'stderr', stream: NodeJS.WritableStream) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const transform = new Transform();
    transform._transform = function (chunk, encoding, callback) {
      // save to buffer when paused
      const paused = self.paused[name];
      if (paused && (paused === true || (paused.buffer ?? true))) {
        self.writes.push({ name, stream, chunk, encoding, callback });
        return;
      }
      if (!paused) {
        // save before and after chunks
        const chunks = getChunks(self.rl, stream);
        chunks && this.push(chunks.before);
        this.push(chunk, encoding);
        chunks && this.push(chunks.after);
      }
      refreshLine(self.rl, stream);
      callback();
    };
    // make sure to pipe to write stream
    transform.pipe(stream);
    return transform;
  }
}
