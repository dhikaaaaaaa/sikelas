require('mongoose').connect('mongodb://localhost:27017/sikelas_db').then(async () => { 
  const User = require('./models/User'); 
  
  // Daftarin Fadhil Husein sebagai FIR (Admin Akademik)
  await User.create({ 
    name: 'Fadhil Husein', 
    email: 'fadhil.husein@students.paramadina.ac.id', 
    role: 'admin'
  }); 
  
  console.log('Sukses ditambah!'); 
  process.exit(0); 
}).catch(console.error);
