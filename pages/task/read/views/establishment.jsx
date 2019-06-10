import React from 'react';
import { connect } from 'react-redux';
import {
  StickyNavPage,
  StickyNavAnchor,
  Snippet,
  DiffText
} from '@asl/components';
import LicenceHolder from '../../../common/components/licence-holder';
import WithdrawApplication from './withdraw-application';
import MakeDecision from './make-decision';

const Role = ({ establishment, profile, task, values, children, schema, formFields }) => (
  <StickyNavPage>
    { children }

    <StickyNavAnchor id="establishment">
      <h2><Snippet>sticky-nav.establishment</Snippet></h2>
      <dl className="inline">
        <dt><Snippet>establishment</Snippet></dt>
        <dd>{ establishment.name }</dd>

        <dt><Snippet>licenceNumber</Snippet></dt>
        <dd>{ establishment.licenceNumber }</dd>
        {
          establishment.pelh && <LicenceHolder type="pelh" profile={establishment.pelh} />
        }
        {
          establishment.nprc && <LicenceHolder type="nprc" profile={establishment.nprc} />
        }
      </dl>
    </StickyNavAnchor>

    {
      task.data.action === 'update-conditions' && (
        <StickyNavAnchor id="conditions">
          <h2><Snippet>sticky-nav.conditions</Snippet></h2>
          <DiffText oldValue={establishment.conditions} newValue={task.data.data.conditions} />
        </StickyNavAnchor>
      )
    }

    {
      schema.status.options.length > 0 && (
        <StickyNavAnchor id="status">
          <h2><Snippet>sticky-nav.status</Snippet></h2>
          <p><Snippet>make-decision.hint</Snippet></p>
          <MakeDecision schema={schema} formFields={formFields} />
          {
            task.canBeWithdrawn && <WithdrawApplication type={task.type} showHeading />
          }
        </StickyNavAnchor>
      )
    }

    {
      // if the only option is to withdraw, display the withdraw button
      schema.status.options.length === 0 && task.canBeWithdrawn && (
        <StickyNavAnchor id="withdraw">
          <h2><Snippet>sticky-nav.withdraw</Snippet></h2>
          <WithdrawApplication type={task.type} />
        </StickyNavAnchor>
      )
    }

  </StickyNavPage>
);

const mapStateToProps = ({ static: { establishment, profile, values, schema } }) => ({ establishment, profile, values, schema });

export default connect(mapStateToProps)(Role);