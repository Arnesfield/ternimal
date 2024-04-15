/** The statuses of the streams (resumed, paused, muted). */
export interface Status {
  /** Status of the `stdin` read stream. */
  stdin: 'resumed' | 'paused';
  /** Status of the `stdout` write stream. */
  stdout: 'resumed' | 'paused' | 'muted';
  /** Status of the `stderr` write stream. */
  stderr: 'resumed' | 'paused' | 'muted';
}
