require('dotenv').config();
const express = require('express');
const AlgoliaFirebase = require('./algoliaFirebase');

const algoliaFirebase = new AlgoliaFirebase(
  { databaseURL: process.env.FIREBASE_DATABASE_URL },
  {
    appId: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
  },
  process.env.ALGOLIA_INDEX_NAME,
);
const app = express();

function authorize(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.split(' ').length > 1 && auth.split(' ')[1];

  if (token && token === process.env.TOKEN) {
    next();
    return;
  }
  res.status(403).send();
}

app.get('/', (req, res) => res.redirect('https://nowmad.io'));

app.get('/api/search', (req, res) => {
  const user = req.query.user || '';
  if (user) {
    algoliaFirebase.algolia.search(user, (err, content) => {
      res.json(content);
    });
    return;
  }
  res.json({ hits: [] })
});

const port = process.env.PORT || 4000;

app.listen(port, () => console.log('app listening on port: ', port));
