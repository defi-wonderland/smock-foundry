import { generateMockContracts } from "./index";

const defaultOutDir = './solidity/mockContracts';

yargs.command({
    command: 'mock-gen',
    describe: 'Generate mock contracts',
    builder: {
      contractsDir: {
        describe: 'Contracts directory (default: ./solidity/contracts)',
        demandOption: true, // User must specify this option
        type: 'string',
      },
      outDir: {
        describe: 'Foundry compiled output directory (default: ./out)',
        demandOption: true, // User must specify this option
        type: 'string',
      },
      genDir: {
        describe: `Generated contracts directory (default: ${defaultOutDir})`,
        default: defaultOutDir,
        type: 'string',
      },
    },
    handler: (argv) => {
      const { contractsDir, outDir, genDir } = argv;
      generateMockContracts(contractsDir, outDir, genDir);
    },
  });

yargs.usage('Usage: $0 [command] [options]')
  .help('h')
  .alias('h', 'help')
  .epilog(`Default output directory: ${defaultOutDir}`);

yargs.parse();
