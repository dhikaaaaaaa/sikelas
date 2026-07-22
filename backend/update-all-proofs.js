require('dotenv').config();
const mongoose = require('mongoose');

const DEFAULT_PROOF = 'https://res.cloudinary.com/ghbqwu6e/image/upload/v1784720561/sikelas/default_proof.png';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.db.collection('requests');

  // Update empty or /uploads/ attachments to default Cloudinary proof
  const result = await collection.updateMany(
    {
      $or: [
        { attachmentUrl: '' },
        { attachmentUrl: null },
        { attachmentUrl: '#' },
        { attachmentUrl: { $regex: '^/uploads/' } }
      ]
    },
    { $set: { attachmentUrl: DEFAULT_PROOF } }
  );

  console.log(`Updated ${result.modifiedCount} requests in MongoDB.`);

  await mongoose.disconnect();
}

main().catch(console.error);
