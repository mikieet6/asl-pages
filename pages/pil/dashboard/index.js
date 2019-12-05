const { page } = require('@asl/service/ui');
const UnauthorisedError = require('@asl/service/errors/unauthorised');
const { get, pick, merge, every } = require('lodash');
const form = require('../../common/routers/form');
const { success } = require('../../common/routers');
const { hydrate, updateDataFromTask, redirectToTaskIfOpen } = require('../../common/middleware');

module.exports = settings => {
  const sendData = (req, params = {}) => {
    let action = 'grant';

    const opts = {
      method: 'PUT',
      json: merge({
        data: pick(req.model, 'procedures', 'notesCatD', 'notesCatF', 'species')
      }, params)
    };

    if (req.model.establishment.to) {
      action = 'transfer';
      opts.json.data.establishment = req.model.establishment;
    }

    return req.api(`/establishment/${req.establishmentId}/profiles/${req.profileId}/pil/${req.pilId}/${action}`, opts);
  };

  const app = page({
    ...settings,
    root: __dirname,
    paths: ['/success']
  });

  app.get('/', hydrate());

  app.use((req, res, next) => {
    if (req.establishment.id !== req.pil.establishmentId) {
      next(new UnauthorisedError());
    }
    next();
  });

  app.use('/', (req, res, next) => {
    const params = {
      id: req.pilId,
      profileId: req.model.profileId,
      establishment: req.model.establishmentId
    };

    req.user.can('pil.update', params)
      .then(can => can ? next() : next(new Error('Unauthorised')))
      .catch(next);
  });

  app.use((req, res, next) => {
    const values = get(req.session, `form[${req.model.id}].values`);
    req.model = { ...req.model, ...values };

    const establishmentTransfer = req.user.profile.establishments
      .filter(e => e.id !== req.establishment.id)
      .find(e => e.id === get(req.model, 'establishmentId'));

    req.model.establishment = {
      from: pick(req.establishment, ['id', 'name']),
      to: establishmentTransfer ? pick(establishmentTransfer, ['id', 'name']) : null
    };

    next();
  });

  app.post('/', updateDataFromTask(sendData));

  app.use(form({
    requiresDeclaration: req => !req.user.profile.isAsru,
    validate: (req, res, next) => {
      const skipExemptions = get(req.session, [req.profileId, 'skipExemptions'], null);
      const skipTraining = get(req.session, [req.profileId, 'skipTraining'], null);

      const sectionComplete = {
        procedures: !!(req.model.procedures && req.model.procedures.length),
        species: !!(req.model.species && req.model.species.length),
        training: !!((req.profile.certificates && req.profile.certificates.length) || skipTraining),
        exemptions: !!((req.profile.exemptions && req.profile.exemptions.length) || skipExemptions)
      };

      if (!every(sectionComplete, Boolean)) {
        return next({ validation: { form: 'incomplete' } });
      }

      next();
    },
    locals: (req, res, next) => {
      res.locals.static.profile = req.profile;
      res.locals.static.skipExemptions = get(req.session, [req.profileId, 'skipExemptions'], null);
      res.locals.static.skipTraining = get(req.session, [req.profileId, 'skipTraining'], null);
      res.locals.static.isAsru = req.user.profile.asruUser;
      res.locals.static.isLicensing = req.user.profile.asruLicensing;

      // can only transfer own pil if it's active and has no in-progress amendment
      const hasOpenAmendment = req.pil.status === 'active' && get(req.model, 'openTasks[0].data.action') === 'grant';
      res.locals.static.canTransferPil = req.pil.status === 'active' && req.user.profile.id === req.profile.id && !hasOpenAmendment;

      next();
    }
  }));

  app.post('/', redirectToTaskIfOpen());

  app.post('/', (req, res, next) => {
    sendData(req)
      .then(() => res.redirect(req.buildRoute('pil.update', { suffix: 'success' })))
      .catch(next);
  });

  app.get('/success', (req, res, next) => {
    success({
      licence: 'pil',
      status: get(req.model, 'openTasks[0].status', 'autoresolved')
    })(req, res, next);
  });

  app.get((req, res) => res.sendResponse());

  return app;
};
