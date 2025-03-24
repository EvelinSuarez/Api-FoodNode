const ConceptSpent = require('../models/conceptSpent');

const createConceptSpent = async (conceptSpent) => {
    return ConceptSpent.create(conceptSpent);
}

const getAllConceptSpents = async () => {
    return ConceptSpent.findAll();
}

const getConceptSpentById = async (idExpenseType) => {
    return ConceptSpent.findByPk(idExpenseType);
}

const updateConceptSpent = async (idExpenseType, conceptSpent) => {
    return ConceptSpent.update(conceptSpent, { where: { idExpenseType } });
}

const deleteConceptSpent = async (idExpenseType) => {
    return ConceptSpent.destroy({ where: { idExpenseType } });
}

const changeStateConceptSpent = async (idExpenseType, status) => {
    return ConceptSpent.update({ status }, { where: { idExpenseType } });
}

module.exports = {
    createConceptSpent,
    getAllConceptSpents,
    getConceptSpentById,
    updateConceptSpent,
    deleteConceptSpent,
    changeStateConceptSpent,
};
