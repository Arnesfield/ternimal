import { Interface } from 'readline';
import stringWidth from 'string-width';

// get chunks to write before and after the main chunk to write before the prompt line
export function getChunks(
  rl: Interface,
  stream: NodeJS.WritableStream
): { before: string; after: string } | null {
  // only allow when columns number is set (tty)
  const cols = (stream as NodeJS.WriteStream).columns;
  const lines =
    rl.terminal && typeof cols === 'number' && isFinite(cols) && cols > 0
      ? Math.ceil((stringWidth(rl.line) + stringWidth(rl.getPrompt())) / cols)
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
