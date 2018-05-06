#! /usr/bin/env node

const config = require('config');
const fs = require('fs');
const glob = require('glob');
const { MongoClient } = require('mongodb');
const path = require('path');
const url = require('url');

const createOrReplaceRecord = async (collection, record) => {
  const filter = { _id: record._id };

  const existingRecord = await collection.findOne(filter);

  if (existingRecord) {
    const mergedRecord = {
      ...existingRecord,
      ...record,
    };

    return collection.findOneAndReplace(filter, mergedRecord);
  }

  return collection.insertOne(record);
};

const executeImport = async () => {
  const collectionName = config.get('collections.integrations');
  const mongodbUrl = config.get('mongodb');
  const dbName = url.parse(mongodbUrl).path.substring(1);

  const client = await MongoClient.connect(mongodbUrl);
  const db = await client.db(dbName);
  const collection = db.collection(collectionName);

  glob(path.join(__dirname, '..', 'integrations', '**/*.json'), async (err, files) => {
    if (files.length < 0) {
      throw new Error('No files found.');
    }

    await Promise.all(
      files.map(file => {
        const integration = JSON.parse(fs.readFileSync(file, 'utf8'));
        const scriptSource = fs.readFileSync(
          path.join(__dirname, '..', 'integrations', integration.scriptPath),
          'utf8'
        );
        // replace scriptPath with the actual script source
        delete integration.scriptPath;
        integration.script = scriptSource;

        console.log(`merging ${file}`);
        return createOrReplaceRecord(collection, integration);
      })
    );

    client.close();
  });
};

executeImport();
