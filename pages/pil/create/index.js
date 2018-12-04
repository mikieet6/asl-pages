const { page } = require('@asl/service/ui');

module.exports = settings => {
  const app = page({
    ...settings,
    root: __dirname
  });

  app.use((req, res, next) => {
    if (!req.profile.pil) {
      return next();
    }
    res.redirect(req.buildRoute('pil.read', { pilId: req.profile.pil.id }));
  });

  app.post('/', (req, res, next) => {
    const { action } = req.query;

    if (action === 'catAF') {
      return Promise.resolve()
        // create empty PIL
        .then(() => req.api(`/establishment/${req.establishmentId}/profiles/${req.profileId}/pil`, { method: 'POST' }))
        // lookup created PIL
        .then(() => req.api(`/establishment/${req.establishmentId}/profiles/${req.profileId}`))
        .then(({ json: { data } }) => {
          return res.redirect(req.buildRoute('pil.update', { pilId: data.pil.id }));
        })
        .catch(next);
    }
    if (action === 'catE') {
      // TODO: cat e
    }

    return next();

  });

  return app;
};
