#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateMockContracts } from './index';

(async () => {
  const { contracts, mocks, ignore, root } = getProcessArguments();
  generateMockContracts(root, contracts, mocks, ignore);
})();

function getProcessArguments() {
  return yargs(hideBin(process.argv))
    .options({
      contracts: {
        describe: 'Contracts directories',
        demandOption: true,
        type: 'array',
        string: true,
      },
      root: {
        describe: 'Root directory',
        default: '.',
        type: 'string',
      },
      mocks: {
        describe: `Generated contracts directory`,
        default: './test/smock',
        type: 'string',
      },
      ignore: {
        describe: 'Ignore folders',
        default: [],
        type: 'array',
        string: true,
      },
    })
    .parseSync();
}
