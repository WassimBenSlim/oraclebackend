const connection = require('../config/oracle.config');
const { v4: uuidv4 } = require('uuid');
const oracledb = require('oracledb');
const logger = require('../middlewares/logger');

class Collection {
    static async create(collectionData) {
        const conn = await connection();
        try {
            conn.autoCommit = false;
            const id = uuidv4();

            await conn.execute(
                `INSERT INTO collections (id, collectionName, creator_id) 
                 VALUES (:id, :collectionName, :creatorId)`,
                {
                    id,
                    collectionName: collectionData.collectionName,
                    creatorId: collectionData.creator
                }
            );

            const insertRelations = async (table, items, idField) => {
                if (!items?.length) return;
                
                const binds = items.map(itemId => ({
                    collection_id: id,
                    [idField]: itemId
                }));

                await conn.executeMany(
                    `INSERT INTO ${table} (collection_id, ${idField}) 
                     VALUES (:collection_id, :${idField})`,
                    binds
                );
            };

            await Promise.all([
                insertRelations('collection_profiles', collectionData.collectionProfils, 'profil_id'),
                insertRelations('collection_actors_use', collectionData.actorsToUse, 'user_id'),
                insertRelations('collection_actors_update', collectionData.actorsToUpdate, 'user_id')
            ]);

            await conn.commit();
            return { id, ...collectionData };
        } catch (err) {
            await conn.rollback();
            logger.error({ 
                message: 'Error creating collection', 
                error: err.message,
                stack: err.stack
            });
            throw this._handleError(err);
        } finally {
            conn.autoCommit = true;
            await conn.close();
        }
    }

    static async findById(id, options = { populate: false }) {
        const conn = await connection();
        try {
            const result = await conn.execute(
                `SELECT c.*, u.prenom as creator_prenom, u.nom as creator_nom 
                 FROM collections c
                 JOIN users u ON c.creator_id = u.id
                 WHERE c.id = :id`,
                { id },
                { outFormat: oracledb.OBJECT }
            );

            if (!result.rows.length) return null;
            const collection = result.rows[0];

            if (options.populate) {
                const profiles = await conn.execute(
                    `SELECT p.* 
                     FROM collection_profiles cp
                     JOIN profiles p ON cp.profil_id = p.id
                     WHERE cp.collection_id = :id`,
                    { id },
                    { outFormat: oracledb.OBJECT }
                );
                collection.collectionProfils = profiles.rows;

                const [actorsToUse, actorsToUpdate] = await Promise.all([
                    this._getActors(conn, 'collection_actors_use', id),
                    this._getActors(conn, 'collection_actors_update', id)
                ]);
                collection.actorsToUse = actorsToUse;
                collection.actorsToUpdate = actorsToUpdate;
            } else {
                const [profiles, actorsToUse, actorsToUpdate] = await Promise.all([
                    this._getRelationIds(conn, 'collection_profiles', 'profil_id', id),
                    this._getRelationIds(conn, 'collection_actors_use', 'user_id', id),
                    this._getRelationIds(conn, 'collection_actors_update', 'user_id', id)
                ]);
                collection.collectionProfils = profiles;
                collection.actorsToUse = actorsToUse;
                collection.actorsToUpdate = actorsToUpdate;
            }

            return collection;
        } catch (err) {
            logger.error({ 
                message: 'Error finding collection by ID', 
                error: err.message,
                stack: err.stack
            });
            throw this._handleError(err);
        } finally {
            await conn.close();
        }
    }

    static async _getActors(conn, table, collectionId) {
        const result = await conn.execute(
            `SELECT u.id, u.prenom, u.nom, u.email 
             FROM ${table} ct
             JOIN users u ON ct.user_id = u.id
             WHERE ct.collection_id = :id`,
            { id: collectionId },
            { outFormat: oracledb.OBJECT }
        );
        return result.rows;
    }

    static async _getRelationIds(conn, table, idField, collectionId) {
        const result = await conn.execute(
            `SELECT ${idField} FROM ${table} WHERE collection_id = :id`,
            { id: collectionId },
            { outFormat: oracledb.OBJECT }
        );
        return result.rows.map(row => row[idField]);
    }

