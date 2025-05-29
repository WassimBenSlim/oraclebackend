const connection = require('../config/oracle.config');
const { v4: uuidv4 } = require('uuid');

class ExpertiseMetier {
  static async create({ expertiseName, expertiseName_en }) {
    const id = uuidv4();
    const sql = `
      INSERT INTO expertise_metiers (id, expertiseName, expertiseName_en, createdAt, updatedAt)
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
      SELECT * FROM expertise_metiers
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
    const sql = `SELECT * FROM expertise_metiers WHERE id = :id AND active = 1`;
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
      UPDATE expertise_metiers
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
    const conn = await connection();
    try {
      conn.autoCommit = false;
      
      // 1. Delete from junction table first
      await conn.execute(
        `DELETE FROM poste_expertise_metiers WHERE expertise_metier_id = :id`,
        { id },
        { autoCommit: false }
      );
      
      // 2. Soft delete from main table
      const result = await conn.execute(
        `UPDATE expertise_metiers SET active = 0 WHERE id = :id`,
        { id },
        { autoCommit: false }
      );
      
      await conn.commit();
      return result.rowsAffected > 0;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.autoCommit = true;
      await conn.close();
    }
  }
}

module.exports = ExpertiseMetier;