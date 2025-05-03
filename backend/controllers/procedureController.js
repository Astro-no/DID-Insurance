const { MongoClient } = require("mongodb");

// Setup MongoDB client
const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Save Verifiable Credential to MongoDB
const saveVC = async (vcDoc) => {
  try {
    await client.connect();
    const db = client.db("insuranceDB");
    const collection = db.collection("vcs");
    const result = await collection.insertOne(vcDoc);
    return result;
  } catch (error) {
    console.error("Error saving VC:", error);
    throw new Error("Failed to save VC");
  } finally {
    await client.close();
  }
};

// Controller: Record a medical procedure and issue a VC
const recordProcedure = async (req, res) => {
  try {
    const { procedureData, policyholderDID } = req.body;

    // Use issuer DID from authenticated hospital
    const issuerDID = req.user?.did;

    if (!issuerDID) {
      return res.status(401).json({ message: "Unauthorized: Issuer DID missing" });
    }

    const vc = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "MedicalProcedureCredential"],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: policyholderDID,
        procedure: {
          name: procedureData.name,
          timestamp: Math.floor(Date.now() / 1000),
        },
      },
    };

    const result = await saveVC({
      policyholderAddress: policyholderDID,
      vc,
    });

    return res.status(201).json({
      message: "VC generated and saved successfully",
      vc,
      result,
    });
  } catch (error) {
    console.error("Failed to record procedure:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { recordProcedure };
