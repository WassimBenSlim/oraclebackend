const connection = require('../config/oracle.config');
const { v4: uuidv4 } = require('uuid');

class ExpertiseTechnique {
  static async create({ expertiseName, expertiseName_en }) {
    const id = uuidv4();
    const sql = `
      INSERT INTO expertise_techniques (id, expertiseName, expertiseName_en, createdAt, updatedAt)
      VALUES (:id, :expertiseName, :expertiseName_en, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const conn = await connection();
    try {
      await conn.execute(sql, { id, expertiseName, expertiseName_en }, { autoCommit: true });
      return { id, expertiseName, expertiseName_en };
    } finally {
      await conn.close();
    }
  }

  static async findAll(searchTerm = '') {
    const sql = `
      SELECT * FROM expertise_techniques
      WHERE (LOWER(expertiseName) LIKE :search OR LOWER(expertiseName_en) LIKE :search)
      AND active = 1
      ORDER BY expertiseName
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { search: `%${searchTerm.toLowerCase()}%` });
      return result.rows.map(row => ({
        _id: row[0],
        expertiseName: row[1],
        expertiseName_en: row[2],
        active: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      }));
    } finally {
      await conn.close();
    }
  }

  static async findById(id) {
    const sql = `SELECT * FROM expertise_techniques WHERE id = :id AND active = 1`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id });
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        _id: row[0],
        expertiseName: row[1],
        expertiseName_en: row[2],
        active: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      };
    } finally {
      await conn.close();
    }
  }

  static async updateById(id, { expertiseName, expertiseName_en }) {
    const sql = `
      UPDATE expertise_techniques
      SET expertiseName = :expertiseName,
          expertiseName_en = :expertiseName_en,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = :id
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id, expertiseName, expertiseName_en }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }

  static async deleteById(id) {
    const sql = `UPDATE expertise_techniques SET active = 0 WHERE id = :id`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }
}

module.exports = ExpertiseTechnique;
