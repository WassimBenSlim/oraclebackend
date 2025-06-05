const { createUserTable } = require('./create-user-table');
const { createMetiersTable } = require('./create-metiers-table');
const { createGradesTable } = require('./create-grades-table');
const { createPostesTable } = require('./create-postes-table');
const { createProfilesTable } = require('./create-profiles-table');
const { createProfileExpMetiersTable } = require('./create-profiles-expertise-metiers-table');
const { createProfileExpTechniquesTable } = require('./create-profiles-expertise-techniques-table');
const { createProfileExpLogiciellesTable } = require('./create-profiles-expertise-logicielles-table');
const { createCompetencesTable } = require('./create-competences-table');
const { createExpertiseLogiciellesTable } = require('./create-expertise-logicielles-table');
const { createExpertiseTechniquesTable } = require('./create-expertise-techniques-table');
const { createExpertiseMetiersTable } = require('./create-expertise-metiers-table');
const { createPosteExpertiseMetiersTable } = require('./create-poste-expertise-metiers-table');
const { createPosteExpertiseTechniquesTable } = require('./create-poste-expertise-technique-table');
const { createPosteExpertiseLogiciellesTable } = require('./create-poste-expertise-logicielle-table');
const { createPosteCompetencesTable } = require('./create-poste-competences-table');
const { createCollectionsTable } = require('./create-collections-table');
const { createCollectionProfilesTable } = require('./create-collections-profiles-table');
const { createCollectionActorsUseTable } = require('./create-collections-actor-use-table');
const { createCollectionActorsUpdateTable } = require('./create-collections-actor-update-table');


const runMigrations = async () => {
  try {
    // Core tables
    await createUserTable();
    await createMetiersTable();
    await createGradesTable();
    await createPostesTable();
    await createCompetencesTable();
    await createExpertiseLogiciellesTable();
    await createExpertiseTechniquesTable();
    await createExpertiseMetiersTable();
    await createCollectionsTable();
    

    
    // Profile table
    await createProfilesTable();
    
    // Junction tables
    await createProfileExpMetiersTable();
    await createProfileExpTechniquesTable();
    await createProfileExpLogiciellesTable();
    await createPosteExpertiseMetiersTable();
    await createPosteExpertiseTechniquesTable();
    await createPosteExpertiseLogiciellesTable();
    await createPosteCompetencesTable();
    await createCollectionProfilesTable();
    await createCollectionActorsUseTable();
    await createCollectionActorsUpdateTable();
    
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

module.exports=runMigrations;