import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import {
  Snippet,
  Link,
  Sidebar,
  Header,
  PanelList,
  LicenceStatusBanner
} from '@asl/components';
import { ProfileLink } from '../../components';

const links = [
  { path: 'establishment.read', permissions: 'establishment.read' },
  { path: 'place.list', permissions: 'place.read' },
  { path: 'profile.list', permissions: 'profile.read.basic' },
  { path: 'project.list', permissions: 'project.read.basic' }
];

const DashboardLink = ({ path }) => (
  <Fragment>
    <Link page={path} label={<Snippet>{`pages.${path}`}</Snippet>} />
    <p><Snippet>{`dashboard.${path}.subtitle`}</Snippet></p>
  </Fragment>
);

const Index = ({
  establishment,
  allowedActions,
  asruAdmin
}) => {

  return (
    <Fragment>
      <LicenceStatusBanner licence={establishment} licenceType="pel" />

      <Header title={establishment.name} />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <PanelList
            panels={links.filter(link => allowedActions.includes(link.permissions)).map(link => <DashboardLink key={link.path} { ...link } />)}
          />
        </div>
        <Sidebar>
          <dl>
            <dt><Snippet>establishmentLicenceNumber</Snippet></dt>
            <dd>{ establishment.licenceNumber }</dd>

            {
              establishment.pelh && <ProfileLink type="pelh" profile={establishment.pelh} />
            }
            {
              establishment.nprc && <ProfileLink type="nprc" profile={establishment.nprc} />
            }
            <dt><Snippet>inspectors</Snippet></dt>
            {
              !establishment.asru.filter(p => p.asruInspector).length && <p>None</p>
            }
            {
              !asruAdmin && establishment.asru.filter(p => p.asruInspector).map(asru => (
                <p key={`${asru.id}`}>{`${asru.firstName} ${asru.lastName}`}</p>
              ))
            }
            {
              asruAdmin && establishment.asru.filter(p => p.asruInspector).map(asru => (
                <Fragment key={`${asru.id}`}>
                  <Link page="global.profile" profileId={asru.id} label={`${asru.firstName} ${asru.lastName}`} />
                  <br />
                </Fragment>
              ))
            }
            { asruAdmin && <dd><Link page="establishment.asru" asruUser="inspectors" label={ <Snippet>pages.edit</Snippet> } /></dd> }

            <dt><Snippet>spoc</Snippet></dt>
            {
              !establishment.asru.filter(p => p.asruLicensing).length && <p>None</p>
            }
            {
              !asruAdmin && establishment.asru.filter(p => p.asruLicensing).map(asru => (
                <p key={`${asru.id}`}>{`${asru.firstName} ${asru.lastName}`}</p>
              ))
            }
            {
              asruAdmin && establishment.asru.filter(p => p.asruLicensing).map(asru => (
                <Fragment key={`${asru.id}`}>
                  <Link page="global.profile" profileId={asru.id} label={`${asru.firstName} ${asru.lastName}`} />
                  <br />
                </Fragment>
              ))
            }
            { asruAdmin && <dd><Link page="establishment.asru" asruUser="spocs" label={ <Snippet>pages.edit</Snippet> } /></dd> }
          </dl>
        </Sidebar>
      </div>
    </Fragment>
  )
  ;
};

const mapStateToProps = ({ static: { establishment, allowedActions, profile } }) => ({ establishment, allowedActions, asruAdmin: profile.asruUser && profile.asruAdmin });

export default connect(mapStateToProps)(Index);
