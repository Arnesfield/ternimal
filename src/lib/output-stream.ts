import { Interface } from 'readline';
import { Transform } from 'stream';
import { PauseOptions, PauseStreamOptions } from '../core/core.types.js';
import { getChunks } from './get-chunks.js';
import { refreshLine } from './refresh-line.js';

interface WriteBuffer {
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
  readonly stdout: WrappedStream;
  readonly stderr: WrappedStream | null;
  // maintain one shared array for buffered writes for
  // both stdout and stderr to properly keep order of writes
  private readonly writes: WriteBuffer[] = [];

  constructor(
    rl: Interface,
    stdout: NodeJS.WritableStream,
    stderr: NodeJS.WritableStream | undefined
  ) {
    this.stdout = wrap(stdout, rl, this.writes);
    this.stderr = stderr ? wrap(stderr, rl, this.writes) : null;
  }

  pause(options: PauseOptions = {}): void {
    // only update when not yet paused
    this.stdout.paused ??= options.stdout ?? true;
    if (this.stderr) {
      this.stderr.paused ??= options.stderr ?? true;
    }
  }

  flush(): void {
    this.stdout.paused = null;
    if (this.stderr) {
      this.stderr.paused = null;
    }
    // splice first before writing to remove all items in buffer array
    for (const write of this.writes.splice(0, this.writes.length)) {
      write.stream.write(write.chunk, write.encoding, write.callback);
    }
  }
}

function wrap(
  stream: NodeJS.WritableStream,
  rl: Interface,
  writes: WriteBuffer[]
) {
  const transform = new Transform();
  const result: WrappedStream = { stream: transform };
  transform._transform = function (chunk, encoding, callback) {
    // save to buffer when paused
    if (
      result.paused &&
      (result.paused === true || (result.paused.buffer ?? true))
    ) {
      writes.push({ stream, chunk, encoding, callback });
      return;
    }
    if (!result.paused) {
      // save before and after chunks
      const chunks = getChunks(rl, stream);
      chunks && this.push(chunks.before);
      this.push(chunk, encoding);
      chunks && this.push(chunks.after);
    }
    refreshLine(rl, stream);
    callback();
  };
  // make sure to pipe to write stream
  transform.pipe(stream);
  return result;
}
