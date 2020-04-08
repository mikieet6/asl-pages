import React from 'react';
import fetch from 'r2';
import { get } from 'lodash';
import { Router } from 'express';
import { renderToStaticMarkup } from 'react-dom/server';
import createStore from '@asl/projects/client/store';
import { getProjectEstablishment } from '../middleware';
import Licence from './views';
import NTS from './views/nts';
import Header from '../../common/views/pdf/header';
import Footer from '../../common/views/pdf/footer';
import content from '../../common/content';

module.exports = settings => {
  const app = Router();

  app.use(getProjectEstablishment());

  const setupPdf = (req, res, next) => {
    const initialState = {
      project: req.version.data || { title: 'Untitled project' },
      application: {
        schemaVersion: req.project.schemaVersion,
        establishment: req.project.establishment,
        project: req.project,
        isGranted: true,
        readonly: true,
        showConditions: true
      },
      static: {
        content,
        isPdf: true
      }
    };

    req.pdf = {};

    req.pdf.store = createStore(initialState);
    req.pdf.nonce = res.locals.static.nonce;

    req.pdf.header = renderToStaticMarkup(<Header store={req.pdf.store} model={req.project} licenceType="ppl" nonce={req.pdf.nonce} version={req.version} />);
    req.pdf.footer = renderToStaticMarkup(<Footer />);
    req.pdf.hasStatusBanner = req.project.status !== 'active' || (req.project.status === 'active' && req.project.granted.id !== req.version.id);

    next();
  };

  const convertToPdf = (req, res, next) => {
    const params = {
      method: 'POST',
      json: {
        template: req.pdf.body,
        pdfOptions: {
          displayHeaderFooter: true,
          headerTemplate: req.pdf.header,
          footerTemplate: req.pdf.footer,
          margin: {
            top: req.pdf.hasStatusBanner ? 180 : 100,
            left: 25,
            right: 25,
            bottom: 125
          }
        }
      }
    };

    return fetch(`${settings.pdfService}/convert`, params)
      .response
      .then(response => {
        if (response.status < 300) {
          const title = get(req.version, 'data.title') || 'Untitled project';
          res.attachment(`${title}.pdf`);
          response.body.pipe(res);
        } else {
          throw new Error(`Error generating PDF - generator responded ${response.status}`);
        }
      })
      .catch(next);
  };

  const renderLicence = (req, res, next) => {
    req.pdf.body = renderToStaticMarkup(<Licence store={req.pdf.store} nonce={req.pdf.nonce} />);
    next();
  };

  const renderNts = (req, res, next) => {
    req.pdf.body = renderToStaticMarkup(<NTS store={req.pdf.store} nonce={req.pdf.nonce} schemaVersion={req.project.schemaVersion} />);
    next();
  };

  app.get('/',
    setupPdf,
    renderLicence,
    convertToPdf
  );

  app.get('/nts',
    setupPdf,
    renderNts,
    convertToPdf
  );

  return app;
};
