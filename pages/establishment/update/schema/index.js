const content = require('../content');
const { toArray, toBoolean } = require('../../../../lib/utils');
const { uniq } = require('lodash');
const { establishmentCountries } = require('@asl/constants');

const licenceOptions = ['supplying', 'breeding', 'procedure'];
const authorisationTypeOptions = ['killing', 'rehomes'];

const reveal = {
  method: {
    inputType: 'textarea'
  },
  description: {
    inputType: 'textarea'
  }
};

module.exports = {
  name: {
    inputType: 'inputText',
    validate: ['required']
  },
  address: {
    inputType: 'textarea',
    validate: ['required']
  },
  country: {
    inputType: 'radioGroup',
    validate: ['required'],
    options: establishmentCountries
  },
  licences: {
    inputType: 'checkboxGroup',
    automapReveals: true,
    options: licenceOptions.map(option => ({
      value: option,
      label: content.fields.licences.options[option],
      reveal: option === 'procedure' && ({
        isTrainingEstablishment: {
          inputType: 'radioGroup',
          format: toBoolean,
          options: [
            {
              value: true,
              label: 'Yes'
            },
            {
              value: false,
              label: 'No'
            }
          ]
        }
      })
    })),
    validate: [
      {
        definedValues: licenceOptions
      }
    ],
    getValue: model => licenceOptions.filter(licence => model[licence]),
    format: toArray,
    nullValue: []
  },
  authorisationTypes: {
    inputType: 'checkboxGroup',
    options: authorisationTypeOptions.map(option => ({
      value: option,
      label: content.fields.authorisationTypes.options[option],
      reveal
    })),
    validate: [
      {
        definedValues: authorisationTypeOptions
      }
    ],
    getValue: model => uniq((model.authorisations || []).map(authorisation => authorisation.type)),
    format: toArray,
    nullValue: [],
    showDiff: false
  },
  comments: {
    inputType: 'textarea',
    validate: 'required',
    showDiff: false
  }
};
