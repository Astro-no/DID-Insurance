const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const hospitals = [
  { name: 'Agha Khan', username: 'aghakhan', password: 'pass1', did: 'did:example:aghakhan' },
  { name: 'Nairobi Hospital', username: 'nairobi', password: 'pass2', did: 'did:example:nairobi' },
  { name: 'Kenyatta Hospital', username: 'kenyatta', password: 'pass3', did: 'did:example:kenyatta' },
  { name: 'MP Shah Hospital', username: 'mpshah', password: 'pass4', did: 'did:example:mpshah' }
];

async function seed() {
  let client;
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/';
    console.log("Using MongoDB URI:", uri);
    
    client = new MongoClient(uri, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 90000,
      serverSelectionTimeoutMS: 60000
    });
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('insuranceDB');
    const collection = db.collection('hospitals');
    
    // Clear existing data
    await collection.deleteMany({});
    console.log('Cleared existing hospital data');
    
    // Insert hospitals one by one
    for (const h of hospitals) {
      try {
        const hashedPassword = await bcrypt.hash(h.password, 10);
        const hospitalData = { ...h, password: hashedPassword };
        console.log(`Creating hospital: ${h.name}`);
        await collection.insertOne(hospitalData);
        console.log(`Created hospital: ${h.name}`);
      } catch (err) {
        console.error(`Error creating hospital ${h.name}:`, err.message);
      }
    }
    
    console.log('Hospital accounts created.');
  } catch (err) {
    console.error('Error seeding hospitals:', err.message);
    console.error(err.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

seed();