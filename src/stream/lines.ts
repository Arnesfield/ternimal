import stringWidth from 'string-width';

export function getLines(value: string, max: number): number {
  // split by new line
  return value.split('\n').reduce((total, line, index, array) => {
    // add +1 for last line for cases where the cursor is on
    // the next line: the prompt line matches columns
    const diff = +(index >= array.length - 1);
    // since this iteration is one line, ensure at least one line
    const width = stringWidth(line) + diff || 1;
    return total + Math.ceil(width / max);
  }, 0);
}
