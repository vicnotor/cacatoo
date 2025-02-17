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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/models', (req, res) => {
  res.json(getModelFiles());
});

// SSE (Server-Sent Events) for auto-reloading page after filechanges
app.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  res.write("data: connected\n\n");

  req.on("close", () => res.end());
});

app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
