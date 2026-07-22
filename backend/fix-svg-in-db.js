/**
 * Fix broken SVG Data URLs in MongoDB with a valid SVG
 */
require('dotenv').config();
const mongoose = require('mongoose');

const VALID_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAEsCAIAAABi1XKVAAAD/UlEQVR4nO3UsQ3AIAADQSbJzGyc1CmQ6OCls24AVz9eM7PIxukDZma7Eywzy0ywzCyzX7CeCXAXwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgQ7CADMECMgQLyBAsIEOwgAzBAjIEC8gQLCBDsIAMwQIyBAvIECwgYxksM7ObJ1hmlplgmVlmgmVmmX3thhdz1R3dqQAAAABJRU5ErkJggg==';

async function fixSvgInDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.db.collection('requests');

  // Find all requests with SVG or /uploads/ attachments to fix
  const broken = await collection.find({
    $or: [
      { attachmentUrl: { $regex: 'data:image/svg' } },
      { attachmentUrl: { $regex: '^/uploads/' } }
    ]
  }).toArray();
  console.log(`Found ${broken.length} requests with SVG attachments to fix.`);

  for (const doc of broken) {
    await collection.updateOne({ _id: doc._id }, { $set: { attachmentUrl: VALID_DATA_URL } });
    console.log(`Fixed SVG for request ${doc._id}`);
  }

  // Verify all attachments
  const all = await collection.find().toArray();
  console.log('\nFinal verification:');
  for (const doc of all) {
    const att = doc.attachmentUrl || '(none)';
    const preview = att.length > 50 ? att.slice(0, 50) + '...' : att;
    console.log(`  ${doc._id} | ${doc.type} | ${doc.status} | attachment: ${preview}`);
  }

  await mongoose.disconnect();
  console.log('\nAll SVG attachments fixed!');
}

fixSvgInDb().catch(console.error);
