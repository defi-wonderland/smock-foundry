#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateMockContracts } from './index';

(async () => {
  const { contracts, out, mocks, ignore } = getProcessArguments();
  generateMockContracts(contracts, out, mocks, ignore);
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
      out: {
        describe: 'Foundry compiled output directory',
        default: './out',
        type: 'string',
      },
      mocks: {
        describe: `Generated contracts directory`,
        default: './solidity/test/mocks',
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
