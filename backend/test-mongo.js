const mongoose = require('mongoose');
const { execSync } = require('child_process');

const MONGODB_URI = "mongodb://acf5c230-8f8f-4877-9ff6-125b6a07fa2b.nam5.firestore.goog:443/app-unida?loadBalanced=true&tls=true&retryWrites=false&authMechanism=MONGODB-OIDC";

const oidcCallback = async () => {
  const token = execSync("gcloud auth print-access-token").toString().trim();
  return { accessToken: token };
};

mongoose.connect(MONGODB_URI, {
  authMechanismProperties: {
    OIDC_CALLBACK: oidcCallback,
    TOKEN_RESOURCE: "FIRESTORE",
    ALLOWED_HOSTS: ["acf5c230-8f8f-4877-9ff6-125b6a07fa2b.nam5.firestore.goog"]
  }
})
  .then(() => {
    console.log("Connected successfully to MongoDB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
