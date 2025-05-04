const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../backend/.env') });
console.log(process.env.MONGODB_URI); 
// MongoDB connection URL from .env file
const uri = process.env.MONGODB_URI; // Replace with your MongoDB connection string

// Function to update claims with DID using MongoDB
async function updateClaims() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('insuranceDB');
    const claimsCollection = db.collection('claims');
    
    const usersAndDIDs = [
      { userId: "67bec126d5e1bcb158124368", did: "did:ethr:513632b2-bc7e-4d1e-9677-df149ad174d2" },
      { userId: "67beecf35177f1dfd6907e5b", did: "did:ethr:65b0c263-1a8f-41c5-99dc-925b1c37d0b4" },
      { userId: "67bef5655177f1dfd6907e65", did: "did:ethr:fbc3729f-9037-4755-9ee8-d639824dfaf2" },
      { userId: "67bf1ac2039befbc8ca2c467", did: "did:ethr:44aac04f-1613-485e-ae6c-7c106a4a6bba" },
      { userId: "67c0792195b4d3404899863b", did: "did:ethr:5fd43e5c-8e63-46b9-b7ed-9dbcd1b6f9d9" },
      { userId: "67c0a153116b20111cc4aa85", did: "did:ethr:5b0c88f8-d446-4ed3-8a0e-645abf4d7c8d" },
      { userId: "67c0a36f116b20111cc4aa96", did: "did:ethr:862f8124-4a10-4e15-b777-4547b19795b1" },
      { userId: "67cae03ba9a2aaa219bf20bf", did: "did:ethr:6adb567f-c761-4fc0-a8b2-d7ee4bb86ade" },
      { userId: "67cd60ed394eb0da7327a3bc", did: "did:ethr:b2367bcc-a9ca-4f6e-a271-25ab72034208" },
      { userId: "67cd6133394eb0da7327a3c0", did: "did:ethr:15db56d1-1243-4898-993b-92f564e351c7" },
      { userId: "67e3df21a1b81bc5be7c4658", did: "did:ethr:13137c4e-2c7b-4dde-a8b8-ad2619484226" },
      { userId: "67ee8663968a9dcf525ef133", did: "did:ethr:f29b25b2-a6cf-410d-b0ae-37df963c9ab1" },
      { userId: "67f657bd67d1a8514ce0227b", did: "did:ethr:d1d9898a-1c37-49be-8522-5cb7bcb908f0" },
      { userId: "67f65a247312325c2453a7e9", did: "did:ethr:413e08ab-8e10-40b7-987f-57e065bf1746" },
      { userId: "67f65c917312325c2453a7f9", did: "did:ethr:5de5e31c-d50d-4646-84a3-9239d570ecd4" }
    ];

    // Update claims with corresponding userDID
    for (const user of usersAndDIDs) {
      await claimsCollection.updateMany(
        { user: MongoClient.ObjectId(user.userId) },
        { $set: { userDID: user.did } }
      );
      console.log(`Updated claims for user ${user.userId} with DID ${user.did}`);
    }

    console.log('Claims updated successfully');
  } catch (error) {
    console.error('Error updating claims:', error);
  } finally {
    // Close the database connection
    await client.close();
  }
}

// Run the update function
updateClaims();
