const ConceptSpent = require('../models/conceptSpent');

const createConceptSpent = async (conceptSpent) => {
    return ConceptSpent.create(conceptSpent);
}

const getAllConceptSpents = async () => {
    return ConceptSpent.findAll();
}

const getConceptSpentById = async (id) => {
    return ConceptSpent.findByPk(id);
}

const updateConceptSpent = async (id, conceptSpent) => {
    return ConceptSpent.update(conceptSpent, { where: { id } });
}

const deleteConceptSpent = async (id) => {
    return ConceptSpent.destroy({ where: { id } });
}

const changeStateConceptSpent = async (id, state) => {
    return ConceptSpent.update({ state }, { where: { id } });
}

module.exports = {
    createConceptSpent,
    getAllConceptSpents,
    getConceptSpentById,
    updateConceptSpent,
    deleteConceptSpent,
    changeStateConceptSpent,
};
