"use strict";

// Dependency
const Scheduler = require("./scheduler");
const sender = require("./sender");

/**
 *
 * @param {Object} config
 * @param {boolean} config.buffer
 * @param {number} config.buffer_seconds
 * @param {number} config.buffer_max_seconds
 * @param {number} config.queue_max
 * @param {number} config.url
 * @constructor
 */
function MessageQueue(config) {
  this.config = config;
  this.messageQueue = [];
  this.scheduler = new Scheduler(config);
}

/**
 * Sends the message to Incoming Webhook.
 * If buffer is enabled, the message is added to queue and sending is postponed for couple of seconds.
 *
 * @param {Message} message
 */
MessageQueue.prototype.addMessageToQueue = function (message) {
  const self = this;

  if (!this.config.buffer || !(this.config.buffer_seconds > 0)) {
    // No sending buffer defined. Send directly.
    sender.send([message], self.config);
  } else {
    // Add message to buffer
    this.messageQueue.push(message);
    // Plan send the enqueued messages
    this.scheduler.schedule(function () {
      // Remove waiting messages from global queue
      const messagesToSend = self.messageQueue.splice(
        0,
        self.messageQueue.length
      );

      sender.send(messagesToSend, self.config);
    });
  }
};

module.exports = MessageQueue;
