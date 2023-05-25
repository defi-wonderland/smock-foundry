import { getConstructor } from '../../src/get-constructor';
import { expect } from 'chai';

describe('getConstructor', () => {
  it('should return the constructor signature', async () => {
    const sourceFilePath = '../../out/Greeter.sol/Greeter.json';
    const ast = require(sourceFilePath).ast;

    const expectedConstructorSignature =
      'constructor(string _greeting, IERC20 _token) Greeter(_greeting, _token) {}';

    const constructorSignature = getConstructor(ast);

    expect(constructorSignature).to.equal(expectedConstructorSignature);
  });
});