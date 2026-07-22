require('dotenv').config();
const mongoose = require('mongoose');

const NEW_URL = 'https://res.cloudinary.com/ghbqwu6e/image/upload/v1784720561/sikelas/default_proof.png';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('requests');
  
  // Update ALL records to use the new visible proof URL
  const result = await col.updateMany({}, { $set: { attachmentUrl: NEW_URL } });
  console.log(`Updated ${result.modifiedCount} requests to new visible Cloudinary URL.`);
  
  // Verify
  const all = await col.find().toArray();
  all.forEach(r => {
    console.log(`  ${r._id} | ${r.reason} | ${r.attachmentUrl.slice(0, 80)}...`);
  });
  
  await mongoose.disconnect();
}

main().catch(console.error);
