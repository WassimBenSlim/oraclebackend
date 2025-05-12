const connection = require('../config/oracle.config');

module.exports.createUser = async (userData) => {
  const conn = await connection();
  try {
    const insertSQL = `
      INSERT INTO users (id, prenom, nom, email, pays, telephone, password, type, flag, activationCode, createdAt, updatedAt)
      VALUES (:id, :prenom, :nom, :email, :pays, :telephone, :password, :type, :flag, :activationCode, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    await conn.execute(insertSQL, userData);
    await conn.commit();
  } finally {
    await conn.close();
  }
};

module.exports.getUserByEmail = async (email) => {
  const conn = await connection();
  try {
    const result = await conn.execute('SELECT * FROM users WHERE email = :email', { email });
    return result.rows[0];
  } finally {
    await conn.close();
  }
};

module.exports.getAllUsers = async () => {
  const conn = await connection();
  try {
    const result = await conn.execute('SELECT * FROM users');
    return result.rows;
  } finally {
    await conn.close();
  }
};

module.exports.getUserById = async (id) => {
  const conn = await connection();
  try {
    const result = await conn.execute('SELECT * FROM users WHERE id = :id', { id });
    return result.rows[0];
  } finally {
    await conn.close();
  }
};

// Method for confirming the user account and updating the flag to 1
module.exports.confirmUser = async (activationCode) => {
  const conn = await connection();
  try {
    const updateSQL = `
      UPDATE users
      SET flag = 1, updatedAt = CURRENT_TIMESTAMP
      WHERE activationCode = :activationCode AND flag = 0
    `;
    const result = await conn.execute(updateSQL, { activationCode });
    await conn.commit();
    return result.rowsAffected > 0;  // Return true if a row was updated
  } finally {
    await conn.close();
  }
};

// Update a user by ID
module.exports.updateUserById = async (id, userData) => {
  const conn = await connection();
  try {
    const updateSQL = `
      UPDATE users
      SET prenom = :prenom, nom = :nom, email = :email, pays = :pays, telephone = :telephone, type = :type, updatedAt = CURRENT_TIMESTAMP
      WHERE id = :id
    `;
    const result = await conn.execute(updateSQL, { ...userData, id });
    await conn.commit();
    return result.rowsAffected > 0;
  } finally {
    await conn.close();
  }
};

// Delete a user by ID
module.exports.deleteUserById = async (id) => {
  const conn = await connection();
  try {
    const deleteSQL = 'DELETE FROM users WHERE id = :id';
    const result = await conn.execute(deleteSQL, { id });
    await conn.commit();
    return result.rowsAffected > 0;
  } finally {
    await conn.close();
  }
};
