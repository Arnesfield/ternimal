import { Interface } from 'readline';
import stringWidth from 'string-width';

// get chunks to write before and after the main chunk to write before the prompt line
export function getChunks(
  rl: Interface,
  stream: NodeJS.WriteStream
): { before: string; after: string } {
  const lines = Math.ceil(
    (stringWidth(rl.line) + stringWidth(rl.getPrompt())) /
      (stream.columns || 80)
  );
  return {
    before:
      '\n\r' + // keep current line
      `\x1b[${lines}A` + // cursor up lines
      '\x1b[0J', // clear from cursor to end of screen
    after: '\n'.repeat(lines > 0 ? lines - 1 : 0)
  };
}
