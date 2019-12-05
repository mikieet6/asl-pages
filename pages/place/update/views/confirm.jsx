import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import {
  Diff,
  ModelSummary,
  Snippet,
  FormLayout,
  Field,
  Header,
  ControlBar
} from '@asl/components';
import formatters from '../../formatters';
import { hasChanged } from '../../../../lib/utils';
import LicenceHolder from '../../../common/components/licence-holder';

const Confirm = ({
  errors = {},
  action = 'update',
  values,
  model,
  schema,
  establishment: {
    name,
    licenceNumber,
    pelh,
    nprc
  },
  ...props
}) => (
  <FormLayout>
    <Header title={<Snippet>pages.place.confirm</Snippet>} />
    <dl className="inline">
      <dt><Snippet>establishment</Snippet></dt>
      <dd>{ name }</dd>

      <dt><Snippet>licenceNumber</Snippet></dt>
      <dd>{ licenceNumber }</dd>
      {
        pelh && <LicenceHolder type="pelh" profile={pelh} />
      }
      {
        nprc && <LicenceHolder type="nprc" profile={nprc} />
      }
    </dl>
    <h2><Snippet optional site={model.site}>subtitle</Snippet></h2>
    {
      action === 'create' || action === 'delete'
        ? (
          <Fragment>
            <ModelSummary formatters={formatters} />
            <hr />
          </Fragment>
        )
        : (
          <Diff
            schema={schema}
            before={model}
            after={values}
            formatters={formatters}
            comparator={hasChanged}
          />
        )
    }
    {
      model && model.restrictions && (
        <Field
          title={<Snippet>fields.restrictions.label</Snippet>}
          content={model.restrictions}
        />
      )
    }
    {
      values && values.changesToRestrictions && (
        <Field
          title={<Snippet>fields.changesToRestrictions.label</Snippet>}
          content={values.changesToRestrictions}
        />
      )
    }
    {
      values && values.comments && (
        <Field
          title={<Snippet>fields.comments.label</Snippet>}
          content={values.comments}
        />
      )
    }

    <ControlBar>
      <a href="?edit=true"><Snippet>buttons.edit</Snippet></a>
      <a href="?clear=true"><Snippet>buttons.cancel</Snippet></a>
    </ControlBar>
  </FormLayout>
);

const mapStateToProps = ({ model, static: { establishment, errors, values, diffSchema } }) => ({ establishment, model, errors, values, schema: diffSchema });

export default connect(mapStateToProps)(Confirm);
