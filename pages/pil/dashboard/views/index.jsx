import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import {
  Snippet,
  ErrorSummary,
  Header,
  SectionList,
  Form
} from '@asl/components';
import { Button } from '@ukhomeoffice/react-components';
import { dateFormat } from '../../../../constants';
import { formatDate, canUpdateModel } from '../../../../lib/utils';

import InProgressWarning from '../../../common/components/in-progress-warning';

import {
  certificate as certificatesSchema,
  modules as modulesSchema,
  species as speciesSchema
} from '../../training/schema';

import SectionDetails from './section-details';
import ProceduresDiff from '../../procedures/views/diff';
import SpeciesDiff from '../../species/views/diff';

function confirmDelete(e) {
  e.preventDefault();

  if (window.confirm('Are you sure you want to delete this draft PIL application?')) {
    e.target.submit();
  }
}

function SubmitPIL({ formFields, snippet }) {
  return (
    <Fragment>
      {
        formFields
      }
      <Button><Snippet>{ snippet }</Snippet></Button>
    </Fragment>
  );
}

const Index = ({
  pil,
  establishment,
  certificates,
  exemptions,
  model,
  isAsru,
  isLicensing,
  canTransferPil,
  skipExemptions,
  skipTraining
}) => {

  const sections = [
    {
      name: 'details',
      page: 'profile.read',
      completed: true
    },
    {
      name: 'establishment',
      page: 'establishment.read',
      template: <p>{ model.establishment.to ? model.establishment.to.name : model.establishment.from.name }</p>,
      addOrEdit: 'edit',
      completed: true,
      canTransferPil
    },
    {
      name: 'procedures',
      page: 'pil.update.procedures',
      removeLink: false,
      models: model.procedures || [],
      template: <ProceduresDiff before={pil} after={model} />,
      addOrEdit: 'edit',
      completed: model.procedures && model.procedures.length > 0
    },
    {
      name: 'species',
      page: 'pil.update.species',
      models: model.species || [],
      template: <SpeciesDiff before={pil} after={model} />,
      addOrEdit: 'edit',
      completed: model.species && model.species.length > 0
    },
    {
      name: 'training',
      page: 'pil.update.training.exempt',
      models: certificates,
      modelTitle: index => <p><strong>Certificate {index + 1}</strong></p>,
      schema: { ...certificatesSchema, ...modulesSchema, ...speciesSchema },
      formatters: {
        passDate: {
          format: date => formatDate(date, dateFormat.long)
        },
        modules: {
          format: modules => (
            <ul>
              {
                modules.map(({ module, species }, index) =>
                  <li key={index}>
                    { module }
                  </li>
                )
              }
            </ul>
          )
        },
        species: {
          format: species => species && species.length
            ? <ul>
              {
                species.map((s, index) => <li key={index}>{s}</li>)
              }
            </ul>
            : '-'
        }
      },
      addLink: <Snippet>actions.add-certificate</Snippet>,
      completed: certificates.length > 0 || skipTraining
    },
    {
      name: 'exemptions',
      page: 'pil.update.exemptions.exempt',
      models: exemptions,
      modelTitle: index => <p><strong>Exemption {index + 1}</strong></p>,
      schema: {
        module: {},
        species: {},
        description: {}
      },
      formatters: {
        species: {
          format: species => (
            <ul>{ (species || []).map((type, index) => <li key={index}>{type}</li>) }</ul>
          )
        }
      },
      addOrEdit: 'edit',
      completed: exemptions.length > 0 || skipExemptions
    }
  ];

  const isPilTransfer = !!model.establishment.to;
  let submitSnippet = 'buttons.submit';

  if (isAsru && !isPilTransfer) {
    submitSnippet = 'buttons.submitAsAsru';

    if (isLicensing) {
      submitSnippet = 'buttons.submitAsLicensing';
    }
  }

  if (!canUpdateModel(model)) {
    return <InProgressWarning task={model.openTasks[0]} />;
  }

  return (
    <Fragment>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <ErrorSummary />
        </div>
      </div>

      <Header
        title={
          model.status === 'active'
            ? <Snippet>pil.titleAmend</Snippet>
            : <Snippet>pil.title</Snippet>
        }
        subtitle={establishment.name}
      />
      <p><Snippet>pil.summary</Snippet></p>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <SectionList sections={sections.map(s => ({ ...s, Component: SectionDetails }))} />
          <Form detachFields submit={false}>
            <SubmitPIL snippet={submitSnippet} />
          </Form>
          {
            model.status === 'pending' && (
              <form
                action="delete"
                method="POST"
                onSubmit={confirmDelete}
              >
                <button className="link"><span>Discard draft application</span></button>
              </form>
            )
          }
        </div>
      </div>
    </Fragment>
  );
};

const mapStateToProps = ({
  model,
  static: {
    pil,
    establishment,
    profile: {
      exemptions,
      certificates
    },
    isAsru,
    isLicensing,
    canTransferPil,
    skipExemptions,
    skipTraining
  }
}) => ({
  pil,
  establishment,
  exemptions,
  certificates,
  model,
  isAsru,
  isLicensing,
  canTransferPil,
  skipExemptions,
  skipTraining
});

export default connect(mapStateToProps)(Index);
