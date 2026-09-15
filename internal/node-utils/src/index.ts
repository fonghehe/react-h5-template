import type { Options, ResultPromise } from 'execa';

import { execa, parseCommandString } from 'execa';

export * from './monorepo';
export type { Package } from '@manypkg/get-packages';
export { consola } from 'consola';

export const execaCommand = (command: string, options: Options = {}): ResultPromise => {
  const [file, ...arguments_] = parseCommandString(command);
  if (!file) throw new Error('Command must not be empty');
  return execa(file, arguments_, options);
};
