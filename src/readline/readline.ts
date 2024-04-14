import readline from 'readline';
import stringWidth from 'string-width';

export type Interface = (readline.Interface | readline.promises.Interface) & {
  _refreshLine?(): void;
};

// control rl and stream
export class Rl {
  constructor(
    private readonly rl: Interface,
    private readonly stream: NodeJS.WritableStream
  ) {}

  // get chunks to write before and after the main chunk to write before the prompt line
  chunks(): { before: string; after: string } | null {
    // only allow when columns number is set (tty)
    const cols = (this.stream as NodeJS.WriteStream).columns;
    const lines =
      this.rl.terminal && typeof cols === 'number' && isFinite(cols) && cols > 0
        ? // include +1 for cases where the cursor is on
          // the next line: the prompt line matches columns
          Math.ceil(
            (stringWidth(this.rl.getPrompt() + this.rl.line) + 1) / cols
          )
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
    if (!this.rl.terminal) {
      // do nothing
    } else if (typeof this.rl._refreshLine === 'function') {
      this.rl._refreshLine();
    } else {
      // NOTE: emitting resize event triggers refresh
      // see https://github.com/nodejs/node lib/internal/readline/interface.js
      // include data to differentiate
      // original resize (undefined) from workaround (refreshLine)
      this.stream.emit('resize', { reason: 'refreshLine' });
    }
  }
}
