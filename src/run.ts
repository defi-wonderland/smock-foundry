#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateMockContracts } from './index';

(async () => {
  const { contracts, out, genDir } = getProcessArguments();
  generateMockContracts(contracts, out, genDir);
})();

function getProcessArguments() {
  return yargs(hideBin(process.argv))
    .options({
      contracts: {
        describe: 'Contracts directory',
        demandOption: true,
        type: 'string',
      },
      out: {
        describe: 'Foundry compiled output directory',
        default: './out',
        type: 'string',
      },
      genDir: {
        describe: `Generated contracts directory`,
        default: './solidity/test/mock-contracts',
        type: 'string',
      },
    })
    .parseSync();
}
