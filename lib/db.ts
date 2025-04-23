import mysql from 'mysql2/promise';

export async function getConnection() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'opcua_dashboard',
    port: 3307
  });
  return connection;
}
