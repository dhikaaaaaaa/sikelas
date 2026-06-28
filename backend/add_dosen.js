require('mongoose').connect('mongodb://localhost:27017/sikelas_db').then(async () => { 
  const User = require('./models/User'); 
  const Class = require('./models/Class'); 
  
  // Daftarin Najjuan sebagai Dosen
  await User.create({ 
    name: 'Najjuan Fariz', 
    email: 'najjuan.fariz@students.paramadina.ac.id', 
    role: 'dosen', 
    nip: '199901012025011001' 
  }); 
  
  // Assign Najjuan ke kelas Basis Data
  await Class.findOneAndUpdate(
    { name: 'CS204 — Basis Data' }, 
    { 
      lecturer: 'Najjuan Fariz', 
      lecturerEmail: 'najjuan.fariz@students.paramadina.ac.id' 
    }
  ); 
  
  console.log('Sukses ditambah!'); 
  process.exit(0); 
}).catch(console.error);
