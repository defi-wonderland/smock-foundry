const fs = require('fs');
const path = require('path');

/**
 * Copies the *.hbs files from the src/templates folder to the dist/templates folder
 */
const copyTemplates = () => {
  fs.mkdirSync(path.resolve(__dirname, 'dist/templates'));
  const templatePath = path.resolve(__dirname, 'src', 'templates', 'mockContractTemplate.hbs');
  const mockArrayTemplatePath = path.resolve(__dirname, 'src', 'templates', 'mockArrayStateVariableTemplate.hbs');
  const mockBasicStateVarTemplatePath = path.resolve(
    __dirname,
    'src',
    'templates',
    'mockBasicStateVariableTemplate.hbs'
  );
  const mockExternalFunctionTemplatePath = path.resolve(
    __dirname,
    'src',
    'templates',
    'mockExternalFunctionTemplate.hbs'
  );
  const mockInternalFunctionTemplatePath = path.resolve(
    __dirname,
    'src',
    'templates',
    'mockInternalFunctionTemplate.hbs'
  );
  const mockMappingTemplatePath = path.resolve(__dirname, 'src', 'templates', 'mockMappingStateVariableTemplate.hbs');
  const mockHelperTemplatePath = path.resolve(__dirname, 'src', 'templates', 'mockHelperTemplate.hbs');

  const destinationPath = path.resolve(__dirname, 'dist/templates', 'mockContractTemplate.hbs');
  const destinationArrayPath = path.resolve(__dirname, 'dist/templates', 'mockArrayStateVariableTemplate.hbs');
  const destinationBasicStateVarPath = path.resolve(__dirname, 'dist/templates', 'mockBasicStateVariableTemplate.hbs');
  const destinationExternalFunctionPath = path.resolve(__dirname, 'dist/templates', 'mockExternalFunctionTemplate.hbs');
  const destinationInternalFunctionPath = path.resolve(__dirname, 'dist/templates', 'mockInternalFunctionTemplate.hbs');
  const destinationMappingPath = path.resolve(__dirname, 'dist/templates', 'mockMappingStateVariableTemplate.hbs');
  const destinationHelperPath = path.resolve(__dirname, 'dist/templates', 'mockHelperTemplate.hbs');

  fs.copyFileSync(templatePath, destinationPath);
  fs.copyFileSync(mockArrayTemplatePath, destinationArrayPath);
  fs.copyFileSync(mockBasicStateVarTemplatePath, destinationBasicStateVarPath);
  fs.copyFileSync(mockExternalFunctionTemplatePath, destinationExternalFunctionPath);
  fs.copyFileSync(mockInternalFunctionTemplatePath, destinationInternalFunctionPath);
  fs.copyFileSync(mockMappingTemplatePath, destinationMappingPath);
  fs.copyFileSync(mockHelperTemplatePath, destinationHelperPath);
};

copyTemplates();
