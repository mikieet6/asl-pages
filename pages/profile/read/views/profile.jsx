import React, { Fragment } from 'react';
import isEmpty from 'lodash/isEmpty';
import format from 'date-fns/format';
import { defineValue } from '../../../common/formatters';
import { Snippet, Link } from '@asl/components';
import PilApply from './pil-apply';
import RoleApply from './role-apply';
import PplApply from './ppl-apply';
import { dateFormat } from '../../../../constants';

class Profile extends React.Component {
  render() {
    const { id: estId } = this.props.establishment;

    const {
      pil,
      address,
      postcode,
      telephone,
      email,
      roles,
      projects,
      establishments,
      id
    } = this.props.profile;

    const allowedActions = this.props.allowedActions;
    const title = this.props.title;
    const activeProjects = projects.filter(
      ({ establishmentId, status }) =>
        status === 'active' && establishmentId === estId
    );
    const estRoles = roles.filter(
      ({ establishmentId }) => establishmentId === estId
    );

    const profileRole = establishments.find(est => est.id === estId).role;

    return (
      <Fragment>
        <div className='content'>
          {title && <h2>{title}</h2>}
          <p>
            <Link
              page='establishment.dashboard'
              establishmentId={estId}
              label='About this establishment'
            />
          </p>

          <hr />

          {activeProjects && (
            <Fragment>
              <dl>
                <dt>
                  <Snippet>projects.title</Snippet>
                </dt>
                <dd>
                  {!isEmpty(activeProjects) &&
                    activeProjects.map(
                      project =>
                        project.status && (
                          <Fragment key={project.id}>
                            <p>
                              <Link page='project.list' label={project.title} />
                            </p>
                            <p>
                              <span>
                                <Snippet licenceNumber={project.licenceNumber}>
                                  projects.licenceNumber
                                </Snippet>
                              </span>
                            </p>
                            <p>
                              <span>
                                <Snippet
                                  expiryDate={format(
                                    project.expiryDate,
                                    dateFormat.medium
                                  )}
                                >
                                  projects.expiryDate
                                </Snippet>
                              </span>
                            </p>
                          </Fragment>
                        )
                    )}
                  {isEmpty(activeProjects) && (
                    <Snippet>projects.noProjects</Snippet>
                  )}
                </dd>
              </dl>
            </Fragment>
          )}
          <PplApply allowedActions={allowedActions} estId={estId} />

          <hr />

          {
            <Fragment>
              <dl>
                <dt>
                  <Snippet>responsibilities.title</Snippet>
                </dt>

                {!isEmpty(estRoles) && (
                  <Fragment>
                    {estRoles.map(({ type, id }) => (
                      <dd key={id}>{defineValue(type.toUpperCase())}</dd>
                    ))}
                  </Fragment>
                )}
                {isEmpty(estRoles) && (
                  <dd>
                    <Snippet>responsibilities.noRoles</Snippet>
                  </dd>
                )}
              </dl>
            </Fragment>
          }

          <RoleApply
            allowedActions={allowedActions}
            estId={estId}
            profileId={id}
          />

          <hr />

          {
            <dl>
              <dt>
                <Snippet>pil.title</Snippet>
              </dt>
              {pil && pil.licenceNumber && (
                <Fragment>
                  <dd>
                    <Link
                      page='pil.read'
                      pilId={pil.id}
                      label={pil.licenceNumber}
                    />
                  </dd>
                </Fragment>
              )}
              {!pil && (
                <dd>
                  <Snippet>pil.noPil</Snippet>
                </dd>
              )}
            </dl>
          }
          <PilApply
            pil={pil}
            allowedActions={allowedActions}
            estId={estId}
            profileId={id}
          />

          <hr />

          {(address || telephone || email) && (
            <Fragment>
              <dl>
                <dt>
                  <Snippet>contactDetails.title</Snippet>
                </dt>
                {email && (
                  <Fragment>
                    <dd>
                      <Snippet>contactDetails.email</Snippet>:{' '}
                      <a href={`mailto:${email}`}>{email}</a>
                    </dd>
                  </Fragment>
                )}
                {address && (
                  <Fragment>
                    <dd>
                      <Snippet>contactDetails.professionalAddress</Snippet>
                      <p>
                        {address}
                        <br />
                        {postcode}
                      </p>
                    </dd>
                  </Fragment>
                )}
                {telephone && (
                  <Fragment>
                    <dd>
                      <Snippet>contactDetails.telephone</Snippet>
                      <p>{telephone}</p>
                    </dd>
                  </Fragment>
                )}
              </dl>
            </Fragment>
          )}

          <hr />

          <dl>
            {allowedActions.includes('profile.permissions') && (
              <Fragment>
                <dt>
                  <Snippet role={profileRole}>permissionLevel.title</Snippet>
                </dt>
                <dt>{profileRole}</dt>
                <dd>
                  <Link
                    page='profile.permission'
                    establishmentId={estId}
                    profileId={id}
                    label={<Snippet>pages.profile.permission.change</Snippet>}
                  />
                </dd>
              </Fragment>
            )}
          </dl>
        </div>
      </Fragment>
    );
  }
}

export default Profile;
