#!/usr/bin/env node

const express = require('express');
const path = require('path');
const logger = require('morgan');

const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(logger('dev'));

function getModelFiles() {
  const modelsDir = 'my_models';
  return fs.readdirSync(modelsDir).flatMap(dir => {
    const fullPath = path.join(modelsDir, dir);
    if (fs.statSync(fullPath).isDirectory()) {
      const htmlFiles = fs.readdirSync(fullPath).filter(file => file.endsWith('.html'));
      return htmlFiles.map(file => path.join(modelsDir, dir, file));
    }
    return [];
  });
}

app.get('/models', (req, res) => {
  res.json(getModelFiles());
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
