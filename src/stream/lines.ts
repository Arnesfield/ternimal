import stringWidth from 'string-width';

export function getLines(value: string, max: number): number {
  // split by new line. each part is at least one line (width || 1)
  return value
    .split('\n')
    .reduce(
      (total, line) => total + Math.ceil((stringWidth(line) || 1) / max),
      0
    );
}
