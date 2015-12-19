'use strict';

var
  // generic stuff
  _               = require('underscore'),
  async           = require('async'),
  errors          = require('src/lib/errors'),
  objectid        = require('mongodb').ObjectID,

  apiBasePath     = '../../..',
  moduleBasePath  = '..',

  // API utilities
  Request         = require(apiBasePath + '/util/Request'),
  Response        = require(apiBasePath + '/util/Response'),

  // Models managed by this controller
  Ticket = require(moduleBasePath + '/models/Ticket');


class TicketsStatsController
{

  /**
   * Retrieve all the stats
   */
  getAll(req, res, next) {
    var
      self    = this,
      request = new Request(req),
      filters = this._parseFilters(request),

      // default grouping criteria for the stats by date
      groupingCriteria = 'day';

    // the grouping criteria might be overrided with a filter
    if(filters.byDateGroupingCriteria) {
      groupingCriteria = filters.byDateGroupingCriteria;
    }

    var transformer = function(tickets) {
      return {
        general:    self._getStats(tickets),
        byManager:  self._getStatsByManager(tickets),
        byUser:     self._getStatsByUser(tickets),
        byCategory: self._getStatsByCategory(tickets),
        byStatus:   self._getStatsByStatus(tickets),
        byDate:     self._getStatsByDate(tickets, groupingCriteria)
      };
    };

    this._generateStats(transformer, req, res, next);
  }


  /**
   * Retrieve the stats by manager
   */
  getByManager(req, res, next) {
    var self = this;

    var transformer = function(tickets) {
      return self._getStatsByManager(tickets);
    };

    this._generateStats(transformer, req, res, next);
  }


  /**
   * Retrieve the stats by user
   */
  getByUser(req, res, next) {
    var self = this;

    var transformer = function(tickets) {
      return self._getStatsByUser(tickets);
    };

    this._generateStats(transformer, req, res, next);
  }


  /**
   * Retrieve the stats by category
   */
  getByCategory(req, res, next) {
    var self = this;

    var transformer = function(tickets) {
      return self._getStatsByCategory(tickets);
    };

    this._generateStats(transformer, req, res, next);
  }


  /**
   * Retrieve the stats by status
   */
  getByStatus(req, res, next) {
    var self = this;

    var transformer = function(tickets) {
      return self._getStatsByStatus(tickets);
    };

    this._generateStats(transformer, req, res, next);
  }


  /**
   * Retrieve the stats by data
   */
  getByDate(req, res, next) {
    var
      self    = this,
      request = new Request(req),
      filters = this._parseFilters(request),

      // default grouping criteria for the stats by date
      groupingCriteria = 'day';

    // the grouping criteria might be overrided with a filter
    if(filters.byDateGroupingCriteria) {
      groupingCriteria = filters.byDateGroupingCriteria;
    }

    var transformer = function(tickets) {
      return self._getStatsByDate(tickets, groupingCriteria);
    };

    this._generateStats(transformer, req, res, next);
  }

  /**
   * Retrieve the general stats
   */
  getGeneral(req, res, next) {
    var self = this;

    var transformer = function(tickets) {
      return self._getStats(tickets);
    };

    this._generateStats(transformer, req, res, next);
  }






  /**
   * The actual method that retrieves the models
   * and generates the output
   */
  _generateStats(transformer, req, res, next) {
    var
      self     = this,
      request  = new Request(req),
      response = new Response(request),
      populationKeys = [
        'user',
        'manager',
        'category',
        'statuses.status'
      ];

    Ticket.find().populate(populationKeys.join(' ')).exec(function(err, models) {
      /* istanbul ignore next */
      if (err) { return next(err); }

      var stats = _.isFunction(transformer) ? transformer(models) : models;

      response.formatOutput(stats, function(err, output) {
        /* istanbul ignore next */
        if (err) { return next(err); }
        res.json(output);
      });
    });
  }


  /**
   * Filters parsing
   */
  _parseFilters(request) {
    var filters = {};

    if(_.has(request.filters, 'byDate') && _.isString(request.filters.byDate)) {
      filters.byDateGroupingCriteria = request.filters.byDate.toLowerCase();
    }

    return filters;
  }


  /**
   * Get some stats from some tickets collection
   */
  _getStats(models) {
    var
      self  = this,
      total = models.length,

      // by ticket resolution
      closed = _.where(models, { closed: true }),
      open   = _.difference(models, closed),

      // by manager assignment
      assigned   = _.filter(models, function(ticket) { return !!ticket.manager; }),
      unassigned = _.difference(models, assigned);

    return {
      total:          total,
      closed:         closed.length,
      open:           open.length,
      assigned:       assigned.length,
      unassigned:     unassigned.length,
      resolutionTime: self._getResolutionTimeStats(closed)
    };
  }


