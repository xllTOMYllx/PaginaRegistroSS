const express = require('express');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
