const { ObjectID } = require('mongodb');
const Generator = require('yeoman-generator');

const Random = require('../../lib/random');
const now = require('../../lib/now');

const snakeCase = s =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-');

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What kind of webhook is it?',
        choices: ['inbound', 'outbound'],
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of your webhook?',
      },
      {
        type: 'list',
        name: 'event',
        message: 'Which event should trigger your outbound webhook?',
        choices: [
          {
            name: 'Message Sent',
            value: 'sendMessage',
          },
          {
            name: 'File Uploaded',
            value: 'fileUploaded',
          },
          {
            name: 'Room Archived',
            value: 'roomArchived',
          },
          {
            name: 'User Created',
            value: 'userCreated',
          },
          {
            name: 'Room Created (public and private)',
            value: 'roomCreated',
          },
          {
            name: 'User Joined Room',
            value: 'roomJoined',
          },
          {
            name: 'User Left Room',
            value: 'roomLeft',
          },
        ],
        when(answers) {
          return answers.type === 'outbound';
        },
      },
      {
        type: 'input',
        name: 'word',
        message: 'What word should trigger this webhook?',
        when(answers) {
          return answers.type === 'outbound' && answers.event === 'sendMessage';
        },
      },
      {
        type: 'input',
        name: 'url',
        message: 'What URL should this webhook send to?',
        when(answers) {
          return answers.type === 'outbound';
        },
      },
      {
        type: 'input',
        name: 'channel',
        message: 'Listen/Post to which channel?',
        validate(input) {
          // channels must start with # or @
          let valid = false;

          ['#', '@'].forEach(char => {
            if (input.indexOf(char) === 0) {
              valid = true;
            }
          });

          if (valid) {
            return true;
          }

          return 'Channel name must start with # or @';
        },
        when(answers) {
          const { type, event } = answers;

          if (type === 'inbound') {
            return true;
          }

          // not all outbound webhooks need a channel to post to
          if (
            type === 'outbound' &&
            ['messageSent', 'fileUploaded', 'roomJoined', 'roomJLeft', 'userCreated'].indexOf(event) >= 0
          ) {
            return true;
          }

          return false;
        },
      },
    ]);

    return this.answers;
  }

  writing() {
    const { channel, event, name, type, url, word } = this.answers;

    const normalizedName = snakeCase(name);

    const id = new ObjectID();
    const token = Random.id(48);
    const date = now();
    const scriptPath = `${type}.${normalizedName}.js`;

    let entityTemplate;
    if (type === 'inbound') {
      entityTemplate = `${type}/webhook.json`;
    } else {
      entityTemplate = `${type}/webhook.${event}.json`;
    }

    const scriptTemplate = `${type}/script.js`;

    // Copy integration entity definition
    this.fs.copyTpl(
      this.templatePath(entityTemplate),
      this.destinationPath(`integrations/${type}.${normalizedName}.json`),
      {
        channel,
        date,
        id,
        name,
        scriptPath,
        token,
        url,
        word,
      }
    );

    // Copy integration script
    this.fs.copyTpl(this.templatePath(scriptTemplate), this.destinationPath(`integrations/${scriptPath}`));
  }
};
