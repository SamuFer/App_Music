import mongoose from 'mongoose';
import dns from 'dns';

// En entornos de desarrollo, a veces el DNS puede causar problemas al resolver el host de MongoDB Atlas.
if (process.env.NODE_ENV !== 'production') {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
}

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    const dbName = db.connection.name;

    // 1. Obtenemos la lista de bases de datos reales en el cluster
    const adminDb = db.connection.db.admin();
    const { databases } = await adminDb.listDatabases();
    
    // 2. Comprobamos si nuestra base de datos existe en esa lista
    const exists = databases.some(d => d.name === dbName);

    if (!exists) {
      // Si no existe, forzamos el error y cerramos
      console.error(`\n❌ ERROR CRÍTICO: La base de datos "${dbName}" no existe en el cluster.`);
      console.log(`Bases de datos disponibles: ${databases.map(d => d.name).join(', ')}`);
      
      await mongoose.disconnect();
      process.exit(1); 
    }

    console.log(`✅ Conexión validada: Estás en "${dbName}" y la base de datos existe.`);
    
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// export const connectDB = async () => {
//     console.log(process.env.MONGO_URI);
//   try {
//     // Usamos la variable que definimos en el .env
//     const db = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`✅ MongoDB conectado a la base de datos: ${db.connection.name}`)
    
//     console.log(`✅ MongoDB conectado: ${db.connection.host}`);
//   } catch (error) {
//     console.error('❌ Error al conectar a MongoDB:', error.message);
//     // Si no hay conexión, cerramos la app porque nada funcionará
//     process.exit(1);
//   }
// };