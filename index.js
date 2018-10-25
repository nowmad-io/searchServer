require('dotenv').config();
const express = require('express');
const AlgoliaFirebase = require('./algoliaFirebase');

const algoliaFirebase = new AlgoliaFirebase(
  {
    credential: JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_KEY, 'base64').toString()),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },
  process.env.FIREBASE_INDEX_NAME,
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

app.get('/api/search', (req, res) => {
  const user = req.query.user || '';
  if (user) {
    return algoliaFirebase.algolia.search(user)
      .then((content) => res.json(content));
  }
  res.json({ hits: [] })
});

app.get('*', (req, res) => res.redirect('https://nowmad.io'));

const port = process.env.PORT || 4000;

app.listen(port, () => console.log('app listening on port: ', port));
