const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/', (_req, res) => {
  res.send('Hello from Last Little Haven backend');
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
