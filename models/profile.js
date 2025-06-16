const connection = require('../config/oracle.config');
const oracledb = require('oracledb');

module.exports.createProfile = async (profileData) => {
  const conn = await connection();
  try {
    console.log("Profile data to insert:", profileData);

    let experienceYears = profileData.experienceYears === 'null' ? null : Number(profileData.experienceYears);
    let poste_id = profileData.poste_id === null ? null : Number(profileData.poste_id);
    let grade_id = profileData.grade_id === null ? null : Number(profileData.grade_id);
    let metier_id = profileData.metier_id === null ? null : Number(profileData.metier_id);

    if (experienceYears !== null && isNaN(experienceYears)) throw new Error("Invalid experienceYears value");
    if (poste_id !== null && isNaN(poste_id)) throw new Error("Invalid poste_id value");
    if (grade_id !== null && isNaN(grade_id)) throw new Error("Invalid grade_id value");
    if (metier_id !== null && isNaN(metier_id)) throw new Error("Invalid metier_id value");

    const dataToInsert = {
      ...profileData,
      experienceYears,
      poste_id,
      grade_id,
      metier_id
    };

    const insertSQL = `
      INSERT INTO profiles (
        id, user_id, cvLanguage, description, experienceYears,
        langues, formations, formations_en, 
        expSignificatives, expSignificatives_en,
        poste_id, grade_id, metier_id, images,
        createdAt, updatedAt
      ) VALUES (
        :id, :user_id, :cvLanguage, :description, :experienceYears,
        :langues, :formations, :formations_en,
        :expSignificatives, :expSignificatives_en,
        :poste_id, :grade_id, :metier_id, :images,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `;
    await conn.execute(insertSQL, dataToInsert);
    await conn.commit();
  } catch (err) {
    console.error("Error creating profile:", err);
    throw err;
  } finally {
    await conn.close();
  }
};

module.exports.getProfileByUserId = async (userId) => {
  const conn = await connection();
  try {
    const result = await conn.execute(
      `SELECT * FROM profiles WHERE user_id = :userId`, 
      { userId },
      { outFormat: oracledb.OBJECT }
    );
    return result.rows[0];
  } finally {
    await conn.close();
  }
};

module.exports.getProfileById = async (id) => {
  const conn = await connection();
  try {
    const result = await conn.execute(
      `SELECT * FROM profiles WHERE id = :id`, 
      { id },
      { outFormat: oracledb.OBJECT }
    );
    return result.rows[0];
  } finally {
    await conn.close();
  }
};

module.exports.updateProfile = async (id, profileData) => {
  const conn = await connection();
  try {
    const updateSQL = `
      UPDATE profiles SET
        cvLanguage = :cvLanguage,
        description = :description,
        experienceYears = :experienceYears,
        langues = :langues,
        formations = :formations,
        formations_en = :formations_en,
        expSignificatives = :expSignificatives,
        expSignificatives_en = :expSignificatives_en,
        poste_id = :poste_id,
        grade_id = :grade_id,
        metier_id = :metier_id,
        images = :images,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = :id
    `;
    const result = await conn.execute(updateSQL, { ...profileData, id });
    await conn.commit();
    return result.rowsAffected > 0;
  } finally {
    await conn.close();
  }
};

module.exports.deleteProfile = async (id) => {
  const conn = await connection();
  try {
    const deleteSQL = 'DELETE FROM profiles WHERE id = :id';
    const result = await conn.execute(deleteSQL, { id });
    await conn.commit();
    return result.rowsAffected > 0;
  } finally {
    await conn.close();
  }
};

module.exports.getProfilesWithName = async (search) => {
  const conn = await connection();
  try {
    let query = `
      SELECT 
        p.id,
        p.user_id,
        u.nom,
        u.prenom,
        u.email,
        g.gradeName as grade_name,
        m.metierName as metier_name
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN grades g ON p.grade_id = g.id
      LEFT JOIN metiers m ON p.metier_id = m.id
    `;
    
    let params = {};
    if (search) {
      query += ` WHERE UPPER(u.nom) LIKE UPPER(:search) OR UPPER(u.prenom) LIKE UPPER(:search)`;
      params.search = `%${search}%`;
    }
    
    const result = await conn.execute(query, params, { outFormat: oracledb.OBJECT });
    
    return result.rows.map(row => ({
      id: row.ID,
      user: {
        id: row.USER_ID,
        nom: row.NOM,
        prenom: row.PRENOM,
        email: row.EMAIL
      },
      grade: row.GRADE_NAME ? { name: row.GRADE_NAME } : null,
      metier: row.METIER_NAME ? { name: row.METIER_NAME } : null
    }));
  } finally {
    await conn.close();
  }
};