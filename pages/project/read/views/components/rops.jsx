import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { Snippet, Link } from '@asl/components';
import { Button } from '@ukhomeoffice/react-components';
import format from 'date-fns/format';
import { dateFormat } from '../../../../../constants';
import isBefore from 'date-fns/is_before';
import isAfter from 'date-fns/is_after';
import endOfDay from 'date-fns/end_of_day';
import addDays from 'date-fns/add_days';
import subMilliseconds from 'date-fns/sub_milliseconds';
import partition from 'lodash/partition';
import pick from 'lodash/pick';
import Subsection from '../components/subsection';

export function Rop({ rop, project, active, url }) {

  const endOfYear = new Date(`${rop.year}-12-31`);
  const projEnd = project.revocationDate || project.expiryDate;
  const expiresMidYear = isBefore(projEnd, endOfYear);
  const endDate = format(expiresMidYear ? projEnd : endOfYear, dateFormat.long);

  let cta;

  if (rop.status === 'submitted') {
    cta = (
      <p>
        <Link
          page="rops.procedures"
          ropId={rop.id}
          label={<Snippet year={rop.year}>rops.read</Snippet>}
        />
      </p>
    );
  } else if (rop.status === 'draft') {
    cta = (
      <p>
        <Link
          page="rops.update"
          step="confirm"
          ropId={rop.id}
          label={<Snippet year={rop.year}>rops.continue</Snippet>}
        />
      </p>
    );
  } else {
    cta = (
      <form method="POST" action={`${url}/rops`}>
        <input type="hidden" name="year" value={rop.year} />
        <Button className="button-secondary">
          <Snippet year={rop.year}>rops.start</Snippet>
        </Button>
      </form>
    );
  }

  function getDeadline() {
    const endOfJan = endOfDay(new Date(`${rop.year + 1}-01-31`));

    function getRefDate(date) {
      return subMilliseconds(addDays(new Date(date), 29), 1);
    }

    switch (project.status) {
      case 'active':
        const refDate = getRefDate(project.expiryDate);
        return isBefore(refDate, endOfJan) ? refDate : endOfJan;
      case 'expired':
        return getRefDate(project.expiryDate);
      case 'revoked':
        return getRefDate(project.revocationDate);
    }
  }

  const ropsDeadline = getDeadline();

  const content = (
    <Fragment>
      <h3>Return of procedures for {rop.year}</h3>
      <p>
        <Snippet
          submitted={format(rop.submittedDate, dateFormat.long)}
          endDate={endDate}
          year={rop.year}
          deadline={format(ropsDeadline, dateFormat.long)}
        >{ rop.status === 'submitted' ? 'rops.submitted' : 'rops.incomplete' }</Snippet>
      </p>
    </Fragment>

  );

  return (
    <Fragment>
      { active && content }
      { cta }
    </Fragment>
  );
}

export function Rops({ project = {}, ropsYears = [], url, today = new Date() }) {
  const thisYear = today.getFullYear();
  const years = ropsYears.filter(y => {
    const deadline = subMilliseconds(new Date(`${y}-02-01`), 1);
    return isAfter(today, deadline);
  });

  const activeYears = years.filter(year => {
    // the previous year should be "active" for the first part of the year
    return year >= thisYear || (year === thisYear - 1 && today.getMonth() < 6);
  });

  const rops = project.rops;

  const endDate = project.revocationDate || project.expiryDate;

  // add templates for each missing rop
  years.forEach(year => {
    if (!rops.find(ar => ar.year === year)) {
      rops.unshift({ year });
    }
  });

  const requiredRops = rops.filter(rop => {
    return !endDate || isAfter(new Date(endDate), new Date(`${rop.year}-01-01`));
  });

  if (!requiredRops.length) {
    return <p><strong><Snippet>rops.not-due</Snippet></strong></p>;
  }

  const [activeRops, previousRops] = partition(requiredRops, rop => {
    return activeYears.includes(rop.year) || rop.status !== 'submitted';
  });

  return (
    <Subsection
      title={<Snippet>rops.title</Snippet>}
    >
      {
        activeRops.map((rop, index) => <Rop key={index} project={project} rop={rop} active={true} url={url} />)
      }
      {
        !!previousRops.length && (
          <Fragment>
            <h3><Snippet>rops.previous</Snippet></h3>
            {
              previousRops.map((rop, index) => <Rop key={index} project={project} rop={rop} url={url} />)
            }
          </Fragment>
        )
      }

    </Subsection>
  );
}

export default function () {
  const canAccessRops = useSelector(state => state.static.canAccessRops);

  if (!canAccessRops) {
    return null;
  }

  const props = pick(useSelector(state => state.static), 'project', 'ropsYears', 'url');
  return <Rops {...props} />;
}
