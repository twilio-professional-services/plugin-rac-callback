<a href="https://www.twilio.com">
<img src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg" alt="Twilio" width="250" />
</a>

# RAC (Request-a-Call) Channel for Flex

This plugin registers the RAC channel and customizes the TaskInfoPanel to allow for an outbound Voice channel call to be triggered from the RAC channel task.

## Notice

This plugin is no longer maintained as of September 21, 2022.  Work to support this feature in Flex v2 has been transitioned to the [Twilio Professional Services Flex Project Template](https://github.com/twilio-professional-services/twilio-proserv-flex-project-template/tree/main/plugin-flex-ts-template-v2/src/feature-library/callback-and-voicemail).

## Set up

### Requirements

To deploy this plugin, you will need:

- An active Twilio account with Flex provisioned. Refer to the [Flex Quickstart](https://www.twilio.com/docs/flex/quickstart/flex-basics#sign-up-for-or-sign-in-to-twilio-and-create-a-new-flex-project) to create one.
- npm version 6.0.0 or later installed (type `npm -v` in your terminal to check)
- Node version 14.0.0 or later installed (type `node -v` in your terminal to check)
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) along with the [Flex CLI Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins). Run the following commands to install them:
```
# Install the Twilio CLI
npm install twilio-cli -g
```
- A GitHub account

### Twilio Account Settings

Before we begin, we need to collect all the config values we need to run the application:

| Config Value | Description |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Channel Unique Name | The Task Channel Unique Name for 'RAC' from TaskRouter > Flex Task Assignment Workspace > Task Channels |
| Auto Accept | Whether to Auto Accept tasks in the 'RAC' channel (true or false) |
| Auto Dial | Whether to automatically StartOutboundDial for the 'RAC' channel tasks (true or false)

### Local development
  
After the above requirements have been met:

1. Clone this repository
```
git clone https://github.com/randyjohnston/plugin-rac-callback
```

2. Change into the `public` subdirectory of the repo and run the following: 
```
cd plugin-rac-callback/public && mv appConfig.example.js appConfig.js
```

3. Install dependencies
```bash
npm install
```

5. Run the application
```bash
twilio flex:plugins:start
```
See [Twilio Account Settings](#twilio-account-settings) to locate the necessary environment variables.  

8. Navigate to [http://localhost:3000](http://localhost:3000)
  

### Deploy your Flex Plugin

Once you have deployed the function, it is time to deploy the plugin to your Flex instance.

Run the following commands in the plugin root directory. We will leverage the Twilio CLI to build and deploy the Plugin.  

1. Rename `.env.example` to `.env`.

2. Open `.env` with your text editor and modify the `REACT_APP_{OPTION}` properties similarly to the example below.
```
plugin-rac-callback$ mv .env.example .env
# .env
REACT_APP_CHANNEL_UNIQUE_NAME=rac
REACT_APP_CHANNEL_AUTO_ACCEPT=false
REACT_APP_CHANNEL_AUTO_DIAL=true
```

3. When you are ready to deploy the plugin, run the following in a command shell:
```
plugin-rac-callback$ twilio flex:plugins:deploy --major --changelog "Updating to use the latest Twilio CLI Flex plugin" --description "plugin rac callback"
```
  
4. To enable the plugin on your contact center, follow the suggested next step on the deployment confirmation. To enable it via the Flex UI, see the [Plugins Dashboard documentation](https://www.twilio.com/docs/flex/developer/plugins/dashboard#stage-plugin-changes).


## Required Task Attributes

For the plugin to display and function, the following task attributes are expected:

*  `name`: Name of the task, such as `"Callback: +15553214321"`
*  `callerId`: Outbound caller ID to use for the outbound call, such as `"callerId": "+13084705049"`
*  `callbackDestination`: RAC requester's phone number to receive the outbound call, such as `"+15553214321"`
*  `mainTimeZone`: The main [time zone](https://momentjs.com/timezone/) for the unlocalized date-time of the original request, such as `Etc/UTC` or `America/Los_Angeles` (displayed on TaskInfoPanel in addition to the agent-localized date-time)
*  `utcDateTimeReceived`: An ISO 8601, UTC  date-time stamp when the RAC was originally requested on the origin server, such as `2022-02-11T22:24:49.427Z`
*  `direction`: This should be `inbound`. The equivalent `outbound` task will be linked to the original `inbound` task for Insights reporting.
  

## License

[MIT](http://www.opensource.org/licenses/mit-license.html)

## Disclaimer

No warranty expressed or implied. Software is as is.

[twilio]: https://www.twilio.com
