const getEstablishment = req =>
  req.api(`/establishment/${req.establishmentId}`)
    .then(({ json: { data } }) => Promise.resolve(data))
    .catch(err => Promise.reject(err));

const getNacwos = req =>
  req.api(`/establishments/${req.establishmentId}/roles`, { query: { type: 'nacwo' } })
    .then(({ json: { data } }) => Promise.resolve(data))
    .catch(err => Promise.reject(err));

const getNacwoById = (req, id) =>
  getNacwos(req)
    .then(nacwos => Promise.resolve(nacwos.find(n => n.id === id)))
    .catch(err => Promise.reject(err));

module.exports = {
  getNacwos,
  getNacwoById,
  getEstablishment
};
