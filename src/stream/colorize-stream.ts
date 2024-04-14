// NOTE: see https://github.com/nodejs/node lib/internal/util/colors.js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error use NodeJS.WriteStream
export function colorizeStream(
  stream: NodeJS.WritableStream,
  stdout: NodeJS.WritableStream
): void;
export function colorizeStream(
  stream: NodeJS.WriteStream,
  stdout: NodeJS.WriteStream
): void {
  if (
    stdout.isTTY &&
    (typeof stdout.getColorDepth === 'function'
      ? stdout.getColorDepth() > 2
      : true)
  ) {
    // set this to trick node to add colors
    stream.isTTY = true;
  }
}
