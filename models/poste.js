const connection = require('../config/oracle.config');
const { v4: uuidv4 } = require('uuid');

class Poste {
  static async create({ posteName, posteName_en }) {
    const id = uuidv4();
    const sql = `
      INSERT INTO postes (id, posteName, posteName_en, createdAt, updatedAt)
      VALUES (:id, :posteName, :posteName_en, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const conn = await connection();
    try {
      await conn.execute(sql, { id, posteName, posteName_en }, { autoCommit: true });
      return { id, posteName, posteName_en };
    } finally {
      await conn.close();
    }
  }

  static async findAll(searchTerm = '') {
    const sql = `
      SELECT * FROM postes
      WHERE (LOWER(posteName) LIKE :search OR LOWER(posteName_en) LIKE :search)
      AND active = 1
      ORDER BY posteName
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { search: `%${searchTerm.toLowerCase()}%` });
      return result.rows.map(row => ({
        _id: row[0],  // Using _id to match frontend expectation
        posteName: row[1],
        posteName_en: row[2],
        active: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      }));
    } finally {
      await conn.close();
    }
  }

  static async findById(id) {
    const sql = `SELECT * FROM postes WHERE id = :id AND active = 1`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id });
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        _id: row[0],
        posteName: row[1],
        posteName_en: row[2],
        active: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      };
    } finally {
      await conn.close();
    }
  }

  static async updateById(id, { posteName, posteName_en }) {
    const sql = `
      UPDATE postes
      SET posteName = :posteName,
          posteName_en = :posteName_en,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = :id
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id, posteName, posteName_en }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }

  static async softDeleteById(id) {
    const sql = `UPDATE postes SET active = 0 WHERE id = :id`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }
}

module.exports = Poste;