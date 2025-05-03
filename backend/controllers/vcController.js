const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to get VC by DID
const getVCByDID = async (req, res) => {
  try {
    const { did } = req.params; // Get DID from the URL parameter
    await client.connect();
    const db = client.db("insuranceDB");
    const vcsCollection = db.collection("vcs");

    // Query the collection for the VC with the given DID
    const vc = await vcsCollection.findOne({ "vc.credentialSubject.id": did });

    if (!vc) {
      return res.status(404).json({ message: "No VCs found for this DID." });
    }

    return res.status(200).json(vc); // Return the VC document
  } catch (error) {
    console.error("Error fetching VC:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    await client.close();
  }
};

module.exports = { getVCByDID };
