#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {generateMockContracts} from './index';

(async () => {
  const { contractsDir, outDir, genDir } = getProcessArguments();
  generateMockContracts(contractsDir, outDir, genDir);
})();

function getProcessArguments() {
  return yargs(hideBin(process.argv))
    .options({
      contractsDir: {
        describe: 'Contracts directory',
        demandOption: true,
        type: 'string',
      },
      outDir: {
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