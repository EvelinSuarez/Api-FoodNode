'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // --- NOMBRES DE LAS RESTRICCIONES (¡¡SUSTITUIR!!) ---
    const uniqueConstraintToRemove = 'rolePrivileges_idPermission_idRole_unique'; // Nombre de la UNIQUE constraint a eliminar
    const fkConstraintForIdRole = 'FK_NAME_FOR_IDROLE';         // <-- ¡SUSTITUYE CON EL NOMBRE REAL DE LA FK para idRole!
    const fkConstraintForIdPermission = 'FK_NAME_FOR_IDPERMISSION'; // <-- ¡SUSTITUYE CON EL NOMBRE REAL DE LA FK para idPermission!
    // ----------------------------------------------------
    const newUniqueConstraintName = 'rolePrivileges_idRole_idPermission_idPrivilege_unique';

    console.log(`Migration UP starting for rolePrivileges table...`);

    // Paso 1: Eliminar las claves foráneas dependientes
    try {
      console.log(`Attempting to remove FK constraint: ${fkConstraintForIdRole}`);
      await queryInterface.removeConstraint('rolePrivileges', fkConstraintForIdRole);
      console.log(`Successfully removed FK: ${fkConstraintForIdRole}`);

      console.log(`Attempting to remove FK constraint: ${fkConstraintForIdPermission}`);
      await queryInterface.removeConstraint('rolePrivileges', fkConstraintForIdPermission);
      console.log(`Successfully removed FK: ${fkConstraintForIdPermission}`);
    } catch (error) {
      console.error(`Error removing foreign key constraints: ${error.message}`);
      throw error; // Detener si no se pueden eliminar las FK
    }

    // Paso 2: Eliminar la restricción UNIQUE conflictiva
    try {
      console.log(`Attempting to remove UNIQUE constraint: ${uniqueConstraintToRemove}`);
      await queryInterface.removeConstraint('rolePrivileges', uniqueConstraintToRemove);
      console.log(`Successfully removed UNIQUE constraint: ${uniqueConstraintToRemove}`);
    } catch (error) {
      console.error(`Error removing unique constraint ${uniqueConstraintToRemove}: ${error.message}`);
      // Podría fallar si no existía, pero el error original indica que sí existe.
      // Continuar de todos modos para intentar añadir la nueva y las FK.
       console.warn(`Could not remove constraint ${uniqueConstraintToRemove}, possibly already removed or name mismatch. Continuing...`);
    }

    // Paso 3 (Opcional pero recomendado): Añadir la nueva restricción UNIQUE(idRole, idPermission, idPrivilege)
    try {
      console.log(`Attempting to add new UNIQUE constraint: ${newUniqueConstraintName}`);
      await queryInterface.addConstraint('rolePrivileges', {
        fields: ['idRole', 'idPermission', 'idPrivilege'],
        type: 'unique',
        name: newUniqueConstraintName
      });
      console.log(`Successfully added new UNIQUE constraint: ${newUniqueConstraintName}`);
    } catch (error) {
      console.error(`Error adding new unique constraint ${newUniqueConstraintName}: ${error.message}`);
      // No detener aquí, intentar re-añadir las FK
       console.warn(`Could not add new unique constraint ${newUniqueConstraintName}. Check if it already exists.`);
    }

    // Paso 4: Re-añadir las claves foráneas
    try {
      console.log(`Attempting to re-add FK constraint for idRole: ${fkConstraintForIdRole}`);
      await queryInterface.addConstraint('rolePrivileges', {
        fields: ['idRole'],
        type: 'foreign key',
        name: fkConstraintForIdRole, // Usa el mismo nombre original
        references: {
          table: 'roles', // Nombre de la tabla referenciada
          field: 'idRole'  // Nombre de la columna referenciada
        },
        onDelete: 'CASCADE', // O la acción que tuvieras (NO ACTION, SET NULL, etc.)
        onUpdate: 'CASCADE'  // O la acción que tuvieras
      });
      console.log(`Successfully re-added FK: ${fkConstraintForIdRole}`);

      console.log(`Attempting to re-add FK constraint for idPermission: ${fkConstraintForIdPermission}`);
      await queryInterface.addConstraint('rolePrivileges', {
        fields: ['idPermission'],
        type: 'foreign key',
        name: fkConstraintForIdPermission, // Usa el mismo nombre original
        references: {
          table: 'permissions', // Nombre de la tabla referenciada
          field: 'idPermission'  // Nombre de la columna referenciada
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      console.log(`Successfully re-added FK: ${fkConstraintForIdPermission}`);
    } catch (error) {
      console.error(`Error re-adding foreign key constraints: ${error.message}`);
      throw error; // Detener si no se pueden re-añadir las FK
    }

    console.log(`Migration UP finished successfully.`);
  },

  async down (queryInterface, Sequelize) {
    // Revierte los pasos en orden inverso
    // --- NOMBRES DE LAS RESTRICCIONES (¡¡SUSTITUIR IGUAL QUE ARRIBA!!) ---
    const uniqueConstraintToRemove = 'rolePrivileges_idPermission_idRole_unique';
    const fkConstraintForIdRole = 'FK_NAME_FOR_IDROLE';
    const fkConstraintForIdPermission = 'FK_NAME_FOR_IDPERMISSION';
    const newUniqueConstraintName = 'rolePrivileges_idRole_idPermission_idPrivilege_unique';
    // ----------------------------------------------------

    console.log(`Migration DOWN starting for rolePrivileges table...`);

    // Paso 1 (Down): Eliminar las claves foráneas re-añadidas
    try {
      console.log(`Attempting to remove FK constraint: ${fkConstraintForIdRole}`);
      await queryInterface.removeConstraint('rolePrivileges', fkConstraintForIdRole);
      console.log(`Successfully removed FK: ${fkConstraintForIdRole}`);

      console.log(`Attempting to remove FK constraint: ${fkConstraintForIdPermission}`);
      await queryInterface.removeConstraint('rolePrivileges', fkConstraintForIdPermission);
      console.log(`Successfully removed FK: ${fkConstraintForIdPermission}`);
    } catch (error) {
      console.error(`Error removing foreign key constraints during DOWN: ${error.message}`);
      // Continuar para intentar revertir el resto
    }

    // Paso 2 (Down): Eliminar la nueva restricción UNIQUE (si se añadió)
     try {
      console.log(`Attempting to remove new UNIQUE constraint: ${newUniqueConstraintName}`);
      await queryInterface.removeConstraint('rolePrivileges', newUniqueConstraintName);
      console.log(`Successfully removed new UNIQUE constraint: ${newUniqueConstraintName}`);
    } catch (error) {
       console.error(`Error removing new unique constraint ${newUniqueConstraintName} during DOWN: ${error.message}`);
    }

    // Paso 3 (Down): Re-añadir la restricción UNIQUE original
    try {
      console.log(`Attempting to re-add original UNIQUE constraint: ${uniqueConstraintToRemove}`);
      await queryInterface.addConstraint('rolePrivileges', {
        fields: ['idPermission', 'idRole'], // Asegúrate del orden original
        type: 'unique',
        name: uniqueConstraintToRemove
      });
       console.log(`Successfully re-added original UNIQUE constraint: ${uniqueConstraintToRemove}`);
    } catch (error) {
      console.error(`Error re-adding original unique constraint ${uniqueConstraintToRemove} during DOWN: ${error.message}`);
    }

    // Paso 4 (Down): Re-añadir las claves foráneas originales
    try {
      console.log(`Attempting to re-add original FK constraint for idRole: ${fkConstraintForIdRole}`);
      await queryInterface.addConstraint('rolePrivileges', {
        fields: ['idRole'], type: 'foreign key', name: fkConstraintForIdRole,
        references: { table: 'roles', field: 'idRole' },
        onDelete: 'CASCADE', onUpdate: 'CASCADE'
      });
       console.log(`Successfully re-added original FK: ${fkConstraintForIdRole}`);

      console.log(`Attempting to re-add original FK constraint for idPermission: ${fkConstraintForIdPermission}`);
      await queryInterface.addConstraint('rolePrivileges', {
        fields: ['idPermission'], type: 'foreign key', name: fkConstraintForIdPermission,
        references: { table: 'permissions', field: 'idPermission' },
        onDelete: 'CASCADE', onUpdate: 'CASCADE'
      });
      console.log(`Successfully re-added original FK: ${fkConstraintForIdPermission}`);
    } catch (error) {
      console.error(`Error re-adding original foreign key constraints during DOWN: ${error.message}`);
    }
     console.log(`Migration DOWN finished.`);
  }
};