  /**
   * Get information about the resolution times from some tickets collection
   */
  _getResolutionTimeStats(models) {
    var ret = {
      min:     0,
      max:     0,
      average: 0
    };

    if(models.length) {
      var times = models.map(function(ticket) {
        return Math.abs(_.last(ticket.statuses).created_at - ticket.created_at);
      });

      ret.min = _.min(times);
      ret.max = _.max(times);

      ret.average = times.reduce(function(a, b) {
        return a + b;
      })/models.length;
    }

    return ret;
  }


  /**
   * Ticket stats by user
   */
  _getStatsByUser(models) {
    var self = this, ret = [];

    var groupedTickets = _.groupBy(models, function(ticket) {
      return ticket.user.id;
    });

    _.each(groupedTickets, function(groupedModels) {
      ret.push({
        user:  _.first(groupedModels).user,
        stats: self._getStats(groupedModels)
      });
    });

    return ret;
  }


  /**
   * Ticket stats by assigned manager
   */
  _getStatsByManager(models) {
    var self = this, ret = [];

    var
      assigned       = _.filter(models, function(ticket) { return !!ticket.manager; }),
      groupedTickets = _.groupBy(assigned, function(ticket) {
        return ticket.manager.id;
      });

    _.each(groupedTickets, function(groupedModels) {
      ret.push({
        manager: _.first(groupedModels).manager,
        stats:   self._getStats(groupedModels)
      });
    });

    return ret;
  }


  /**
   * Ticket stats by category
   */
  _getStatsByCategory(models) {
    var self = this, ret = [];

    var
      // all the tickets should have a category
      // but if some category is deleted the tickets may become 'orphans'
      categorized    = _.filter(models, function(ticket) { return !!ticket.category; }),
      groupedTickets = _.groupBy(categorized, function(ticket) {
        return ticket.category.id;
      });

    _.each(groupedTickets, function(groupedModels) {
      ret.push({
        category:  _.first(groupedModels).category,
        stats:     self._getStats(groupedModels)
      });
    });

    return ret;
  }


  /**
   * Ticket stats by current status
   */
  _getStatsByStatus(models) {

    return _.chain(models)

      // remove the tickets without statuses (all the tickets should have some)
      .filter(function(ticket) {
        return ticket.statuses && ticket.statuses.length > 0;
      })

      // group by current status
      .groupBy(function(ticket) {
        var curr = _.last(ticket.statuses);
        return curr.status.id;
      })

      // format the data
      .map(function(group) {
        var status = _.last(group[0].statuses).status;

        return {
          status: status,
          total:  group.length
        };
      })

      // sort
      .sortBy(function(o) {
        return o.status.order;
      })

      // end the chain
      .value();
  }


  /**
   * Ticket stats by date
   *
   * Returns the amount of tickets created, resolved and reopened by date
   */
  _getStatsByDate(models, groupingCriteria) {

    var
      self  = this,
      openDates = [], closeDates = [], reopenedDates = [];

    _.each(models, function(model) {
      let modelSatuses = model.statuses || [];

      _.each(modelSatuses, function(ticketStatus) {
        if(ticketStatus.status) {
          // don't parse intermediate custom statuses,
          // like 'in progress' or whatever
          if(ticketStatus.status.closed) {
            closeDates.push(ticketStatus.created_at);
          } else if(ticketStatus.status.open) {

            let collection = _.first(modelSatuses).id === ticketStatus.id ?
              openDates : reopenedDates;

            collection.push(ticketStatus.created_at);
          }
        }
      });
    });

    return {
      created:  self._groupDatesByCriteria(openDates,     groupingCriteria),
      closed:   self._groupDatesByCriteria(closeDates,    groupingCriteria),
      reopened: self._groupDatesByCriteria(reopenedDates, groupingCriteria)
    };
  }


  /**
   * Group some dates by a given criteria
   */
  _groupDatesByCriteria(dates, criteria) {
    var sbstrIdx;

    switch(criteria) {
      case 'year':
        sbstrIdx = 4;
        break;

      case 'day':
        sbstrIdx = 10;
        break;

      default:
        // group by month by default
        sbstrIdx = 7;
    }

    return _.chain(dates)

      // group by the requested criteria
      .groupBy(function(d) {
        return d.toISOString().substring(0, sbstrIdx);
      })

      // get the totals
      .map(function(groupedDates, date) {
        let ret = {};
        ret[date] = groupedDates.length;
        return ret;
      })

      // apply the sorting
      .sortBy(function(d) {
        return _.keys(d)[0];
      })

      // end the chain
      .value();
  }

}

module.exports = TicketsStatsController;
