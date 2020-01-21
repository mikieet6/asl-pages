module.exports = req => {
  const schema = {
    licenceHolder: {
      show: true,
      sort: 'profile.lastName',
      toCSVString: (_, row) => `${row.profile.firstName} ${row.profile.lastName}`
    },
    licenceNumber: {
      show: true
    },
    startDate: {
      show: true,
      sortable: false
    },
    endDate: {
      show: true,
      sortable: false
    }
  };
  if (req.user.profile.asruUser) {
    schema.waived = {
      show: true,
      toCSVString: waived => waived ? 'Not billable' : 'Billable'
    };
  }
  return schema;
};