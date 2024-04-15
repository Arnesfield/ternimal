/** The pause write stream options. */
export interface PauseStreamOptions {
  /**
   * Disable buffering chunks when write streams (`stdout`, `stderr`) are paused.
   * Unless muted, these chunks are flushed and written once resumed.
   */
  mute?: boolean;
}

/** The pause options. */
export interface PauseOptions {
  /** Pause the `stdin` read stream. */
  stdin?: boolean;
  /** Pause the `stdout` write stream. */
  stdout?: boolean | PauseStreamOptions;
  /** Pause the `stderr` write stream. */
  stderr?: boolean | PauseStreamOptions;
}
