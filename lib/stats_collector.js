//-------------------------------------------------------------------------------
// Copyright IBM Corp. 2016
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//-------------------------------------------------------------------------------

'use strict';

// to enable debugging, set environment variable DEBUG to slack-about-service or *
const debug = require('debug')('slack-about-service');

const SGSC = require('./social_graph_stats_collector.js');
const KGSC = require('./keywords_graph_stats_collector.js');

const slackUtil = require('./util/slack.js');

 /**
   * Class collects user, channel and keyword Slack statistics.
   * @param {ibm-graph-client} GraphClient - an instance of ibm-graph-client containing a Slack social/keyword graph
   *
   */
 function StatsCollector(GraphClient) {

 	this.GraphClient = GraphClient;
 	this.socialGraphStatsCollector = new SGSC(GraphClient);
  this.keywordGraphStatsCollector = new KGSC(GraphClient);
 }

  /**
   * Asynchronously retrieves user statistics from a Slack social graph. Callback(err, status)  is invoked after 
   * it was verified that userName is valid. The statistics are POSTed to responseUrl.
   * @param {string} userName - the Slack user name for which social graph statistics are to be returned
   * @param {string} responseUrl - Slack callback Url 
   * @param {callback} callback - caller notification
   */
 StatsCollector.prototype.getUserStats = function (userName, responseUrl, callback) {
 	
  if((! callback) || (typeof callback !== 'function')) {
    console.error('Invalid getUserStats invocation: callback is missing or not a function');
    return;
  }

 	if((! userName) || (! this.GraphClient) || (! responseUrl)) {
    return callback({code: 500, message: 'The statistics service cannot process this request: missing input.'});
 	}

 	debug('Fetching vertex information for user ' + userName);

  // async call: verify that a user vertex exists with property userName set to <userName>
 	this.socialGraphStatsCollector.fetchUserInfo(userName, 
                                               function(err, userInfo) {
 		if(err) {
      console.error('User lookup returned error: ' + JSON.stringify(err));
      // send response to Slack
      var response = {
                      response_type: 'ephemeral',
                      text: 'No information about this user was found.',
                      color: 'warning',
                      mrkdwn: true
                     };
      slackUtil.sendResponse(response, responseUrl);
 		}
    else {
      debug('Found user ' + userName + '. Collecting information from graph.');

      // fetch statistics for this user asyncronously; don't wait for completion; the results will be POSTed to responseUrl
      this.socialGraphStatsCollector.fetchUserStats(userInfo, responseUrl);
    }

 	}.bind(this));

  // return preliminary response indicating that information about the user is being collected.
  return callback(null, { code : 200, message : 'Collecting information about user _' + userName + '_ ...' });

 }; // getUserStats

 /**
   * Asynchronously retrieves channel statistics from a Slack social graph. Callback(err, status)  is invoked after 
   * it was verified that channelName is valid. The statistics are POSTed to responseUrl.
   * @param {string} channelName - the Slack channel name for which social graph statistics are to be returned
   * @param {string} responseUrl - Slack callback Url 
   * @param {callback} callback - caller notification
   */
 StatsCollector.prototype.getChannelStats = function (channelName, responseUrl, callback) {

  if((! callback) || (typeof callback !== 'function')) {
    console.error('Invalid getChannelStats invocation: callback is missing or not a function');
    return;
  }

 	if((! channelName) || (! this.GraphClient) || (! responseUrl)) {
    return callback({code: 500, message: 'The statistics service cannot process this request: missing input.'});
 	}

 	debug('Fetching vertex information for channel ' + channelName);

  // async call: verify that a channel vertex exists with property channelName set to <channelName>
 	this.socialGraphStatsCollector.fetchChannelInfo(channelName, 
 													                        function(err, channelInfo) {
    if(err) {
      console.error('Channel lookup returned error: ' + JSON.stringify(err));
      // send response to Slack
      var response = {
                      response_type: 'ephemeral',
                      text: 'No information about this channel was found.',
                      color: 'warning',                      
                      mrkdwn: true
                     };
      slackUtil.sendResponse(response, responseUrl);
    }
    else {
      debug('Found channel ' + channelName + '. Collecting information from graph.');

      // fetch statistics for this channel asyncronously; don't wait for completion; the results will be POSTed to responseUrl
      this.socialGraphStatsCollector.fetchChannelStats(channelInfo, responseUrl);
    }
 	}.bind(this));

  // return preliminary response indicating that information about the user is being collected.
  return callback(null, { code : 200, message : 'Collecting information about channel _' + channelName + '_ ...' });

 }; // getChannelStats

/**
   * Asynchronously retrieves keyword statistics from a Slack keyword graph. Callback(err, status)  is invoked after 
   * it was verified that keyword is valid. The statistics are POSTed to responseUrl.
   * @param {string} keyword - the keyword (or phrase) for which keyword graph statistics are to be returned
   * @param {string} responseUrl - Slack callback Url 
   * @param {callback} callback - caller notification
   */
 StatsCollector.prototype.getKeywordStats = function (keyword, responseUrl, callback) {

  if((! callback) || (typeof callback !== 'function')) {
    console.error('Invalid getKeywordStats invocation: callback is missing or not a function');
    return;
  }

 	if((! keyword) || (! this.GraphClient) || (! responseUrl)) {
 		return callback({code: 500, message: 'The statistics service cannot process this request: missing input.'});
 	}

  debug('Fetching vertex information for keyword ' + keyword);

  // async call: determine whether there are any keyword vertices that contain the specified string.
  this.keywordGraphStatsCollector.fetchKeywordInfo(keyword, 
                                                  function(err, vertexMatches) {
    if(err) {
      console.error('Keyword lookup returned error: ' + JSON.stringify(err));
      // send response to Slack
      var response = {
                      response_type: 'ephemeral',
                      text: 'No information about this keyword was found.',
                      color: 'warning',                      
                      mrkdwn: true
                     };
      slackUtil.sendResponse(response, responseUrl);
    }
    else {
      debug('Found ' + vertexMatches.length + ' matches for keyword ' + keyword + '. Collecting information from graph.');

      // fetch statistics for this keyword asyncronously; don't wait for completion; the results will be POSTed to responseUrl
      this.keywordGraphStatsCollector.fetchKeywordStats(keyword, vertexMatches, responseUrl);
    }
  }.bind(this));

  // return preliminary response indicating that information about the user is being collected.
  return callback(null, { code : 200, message : 'Collecting information about keyword _' + keyword + '_ ...' });

 }; // getKeywordStats

module.exports = StatsCollector;
