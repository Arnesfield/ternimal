/** The statuses of the streams (paused, resumed, muted). */
export interface Status {
  /** Status of the `stdin` read stream. */
  stdin: 'paused' | 'resumed';
  /** Status of the `stdout` write stream. */
  stdout: 'paused' | 'resumed' | 'muted';
  /** Status of the `stderr` write stream. */
  stderr: 'paused' | 'resumed' | 'muted';
}
