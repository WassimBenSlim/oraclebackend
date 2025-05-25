const connection = require('../config/oracle.config');
const { v4: uuidv4 } = require('uuid');

class Metier {
  static async create({ metierName, metierName_en }) {
    const id = uuidv4();
    const sql = `
      INSERT INTO metiers (id, metierName, metierName_en, createdAt, updatedAt)
      VALUES (:id, :metierName, :metierName_en, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const conn = await connection();
    try {
      await conn.execute(sql, { id, metierName, metierName_en }, { autoCommit: true });
      return { id, metierName, metierName_en };
    } finally {
      await conn.close();
    }
  }

  static async findAll(searchTerm = '') {
    const sql = `
      SELECT * FROM metiers
      WHERE LOWER(metierName) LIKE :search OR LOWER(metierName_en) LIKE :search
      ORDER BY metierName
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { search: `%${searchTerm.toLowerCase()}%` });
      return result.rows.map(row => ({
        id: row[0],
        metierName: row[1],
        metierName_en: row[2],
        createdAt: row[3],
        updatedAt: row[4],
      }));
    } finally {
      await conn.close();
    }
  }

  static async findById(id) {
    const sql = `SELECT * FROM metiers WHERE id = :id`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id });
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row[0],
        metierName: row[1],
        metierName_en: row[2],
        createdAt: row[3],
        updatedAt: row[4],
      };
    } finally {
      await conn.close();
    }
  }

  static async updateById(id, { metierName, metierName_en }) {
    const sql = `
      UPDATE metiers
      SET metierName = :metierName,
          metierName_en = :metierName_en,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = :id
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id, metierName, metierName_en }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }

  static async deleteById(id) {
    const sql = `DELETE FROM metiers WHERE id = :id`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }
}

module.exports = Metier;