const fs = require('fs');
const path = require('path');

/**
 * Copies the src/templates folder to the dist/templates folder
 */
const copyTemplates = () => {
  try {
    // TODO: Make sure this copies all partials
    fs.cpSync('src/templates', 'dist/templates', { recursive: true, overwrite: true });
  } catch (err) {
    console.error(err);
  }
};

copyTemplates();
