import bcrypt from 'bcrypt';
import { getConnection } from '../lib/db';

async function hashPasswords() {
  console.log('Starting password hashing process...');
  
  try {
    const conn = await getConnection();
    
    // Récupérer tous les utilisateurs
    const [users]: any = await conn.execute('SELECT id, username, password FROM users');
    
    console.log(`Found ${users.length} users to process`);
    
    // Pour chaque utilisateur, hacher le mot de passe et le mettre à jour
    for (const user of users) {
      // Vérifier si le mot de passe est déjà haché (les hachages bcrypt commencent par $2b$)
      if (user.password && !user.password.startsWith('$2b$')) {
        console.log(`Hashing password for user: ${user.username} (ID: ${user.id})`);
        
        // Hacher le mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        
        // Mettre à jour le mot de passe dans la base de données
        await conn.execute(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        );
        
        console.log(`Updated password for user: ${user.username} (ID: ${user.id})`);
      } else {
        console.log(`Password for user: ${user.username} (ID: ${user.id}) is already hashed or empty, skipping`);
      }
    }
    
    console.log('Password hashing completed successfully');
    await conn.end();
    
  } catch (error) {
    console.error('Error during password hashing:', error);
    process.exit(1);
  }
}

// Exécuter la fonction
hashPasswords()
  .then(() => {
    console.log('Script completed successfully. You can now enable bcrypt verification in auth.config.ts');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
