// models/MonthlyExpenseItem.js
'use strict'; // Buena práctica para habilitar el modo estricto de JavaScript

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Importa tu instancia centralizada de Sequelize

// Opcional pero recomendado: Verificación para asegurar que 'sequelize' se cargó correctamente
if (!sequelize || typeof sequelize.define !== 'function') {
  throw new Error('ERROR en MonthlyExpenseItem.js: La instancia de Sequelize no se cargó correctamente desde ../config/database.js. Verifica la ruta y la exportación en config/database.js.');
}

const MonthlyExpenseItem = sequelize.define('MonthlyExpenseItem', {
    idExpenseItem: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    idOverallMonth: { // Foreign Key para MonthlyOverallExpense
        type: DataTypes.INTEGER,
        allowNull: false,
        // Las referencias (constraints de FK) se definen mejor en las asociaciones
        // en 'models/index.js' para evitar dependencias circulares al cargar modelos
        // y para mantener las definiciones de relaciones centralizadas.
        // Si necesitas definirla aquí por alguna razón específica:
        // references: {
        //   model: 'monthly_overall_expenses', // Nombre de la TABLA de MonthlyOverallExpense
        //   key: 'idOverallMonth',          // Nombre de la Columna PK en la tabla referenciada
        // },
    },
    idSpecificConcept: { // Foreign Key para SpecificConceptSpent
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //   model: 'specific_concept_spents', // Nombre de la TABLA de SpecificConceptSpent
        //   key: 'idSpecificConcept',      // Nombre de la Columna PK en la tabla referenciada (ajusta si es 'id')
        // },
    },
    productName: { // Nombre del producto o descripción detallada del ítem de gasto
        type: DataTypes.STRING(255), // Especificar longitud es una buena práctica
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER, // O DataTypes.DECIMAL(10, 2) si la cantidad puede ser fraccional
        allowNull: false,
        validate: {
            min: 1 // Por ejemplo, la cantidad no puede ser cero o negativa
        }
    },
    unitValue: {
        type: DataTypes.DECIMAL(12, 2), // Precisión y escala adecuadas para valores monetarios
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0 // El valor unitario no debería ser negativo
        }
    },
    totalValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0 // El valor total no debería ser negativo
        }
        // Nota: podrías considerar calcular este valor automáticamente usando hooks de Sequelize
        // (beforeValidate, beforeSave) o a nivel de aplicación/base de datos.
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Usualmente los ítems se crean activos
    }
    // Sequelize manejará automáticamente los campos `createdAt` y `updatedAt`
    // si `timestamps` es `true` en las opciones del modelo (lo es por defecto).
}, {
    tableName: 'monthly_expense_items', // Nombre explícito y consistente para la tabla en la base de datos
    timestamps: true, // Habilita los campos createdAt y updatedAt
    // indexes: [ // Opcional: Definir índices para mejorar el rendimiento de las búsquedas
    //   {
    //     fields: ['idOverallMonth']
    //   },
    //   {
    //     fields: ['idSpecificConcept']
    //   }
    // ]
});

// Método estático 'associate' (OPCIONAL si todas las asociaciones se definen en models/index.js)
// Si decides usar el bucle `Object.keys(db).forEach(modelName => { db[modelName].associate(db); });`
// en tu `models/index.js`, entonces este método sería llamado.
// Sin embargo, si ya defines TODAS las asociaciones explícitamente en `models/index.js`,
// este método aquí no es estrictamente necesario para esas asociaciones específicas.
/*
MonthlyExpenseItem.associate = function(models) {
  // Asociación con MonthlyOverallExpense
  MonthlyExpenseItem.belongsTo(models.MonthlyOverallExpense, {
    foreignKey: 'idOverallMonth',
    as: 'overallMonthRecord', // Debe coincidir con el alias usado en models/index.js si se define allí
    onDelete: 'CASCADE', // Opcional: define el comportamiento al eliminar el registro padre
    onUpdate: 'CASCADE'  // Opcional: define el comportamiento al actualizar el registro padre
  });

  // Asociación con SpecificConceptSpent
  MonthlyExpenseItem.belongsTo(models.SpecificConceptSpent, {
    foreignKey: 'idSpecificConcept',
    as: 'concept', // Debe coincidir con el alias usado en models/index.js si se define allí
    // onDelete y onUpdate según sea necesario
  });
};
*/

module.exports = MonthlyExpenseItem; // Exporta el modelo de Sequelize directamente