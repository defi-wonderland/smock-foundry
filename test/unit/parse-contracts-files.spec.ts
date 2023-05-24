import { getContractsNames } from '../../src/get-contracts-names';
import { promises as fsPromises } from 'fs';
import chai, { expect } from 'chai';
import * as sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';

// Enable chai-as-promised plugin
chai.use(chaiAsPromised);

describe('getContractsNames', () => {
    it('should return an array of contract names', async () => {
        const contractNames = await getContractsNames();
        expect(contractNames).to.be.an('array');

        const targetDir = "./solidity/contracts";
        const contractDirs = await fsPromises.readdir(targetDir);
        expect(contractNames).to.deep.equal(contractDirs);
    });

    it('should throw an error when targetDir is invalid', async () => {
        const invalidTargetDir = './invalid/directory';
        const readdirStub = sinon.stub(fsPromises, 'readdir').rejects(new Error(`Invalid target directory: ${invalidTargetDir}`));
        await expect(getContractsNames()).to.be.rejectedWith(Error, `Invalid target directory: ${invalidTargetDir}`);
    
        readdirStub.restore();
    });
});