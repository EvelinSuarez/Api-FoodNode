const conceptSpentRepository = require('../repositories/conceptSpentRepository');

const createConceptSpent = async (conceptSpent) => {
    return conceptSpentRepository.createConceptSpent(conceptSpent);
}

const getAllConceptSpents = async () => {
    return conceptSpentRepository.getAllConceptSpents();
}

const getConceptSpentById = async (id) => {
    return conceptSpentRepository.getConceptSpentById(id);
}

const updateConceptSpent = async (id, conceptSpent) => {
    return conceptSpentRepository.updateConceptSpent(id, conceptSpent);
}

const deleteConceptSpent = async (id) => {
    return conceptSpentRepository.deleteConceptSpent(id);
}

const changeStateConceptSpent = async (id, state) => {
    return conceptSpentRepository.changeStateConceptSpent(id, state);
}

module.exports = {
    createConceptSpent,
    getAllConceptSpents,
    getConceptSpentById,
    updateConceptSpent,
    deleteConceptSpent,
    changeStateConceptSpent,
};
