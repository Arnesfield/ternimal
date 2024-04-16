/** The pause write stream options. */
export interface PauseStreamOptions {
  /**
   * Chunks are buffered when the write streams (`stdout`, `stderr`)
   * are paused and are then flushed and written once resumed.
   * Set the mute option to drop these chunks instead.
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
