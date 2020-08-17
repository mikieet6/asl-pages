const { merge } = require('lodash');
const baseContent = require('../../content');

module.exports = merge({}, baseContent, {
  fields: {
    title: {
      label: 'Title',
      hint: 'For your records'
    },
    startDate: {
      label: 'Course start date',
      hint: `This helps ensure the licences are approved in time. Licences will be valid for 3 months from the date of approval.

      For example, 12 11 2020`
    },
    species: {
      label: 'Animals to be used'
    },
    projectId: {
      label: 'Project licence number',
      hint: 'For a higher education and training project'
    },
    projectTitle: {
      label: 'Project licence title'
    }
  },
  errors: {
    title: {
      required: 'Enter a course title'
    },
    startDate: {
      required: 'Enter the course start date',
      validDate: 'Enter a valid date',
      dateIsAfter: 'Course start date must be in the future.'
    },
    species: {
      required: 'Please select at least one animal type.'
    },
    projectId: {
      required: 'Enter the licence number of the training project.'
    }
  },
  buttons: {
    cancel: 'Edit'
  }
});
