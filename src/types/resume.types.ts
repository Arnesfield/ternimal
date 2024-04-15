/** The resume options. */
export interface ResumeOptions {
  /** Resume the `stdin` read stream. */
  stdin?: boolean;
  /** Resume the `stdout` write stream. */
  stdout?: boolean;
  /** Resume the `stderr` write stream. */
  stderr?: boolean;
}
