// NOTE: internal

import { Interface } from 'readline';

export interface RlInterface extends Interface {
  line: string;
  _refreshLine(): void;
}
