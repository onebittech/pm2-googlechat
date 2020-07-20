# pm2-googlechat

This is a PM2 Module for sending events & logs from your PM2 processes to Google Chat.

## Install

To install and setup pm2-googlechat, run the following commands:

```
pm2 install pm2-googlechat
pm2 set pm2-googlechat:url https://url
```

To get the Google Chat URL, you need to setup an Incoming Webhook. More details on how to set this up can be found here: https://developers.google.com/hangouts/chat/quickstart/incoming-bot-node

## Events subscription configuration

The following events can be subscribed to:

- `log` - All standard out logs from your processes. Default: false
- `error` - All error logs from your processes. Default: true
- `kill` - Event fired when PM2 is killed. Default: true
- `exception` - Any exceptions from your processes. Default: true
- `restart` - Event fired when a process is restarted. Default: false
- `reload` - Event fired when a cluster is reloaded. Default: false
- `delete` - Event fired when a process is removed from PM2. Default: false
- `stop` - Event fired when a process is stopped. Default: false
- `restart overlimit` - Event fired when a process is reaches the max amount of times it can restart. Default: true
- `exit` - Event fired when a process is exited. Default: false
- `start` - Event fired when a process is started. Default: false
- `online` - Event fired when a process is online. Default: false

You can simply turn these on and off by setting them to true or false using the PM2 set command.

```
pm2 set pm2-googlechat:log true
pm2 set pm2-googlechat:error false
```

## Options

The following options are available:

- `url` (string) - Google Chat Incomming Webhook URL.
- `buffer` (bool) - Enable/Disable buffering of messages. Messages that occur in short time will be concatenated together and posted as a single message. Default: true
- `servername` / `username` (string) - Set the custom username messages (visible in message first line). Default: server hostname
- `buffer_seconds` (int) - If buffering is enables, all messages are stored for this interval. If no new messages comes in this interval, buffered message(s) are sended. If new message comes in this interval, the "timer" will be reseted and buffer starts waiting for the new interval for a new next message. Default: 2
- `buffer_max_seconds` (int) - If time exceed this time, the buffered messages are always sent to Google Chat, even if new messages are still comming in interval (property `buffer_seconds`). Default: 20
- `queue_max` (int) - Maximum number of messages, that can be send in one message (in one bufferring round). When the queue exceeds this maximum, next messages are suppresesed and replaced with message "_Next XX messages have been suppressed._". Default: 100

Set these options in the same way as subscribing to events.

###### Example

The following configuration options will enable message buffering, and set the buffer duration to 5 seconds. All messages that occur within maximum 5 seconds delay between two neighboring messages will be concatenated into a single message.

```
pm2 set pm2-googlechat:url https://chat.googleapis.com/v1/spaces/AAAA1234567/messages?key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&token=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
pm2 set pm2-googlechat:buffer_seconds 5
```

Note: In this example, the maximum total delay for messages is still 20 seconds (default value for `buffer_max_seconds`). After this time, the buffer will be flushed
everytime and all messages will be sent.

### Process based custom options

By default, all options are defined for all processes globally.
But you can separately define custom options to each PM2 process.
Use format `pm2-googlechat:optionName-processName` to process based custom options.

If no custom options is defined, the global `pm2-googlechat:propertyName` will be used.

Note: By this way, all custom options can be used for specific process, but events subsciptions configuration is always global only.

###### Example

We have many processes, includes process `foo` and process `bar`.
For this two processes will have to define separate Google Chat URL channel and separate server name.
Same buffer options will be used for all processed.

```
# Define global options for all processes.
pm2 set pm2-googlechat:buffer_seconds 5

# Define global options for all processes.
#   (for process `foo` and `bar` the values will be overridden below).
pm2 set pm2-googlechat:url https://chat.googleapis.com/v1/spaces/AAAA1234567/messages?key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&token=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
pm2 set pm2-googlechat:servername Orion

# Define custom Google Chat Incomming Webhoook for `foo` process.
pm2 set pm2-googlechat:url-foo https://chat.googleapis.com/v1/spaces/AAAA1234567/messages?key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&token=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
pm2 set pm2-googlechat:servername-foo Foo-server
# Note: The `pm2-googlechat:buffer_seconds`=5 will be used from global options for this process.

# Define custom Google Chat Incomming Webhoook for `bar` process
pm2 set pm2-googlechat:url-bar https://chat.googleapis.com/v1/spaces/AAAA1234567/messages?key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&token=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
pm2 set pm2-googlechat:servername-foo Bar-server
# Note: The `pm2-googlechat:buffer_seconds`=5 will be used from global options for this process.
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
