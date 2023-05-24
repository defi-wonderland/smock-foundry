import { getConstructor } from '../../src/get-constructor';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('getConstructor', () => {
    it('should return the constructor signature', async () => {
      const sourceFilePath = '../out/Greeter.sol/Greeter.json';
  
      const expectedConstructorSignature =
        'constructor(string memory _greeting, IERC20  _token) Greeter(_greeting, _token) {}';
  
      const constructorSignature = await getConstructor(sourceFilePath);
  
      expect(constructorSignature).to.equal(expectedConstructorSignature);
  
      sinon.restore();
    });
  });