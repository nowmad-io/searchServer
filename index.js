require('dotenv').config();

const algoliasearch = require('algoliasearch');
const firebase = require('firebase');

// configure firebase
firebase.initializeApp({
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const database = firebase.database();

// configure algolia
const algolia = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);
const index = algolia.initIndex(process.env.ALGOLIA_INDEX_NAME);

const usersRef = database.ref('/users');
usersRef.on('child_added', addOrUpdateIndexRecord);
usersRef.on('child_changed', addOrUpdateIndexRecord);
usersRef.on('child_removed', deleteIndexRecord);

function addOrUpdateIndexRecord(user) {
  // Get Firebase object
  const record = user.val();
  // Specify Algolia's objectID using the Firebase object key
  record.objectID = user.key;
  // Add or update object
  index
    .saveObject(record)
    .then(() => {
      console.log('Firebase object indexed in Algolia', record.objectID);
    })
    .catch(error => {
      console.error('Error when indexing user into Algolia', error);
      process.exit(1);
    });
}

function deleteIndexRecord(user) {
  // Get Algolia's objectID from the Firebase object key
  const objectID = user.key;
  // Remove the object from Algolia
  index
    .deleteObject(objectID)
    .then(() => {
      console.log('Firebase object deleted from Algolia', objectID);
    })
    .catch(error => {
      console.error('Error when deleting user from Algolia', error);
      process.exit(1);
    });
}