    static async findAll({ search = '', page = 1, limit = 10, dateCreation, nom, membre, user_count }) {
        const conn = await connection();
        try {
            let baseQuery = `
                SELECT c.*, u.prenom as creator_prenom, u.nom as creator_nom,
                       (SELECT COUNT(*) FROM collection_profiles cp WHERE cp.collection_id = c.id) as profile_count
                FROM collections c
                JOIN users u ON c.creator_id = u.id
            `;
            let whereClauses = [];
            const params = {};
    
            if (search) {
                whereClauses.push(`LOWER(c.collectionName) LIKE :search`);
                params.search = `%${search.toLowerCase()}%`;
            }
    
            if (nom) {
                whereClauses.push(`LOWER(c.collectionName) LIKE :nom`);
                params.nom = `%${nom.toLowerCase()}%`;
            }
    
            if (dateCreation) {
                const startDate = new Date(dateCreation);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
                whereClauses.push(`c.createdAt >= :startDate AND c.createdAt < :endDate`);
                params.startDate = startDate;
                params.endDate = endDate;
            }
    
            if (membre) {
                baseQuery += ` JOIN collection_profiles cp ON c.id = cp.collection_id`;
                whereClauses.push(`cp.profil_id = :membre`);
                params.membre = membre;
            }
    
            let where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
            let query = `${baseQuery} ${where} ORDER BY c.collectionName`;
    
            if (limit > 0) {
                const countQuery = `SELECT COUNT(*) as total FROM collections c ${where}`;
                const countResult = await conn.execute(countQuery, params);
                const total = countResult.rows[0][0];
                const totalPages = Math.ceil(total / limit);
    
                const offset = (page - 1) * limit;
                query += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
                params.offset = offset;
                params.limit = limit;
    
                const result = await conn.execute(query, params, { outFormat: oracledb.OBJECT });
                
                return {
                    collections: result.rows,
                    pagination: {
                        total,
                        totalPages,
                        currentPage: page,
                        limit
                    }
                };
            } else {
                const result = await conn.execute(query, params, { outFormat: oracledb.OBJECT });
                return { collections: result.rows };
            }
        } catch (err) {
            logger.error({ 
                message: 'Error finding collections', 
                error: err.message,
                stack: err.stack
            });
            throw this._handleError(err);
        } finally {
            await conn.close();
        }
    }

    static async update(id, collectionData) {
        const conn = await connection();
        try {
            conn.autoCommit = false;
    
            const updateResult = await conn.execute(
                `UPDATE collections 
                 SET collectionName = :collectionName,
                     updatedAt = CURRENT_TIMESTAMP
                 WHERE id = :id`,
                { id, collectionName: collectionData.collectionName }
            );
    
            if (updateResult.rowsAffected === 0) {
                throw new Error('Collection not found');
            }
    
            const updateRelations = async (table, items, idField) => {
                await conn.execute(
                    `DELETE FROM ${table} WHERE collection_id = :id`,
                    { id }
                );
                
                if (items?.length) {
                    const binds = items.map(itemId => ({
                        collection_id: id,
                        [idField]: itemId
                    }));
                    await conn.executeMany(
                        `INSERT INTO ${table} (collection_id, ${idField}) 
                         VALUES (:collection_id, :${idField})`,
                        binds
                    );
                }
            };
    
            await Promise.all([
                updateRelations('collection_profiles', collectionData.collectionProfils, 'profil_id'),
                updateRelations('collection_actors_use', collectionData.actorsToUse, 'user_id'),
                updateRelations('collection_actors_update', collectionData.actorsToUpdate, 'user_id')
            ]);
    
            await conn.commit();
            return true;
        } catch (err) {
            await conn.rollback();
            logger.error({ 
                message: 'Update failed',
                error: err.message,
                stack: err.stack
            });
            throw this._handleError(err);
        } finally {
            conn.autoCommit = true;
            await conn.close();
        }
    }

    static async delete(id) {
        const conn = await connection();
        try {
            const result = await conn.execute(
                `DELETE FROM collections WHERE id = :id`,
                { id }
            );
            await conn.commit();
            return result.rowsAffected > 0;
        } catch (err) {
            await conn.rollback();
            logger.error({ 
                message: 'Error deleting collection', 
                error: err.message,
                stack: err.stack
            });
            throw this._handleError(err);
        } finally {
            await conn.close();
        }
    }

