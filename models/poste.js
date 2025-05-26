const connection = require('../config/oracle.config');
const { v4: uuidv4 } = require('uuid');

class Poste {
  static async createWithRelations({
    posteName,
    posteName_en,
    competences = [],
    expertisesMetiers = [],
    expertisesTechniques = [],
    expertisesLogicielles = []
  }) {
    const conn = await connection();
    try {
      // Start transaction
      conn.autoCommit = false;

      const id = uuidv4();
      const now = new Date();

      // 1. Create base poste
      await conn.execute(
        `INSERT INTO postes (id, posteName, posteName_en, createdAt, updatedAt)
         VALUES (:id, :posteName, :posteName_en, :createdAt, :updatedAt)`,
        { id, posteName, posteName_en, createdAt: now, updatedAt: now }
      );

      // 2. Insert relationships
      const insertRelations = async (table, ids) => {
        if (!ids || !ids.length) return;
        
        const binds = ids.map(relationId => ({ posteId: id, relationId }));
        const sql = `INSERT INTO ${table} (poste_id, ${table.endsWith('competences') ? 'competence_id' : 
          table.endsWith('metiers') ? 'expertise_metier_id' :
          table.endsWith('techniques') ? 'expertise_technique_id' : 'expertise_logicielle_id'}) 
          VALUES (:posteId, :relationId)`;
        
        await conn.executeMany(sql, binds);
      };

      await Promise.all([
        insertRelations('poste_competences', competences),
        insertRelations('poste_expertise_metiers', expertisesMetiers),
        insertRelations('poste_expertise_techniques', expertisesTechniques),
        insertRelations('poste_expertise_logicielles', expertisesLogicielles)
      ]);

      // Commit transaction
      await conn.commit();

      return {
        _id: id,
        posteName,
        posteName_en,
        competences,
        expertisesMetiers,
        expertisesTechniques,
        expertisesLogicielles,
        active: 1,
        createdAt: now,
        updatedAt: now
      };
    } catch (err) {
      // Rollback on error
      await conn.rollback();
      
      // Handle specific Oracle errors
      if (err.errorNum) {
        switch (err.errorNum) {
          case 1: // Unique constraint violation
            err.duplicationKey = true;
            break;
          case 1400: // NOT NULL violation
            err.nullViolation = true;
            break;
          case 2291: // Integrity constraint violation (parent key not found)
            err.foreignKeyViolation = true;
            break;
        }
      }
      throw err;
    } finally {
      // Reset autoCommit and close connection
      conn.autoCommit = true;
      await conn.close();
    }
  }

  static async findById(id) {
    const conn = await connection();
    try {
      // Get base poste
      const result = await conn.execute(
        `SELECT id, posteName, posteName_en, active, createdAt, updatedAt 
         FROM postes 
         WHERE id = :id AND active = 1`,
        { id }
      );
      
      if (!result.rows || result.rows.length === 0) return null;

      const row = result.rows[0];
      const poste = {
        _id: row[0],
        posteName: row[1],
        posteName_en: row[2],
        active: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      };

      // Get relationships
      const getRelations = async (table, idField) => {
        const res = await conn.execute(
          `SELECT ${idField} FROM ${table} WHERE poste_id = :id`,
          { id }
        );
        return res.rows.map(r => r[0]);
      };

      const [
        competences,
        expertisesMetiers,
        expertisesTechniques,
        expertisesLogicielles
      ] = await Promise.all([
        getRelations('poste_competences', 'competence_id'),
        getRelations('poste_expertise_metiers', 'expertise_metier_id'),
        getRelations('poste_expertise_techniques', 'expertise_technique_id'),
        getRelations('poste_expertise_logicielles', 'expertise_logicielle_id')
      ]);

      return {
        ...poste,
        competences,
        expertisesMetiers,
        expertisesTechniques,
        expertisesLogicielles
      };
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  static async findAll(searchTerm = '') {
    const conn = await connection();
    try {
      const result = await conn.execute(
        `SELECT id, posteName, posteName_en, active, createdAt, updatedAt 
         FROM postes 
         WHERE (LOWER(posteName) LIKE :search OR LOWER(posteName_en) LIKE :search)
         AND active = 1
         ORDER BY posteName`,
        { search: `%${searchTerm.toLowerCase()}%` }
      );
      
      return result.rows.map(row => ({
        _id: row[0],
        posteName: row[1],
        posteName_en: row[2],
        active: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      }));
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }

  static async updateWithRelations(
    id,
    { posteName, posteName_en, competences, expertisesMetiers, expertisesTechniques, expertisesLogicielles }
  ) {
    const conn = await connection();
    try {
      // Start transaction
      conn.autoCommit = false;
      const now = new Date();

      // 1. Update base poste
      await conn.execute(
        `UPDATE postes 
         SET posteName = :posteName,
             posteName_en = :posteName_en,
             updatedAt = :updatedAt
         WHERE id = :id`,
        { id, posteName, posteName_en, updatedAt: now }
      );

      // 2. Update relationships (delete then insert)
      const updateRelations = async (table, ids) => {
        await conn.execute(`DELETE FROM ${table} WHERE poste_id = :id`, { id });
        
        if (ids && ids.length) {
          const binds = ids.map(relationId => ({ posteId: id, relationId }));
          const sql = `INSERT INTO ${table} (poste_id, ${table.endsWith('competences') ? 'competence_id' : 
            table.endsWith('metiers') ? 'expertise_metier_id' :
            table.endsWith('techniques') ? 'expertise_technique_id' : 'expertise_logicielle_id'}) 
            VALUES (:posteId, :relationId)`;
          
          await conn.executeMany(sql, binds);
        }
      };

      await Promise.all([
        updateRelations('poste_competences', competences),
        updateRelations('poste_expertise_metiers', expertisesMetiers),
        updateRelations('poste_expertise_techniques', expertisesTechniques),
        updateRelations('poste_expertise_logicielles', expertisesLogicielles)
      ]);

      // Commit transaction
      await conn.commit();
      
      // Return the updated poste
      return await this.findById(id);
    } catch (err) {
      // Rollback on error
      await conn.rollback();
      
      // Handle specific Oracle errors
      if (err.errorNum) {
        switch (err.errorNum) {
          case 1: // Unique constraint violation
            err.duplicationKey = true;
            break;
          case 1400: // NOT NULL violation
            err.nullViolation = true;
            break;
          case 2291: // Integrity constraint violation (parent key not found)
            err.foreignKeyViolation = true;
            break;
        }
      }
      throw err;
    } finally {
      // Reset autoCommit and close connection
      conn.autoCommit = true;
      await conn.close();
    }
  }

  static async softDelete(id) {
    const conn = await connection();
    try {
      const result = await conn.execute(
        `UPDATE postes SET active = 0, updatedAt = :updatedAt WHERE id = :id`,
        { id, updatedAt: new Date() },
        { autoCommit: true }
      );
      return result.rowsAffected > 0;
    } catch (err) {
      throw err;
    } finally {
      await conn.close();
    }
  }
}

module.exports = Poste;