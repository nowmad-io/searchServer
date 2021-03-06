"use strict";
const algoliasearch = require('algoliasearch');
const firebase = require('firebase-admin');

class AlgoliaFirebase {
  constructor(configFirebase, indexNameFirebase, configAlgolia, indexNameAlgolia) {
    this.firebase = firebase.initializeApp({
      ...configFirebase,
      credential: firebase.credential.cert(configFirebase.credential),
    });

    this.algolia = algoliasearch(configAlgolia.appId, configAlgolia.apiKey)
      .initIndex(indexNameAlgolia)
    this.algolia.setSettings({
        searchableAttributes: [
          'email,firstName,lastName',
        ],
      });

    const ref = this.firebase.database().ref(`/${indexNameFirebase}`);
    ref.on('child_added', this.addOrUpdateIndexRecord.bind(this));
    ref.on('child_changed', this.addOrUpdateIndexRecord.bind(this));
    ref.on('child_removed', this.deleteIndexRecord.bind(this));
  }

  addOrUpdateIndexRecord(user) {
    // Get Firebase object
    const record = user.val();
    // Specify Algolia's objectID using the Firebase object key
    record.objectID = user.key;
    // Add or update object
    this.algolia
      .saveObject(record)
      .then(() => {
        console.log('Firebase object indexed in Algolia', record.objectID);
      })
      .catch(error => {
        console.error('Error when indexing user into Algolia', error);
        process.exit(1);
      });
  }

  deleteIndexRecord(user) {
    // Get Algolia's objectID from the Firebase object key
    const objectID = user.key;
    // Remove the object from Algolia
    this.algolia
      .deleteObject(objectID)
      .then(() => {
        console.log('Firebase object deleted from Algolia', objectID);
      })
      .catch(error => {
        console.error('Error when deleting user from Algolia', error);
        process.exit(1);
      });
  }
}

module.exports = AlgoliaFirebase;
