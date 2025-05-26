const connection = require('../config/oracle.config');
const { v4: uuidv4 } = require('uuid');

class Competence {
  static async create({ competenceName, competenceName_en }) {
    const id = uuidv4();
    const sql = `
      INSERT INTO competences (id, competenceName, competenceName_en, createdAt, updatedAt)
      VALUES (:id, :competenceName, :competenceName_en, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const conn = await connection();
    try {
      await conn.execute(sql, { id, competenceName, competenceName_en }, { autoCommit: true });
      return { id, competenceName, competenceName_en };
    } finally {
      await conn.close();
    }
  }

  static async findAll(searchTerm = '') {
    const sql = `
      SELECT * FROM competences
      WHERE (LOWER(competenceName) LIKE :search OR LOWER(competenceName_en) LIKE :search)
      AND active = 1
      ORDER BY competenceName
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { search: `%${searchTerm.toLowerCase()}%` });
      return result.rows.map(row => ({
        _id: row[0],  // Using _id to match frontend expectation
        competenceName: row[1],
        competenceName_en: row[2],
        active: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      }));
    } finally {
      await conn.close();
    }
  }

  static async findById(id) {
    const sql = `SELECT * FROM competences WHERE id = :id AND active = 1`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id });
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        _id: row[0],
        competenceName: row[1],
        competenceName_en: row[2],
        active: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      };
    } finally {
      await conn.close();
    }
  }

  static async updateById(id, { competenceName, competenceName_en }) {
    const sql = `
      UPDATE competences
      SET competenceName = :competenceName,
          competenceName_en = :competenceName_en,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = :id
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id, competenceName, competenceName_en }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }

  static async deleteById(id) {
    const sql = `UPDATE competences SET active = 0 WHERE id = :id`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }
}

module.exports = Competence;