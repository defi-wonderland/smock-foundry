import { getContractPaths } from '../../src/get-contracts-paths';
import { promises as fsPromises } from 'fs';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

// Enable chai-as-promised plugin
chai.use(chaiAsPromised);

describe('getContractPaths', () => {
    it('should return an array of contract names', async () => {
        const contractNames = getContractPaths();
        expect(contractNames).to.be.an('array');

        const targetDir = "./solidity/contracts";
        const contractDirs = await fsPromises.readdir(targetDir);
        expect(contractNames).to.deep.equal(contractDirs);
    });
});