    static async clone(originalId, baseName, creatorId) {
        const conn = await connection();
        try {
            conn.autoCommit = false;
            
            const original = await this.findById(originalId);
            if (!original) throw new Error('Original collection not found');

            // Generate unique collection name
            const existingResult = await conn.execute(
                `SELECT collectionName FROM collections 
                 WHERE collectionName LIKE :baseName || '%' 
                 ORDER BY collectionName`,
                { baseName },
                { outFormat: oracledb.OBJECT }
            );

            let copyNumber = 1;
            const nameRegex = new RegExp(`^${escapeRegExp(baseName)} -copie\\((\\d+)\\)$`);
            
            existingResult.rows.forEach(row => {
                const match = row.COLLECTIONNAME.match(nameRegex);
                if (match) {
                    copyNumber = Math.max(copyNumber, parseInt(match[1]) + 1);
                }
            });

            const newCollectionName = `${baseName} -copie(${copyNumber})`;

            const newId = uuidv4();
            await conn.execute(
                `INSERT INTO collections (id, collectionName, creator_id)
                 VALUES (:id, :collectionName, :creatorId)`,
                { id: newId, collectionName: newCollectionName, creatorId }
            );

            const copyRelations = async (table, ids, idField) => {
                if (!ids?.length) return;
                const binds = ids.map(id => ({
                    collection_id: newId,
                    [idField]: id
                }));
                await conn.executeMany(
                    `INSERT INTO ${table} (collection_id, ${idField})
                     VALUES (:collection_id, :${idField})`,
                    binds
                );
            };

            await Promise.all([
                copyRelations('collection_profiles', original.collectionProfils, 'profil_id'),
                copyRelations('collection_actors_use', original.actorsToUse, 'user_id'),
                copyRelations('collection_actors_update', original.actorsToUpdate, 'user_id')
            ]);

            await conn.commit();
            return { 
                id: newId, 
                collectionName: newCollectionName,
                creatorId,
                collectionProfils: original.collectionProfils,
                actorsToUse: original.actorsToUse,
                actorsToUpdate: original.actorsToUpdate
            };
        } catch (err) {
            await conn.rollback();
            logger.error({ 
                message: 'Error cloning collection', 
                error: err.message,
                stack: err.stack,
                originalId,
                baseName
            });
            throw this._handleError(err);
        } finally {
            conn.autoCommit = true;
            await conn.close();
        }
    }

    static async addProfilesToCollections(collectionIds, profileIds) {
        const conn = await connection();
        try {
            conn.autoCommit = false;
            
            const existingQuery = `
                SELECT collection_id, profil_id 
                FROM collection_profiles 
                WHERE collection_id IN (${collectionIds.map((_, i) => `:id${i}`).join(',')})
                AND profil_id IN (${profileIds.map((_, i) => `:pid${i}`).join(',')})
            `;
            
            const existingParams = {
                ...collectionIds.reduce((acc, id, i) => ({ ...acc, [`id${i}`]: id }), {}),
                ...profileIds.reduce((acc, id, i) => ({ ...acc, [`pid${i}`]: id }), {})
            };
            
            const existingResult = await conn.execute(
                existingQuery,
                existingParams,
                { outFormat: oracledb.OBJECT }
            );

            const existingSet = new Set(
                existingResult.rows.map(r => `${r.COLLECTION_ID}|${r.PROFIL_ID}`)
            );
            
            const inserts = [];
            for (const collectionId of collectionIds) {
                for (const profileId of profileIds) {
                    if (!existingSet.has(`${collectionId}|${profileId}`)) {
                        inserts.push({ collection_id: collectionId, profil_id: profileId });
                    }
                }
            }

            if (inserts.length) {
                await conn.executeMany(
                    `INSERT INTO collection_profiles (collection_id, profil_id)
                     VALUES (:collection_id, :profil_id)`,
                    inserts
                );
            }

            await conn.commit();
            return true;
        } catch (err) {
            await conn.rollback();
            logger.error({ 
                message: 'Error adding profiles to collections', 
                error: err.message,
                stack: err.stack
            });
            throw this._handleError(err);
        } finally {
            conn.autoCommit = true;
            await conn.close();
        }
    }

    static async findByIds(ids) {
        const conn = await connection();
        try {
            if (!ids?.length) return [];
    
            const bindVars = {};
            ids.forEach((id, i) => {
                bindVars[`id${i}`] = id;
            });
    
            const result = await conn.execute(
                `SELECT c.*, 
                        (SELECT COUNT(*) FROM collection_profiles cp WHERE cp.collection_id = c.id) as profile_count
                 FROM collections c
                 WHERE c.id IN (${ids.map((_, i) => `:id${i}`).join(',')})`,
                bindVars,
                { outFormat: oracledb.OBJECT }
            );
    
            return result.rows || [];
        } catch (err) {
            logger.error({ 
                message: 'Error in findByIds', 
                error: err.message,
                stack: err.stack
            });
            throw err;
        } finally {
            if (conn) await conn.close();
        }
    }

    static _handleError(err) {
        if (err.errorNum) {
            const error = new Error(err.message);
            if (err.errorNum === 1) {
                error.message = 'Collection name must be unique';
                error.status = 409;
            } else if (err.errorNum === 2291) {
                error.message = 'Referenced entity does not exist';
                error.status = 400;
            } else {
                error.status = 500;
            }
            return error;
        }
        
        if (err.status) return err;
        
        const error = new Error(err.message || 'Internal server error');
        error.status = 500;
        return error;
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = Collection;