"use strict";

// Exports
module.exports = { send };

// Dependency
const request = require("request");
const os = require("os");

/**
 * Sends immediately the message(s) to Incoming Webhook.
 *
 * @param {Message[]) messages - List of messages, ready to send.
 *                              This list can be trimmed and concated base on module configuration.
 */
function send(messages, config) {
  // If a URL is not set, we do not want to continue and nofify the user that it needs to be set
  if (!config.url) {
    return console.error(
      "There is no URL set, please set the URL: 'pm2 set pm2-googlechat:url https://url'"
    );
  }

  let limitedCountOfMessages;
  if (config.queue_max > 0) {
    // Limit count of messages for sending
    limitedCountOfMessages = messages.splice(
      0,
      Math.min(config.queue_max, messages.length)
    );
  } else {
    // Select all messages for sending
    limitedCountOfMessages = messages;
  }

  // The JSON payload to send to the Webhook
  let payload = {
    text: "",
  };

  const username = config.username || config.servername || os.hostname();

  payload.text += `*[${username}]*\n`;

  // Merge together all messages from same process and with same event
  // Convert messages to message's attachments
  const messagesToSend = mergeSimilarMessages(limitedCountOfMessages);

  for (let i = 0; i < messagesToSend.length; i++) {
    const m = messagesToSend[i];
    payload.text += `Name: ${m.name}\n`;
    payload.text += `Event: ${m.event}\n`;
    payload.text += `Description: ${m.description}\n`;
    payload.text += `Timestamp: ${m.timestamp}\n`;
  }

  // Add warning, if some messages has been suppresed
  if (messages.length > 0) {
    payload.text +=
      "Next " +
      messages.length +
      " message" +
      (messages.length > 1 ? "s have " : " has ") +
      "been suppressed.\n";
  }

  // Options for the post request
  const requestOptions = {
    method: "post",
    body: payload,
    json: true,
    url: config.url,
  };

  // Finally, make the post request to the Incoming Webhook
  request(requestOptions, function (err, res, body) {
    if (err) return console.error(err);
    if (body !== "ok") {
      console.error(
        "Error sending notification, verify that the URL for incoming webhooks is correct. " +
          messages.length +
          " unsended message(s) lost."
      );
    }
  });
}

/**
 * Merge together all messages from same process and with same event
 *
 * @param {Messages[]} messages
 * @returns {Messages[]}
 */
function mergeSimilarMessages(messages) {
  return messages.reduce(function (
    /*Message[]*/ finalMessages,
    /*Message*/ currentMessage
  ) {
    if (
      finalMessages.length > 0 &&
      finalMessages[finalMessages.length - 1].name === currentMessage.name &&
      finalMessages[finalMessages.length - 1].event === currentMessage.event
    ) {
      // Current message has same title as previous one. Concate it.
      finalMessages[finalMessages.length - 1].description +=
        "\n" + currentMessage.description;
    } else {
      // Current message is different than previous one.
      finalMessages.push(currentMessage);
    }
    return finalMessages;
  },
  []);
}
