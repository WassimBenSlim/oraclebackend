const { createUserTable } = require('./create-user-table');
const { createMetiersTable } = require('./create-metiers-table');
const { createGradesTable } = require('./create-grades-table');
const { createPostesTable } = require('./create-postes-table');
const { createExpertiseTables } = require('./create-expertise-table');
const { createProfilesTable } = require('./create-profiles-table');
const { createProfileExpMetiersTable } = require('./create-profiles-expertise-metiers-table');
const { createProfileExpTechniquesTable } = require('./create-profiles-expertise-techniques-table');
const { createProfileExpLogiciellesTable } = require('./create-profiles-expertise-logicielles-table');
const { createProfileCompetencesTable } = require('./create-profiles-competences-table');

const runMigrations = async () => {
  try {
    // Core tables
    await createUserTable();
    await createMetiersTable();
    await createGradesTable();
    await createPostesTable();
    await createExpertiseTables();
    
    // Profile table
    await createProfilesTable();
    
    // Junction tables
    await createProfileExpMetiersTable();
    await createProfileExpTechniquesTable();
    await createProfileExpLogiciellesTable();
    await createProfileCompetencesTable();
    
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

module.exports=runMigrations;