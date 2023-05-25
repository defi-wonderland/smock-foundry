const fs = require('fs');
const path = require('path');

/**
 * Copies the mockContractTemplate.hbs file from the src/templates folder to the dist/templates folder
 */
const copyTemplate = () => {
  fs.mkdirSync(path.resolve(__dirname, 'dist/templates'));
  const templatePath = path.resolve(__dirname, 'src', 'templates', 'mockContractTemplate.hbs');
  const destinationPath = path.resolve(__dirname, 'dist/templates', 'mockContractTemplate.hbs');

  fs.copyFileSync(templatePath, destinationPath);
};

copyTemplate();