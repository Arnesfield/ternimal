import { Interface } from 'readline';
import { Writable } from 'stream';
import { PauseOptions } from '../core/core.types.js';
import { getChunks } from './get-chunks.js';
import { refreshLine } from './refresh-line.js';

interface WriteBuffer {
  stream: NodeJS.WritableStream;
  chunk: any;
  encoding: BufferEncoding;
  callback(error: Error | null | undefined): void;
}

/** Console output stream to write before the prompt line. */
export class OutputStream {
  private paused: PauseOptions | null | undefined;
  private readonly writes: WriteBuffer[] = [];
  readonly streams: {
    stdout: NodeJS.WritableStream;
    stderr: NodeJS.WritableStream;
  };

  constructor(
    rl: Interface,
    stdout: NodeJS.WritableStream,
    stderr: NodeJS.WritableStream
  ) {
    this.streams = {
      stdout: this.create(rl, stdout),
      stderr: this.create(rl, stderr)
    };
  }

  pause(options: PauseOptions = {}): void {
    this.paused = options;
  }

  flush(): void {
    this.paused = null;
    // splice first before writing to remove all items in buffer array
    for (const write of this.writes.splice(0, this.writes.length)) {
      write.stream.write(write.chunk, write.encoding, write.callback);
    }
  }

  private create(rl: Interface, stream: NodeJS.WritableStream) {
    const writable = new Writable();
    writable._write = (chunk, encoding, callback) => {
      // save to buffer when paused
      if (this.paused) {
        if (this.paused.buffer ?? true) {
          this.writes.push({ stream, chunk, encoding, callback });
        } else {
          callback();
        }
        return;
      }

      let count = 0;
      const total = rl.terminal ? 3 : 1;
      // end callback to handle refresh line
      const cb: typeof callback = error => {
        refreshLine(rl);
        // only fire callback at the end or if has error
        if (++count >= total || error) {
          callback(error);
        }
      };

      if (rl.terminal) {
        const chunks = getChunks(rl, stream);
        stream.write(chunks.before, cb);
        stream.write(chunk, encoding, cb);
        stream.write(chunks.after, cb);
      } else {
        stream.write(chunk, encoding, cb);
      }
    };
    return writable;
  }
}
