'use strict';

/**
 * Default ticket statuses
 * @type {Array}
 * @description Default statuses for the tickets. The admins can create some
 * additional statuses to customise the tickets resolution workflow.
 */
exports['tickets.statuses'] = [
  {
    name:  'Open',
    order: 0,
    open:  true
  },
  {
    name:   'Closed',
    order:  100,
    closed: true
  }
];
