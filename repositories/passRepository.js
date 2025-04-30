// repositories/passRepository.js
const Pass = require('../models/pass');

const bulkCreatePass = async (passData, options = {}) => {
    return Pass.bulkCreate(passData, options);
};

const deletePassByReservationId = async (idReservation, options = {}) => {
    return Pass.destroy({ where: { idReservation }, ...options });
};

module.exports = {
    bulkCreatePass,
    deletePassByReservationId,
};