import { Interface } from 'readline';
import stringWidth from 'string-width';

// get chunks to write before and after the main chunk to write before the prompt line
export function getChunks(
  rl: Interface,
  stream: NodeJS.WritableStream
): { before: string; after: string } {
  // ensure columns exists
  const { columns } = stream as NodeJS.WriteStream;
  const cols =
    typeof columns === 'number' && isFinite(columns) && columns > 0
      ? columns
      : 80;
  const lines = Math.ceil(
    (stringWidth(rl.line) + stringWidth(rl.getPrompt())) / cols
  );
  return {
    before:
      '\n\r' + // keep current line
      `\x1b[${lines}A` + // cursor up lines
      '\x1b[0J', // clear from cursor to end of screen
    after: '\n'.repeat(lines > 0 ? lines - 1 : 0)
  };
}
