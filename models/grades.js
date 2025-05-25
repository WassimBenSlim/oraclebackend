const connection = require('../config/oracle.config');
const { v4: uuidv4 } = require('uuid');

class Grade {
  static async create({ gradeName, gradeName_en }) {
    const id = uuidv4();
    const sql = `
      INSERT INTO grades (id, gradeName, gradeName_en, createdAt, updatedAt)
      VALUES (:id, :gradeName, :gradeName_en, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const conn = await connection();
    try {
      await conn.execute(sql, { id, gradeName, gradeName_en }, { autoCommit: true });
      return { id, gradeName, gradeName_en };
    } finally {
      await conn.close();
    }
  }

  static async findAll(searchTerm = '') {
    const sql = `
      SELECT * FROM grades
      WHERE LOWER(gradeName) LIKE :search OR LOWER(gradeName_en) LIKE :search
      ORDER BY gradeName
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { search: `%${searchTerm.toLowerCase()}%` });
      return result.rows.map(row => ({
        id: row[0],
        gradeName: row[1],
        gradeName_en: row[2],
        createdAt: row[3],
        updatedAt: row[4],
      }));
    } finally {
      await conn.close();
    }
  }

  static async findAllNames() {
    const sql = `SELECT id, gradeName FROM grades ORDER BY gradeName`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql);
      return result.rows.map(row => ({
        id: row[0],
        gradeName: row[1],
      }));
    } finally {
      await conn.close();
    }
  }

  static async findById(id) {
    const sql = `SELECT * FROM grades WHERE id = :id`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id });
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row[0],
        gradeName: row[1],
        gradeName_en: row[2],
        createdAt: row[3],
        updatedAt: row[4],
      };
    } finally {
      await conn.close();
    }
  }

  static async updateById(id, { gradeName, gradeName_en }) {
    const sql = `
      UPDATE grades
      SET gradeName = :gradeName,
          gradeName_en = :gradeName_en,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = :id
    `;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id, gradeName, gradeName_en }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }

  static async deleteById(id) {
    const sql = `DELETE FROM grades WHERE id = :id`;
    const conn = await connection();
    try {
      const result = await conn.execute(sql, { id }, { autoCommit: true });
      return result.rowsAffected > 0;
    } finally {
      await conn.close();
    }
  }
}

module.exports = Grade;
