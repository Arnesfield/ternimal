import readline from 'readline';

// NOTE: internal

export type Interface = (readline.Interface | readline.promises.Interface) & {
  _refreshLine?(): void;
};
