/*
 *Synopsis:  This function provides supporting UTILITY functions for handling of Flex In-Queue Callback/Voicemail capabilities to include:
 *    1. Re-queuing of callback and voicemail tasks;
 *    2. Deletion of voicemail call recording media and transcripts
 *
 *These UTILITY methods directly support FLEX plugin functionality initiated by the Flex agent (worker)
 *
 *name: util_InQueueFlexUtils
 *path: /inqueue-utils
 *private: UNCHECKED
 *
 *Function Methods (mode)
 * - deleteRecordResources    => logic for deletion of recording media and transcript text (recordingSid, transcriptionSid)
 * - requeueTasks             => logic for re-queuing of callback/voicemail task (create new task from existing task attributes)
 *
 *Customization:
 * - None
 *
 *Install/Config: See documentation
 */

const axios = require('axios');
const JWEValidator = require('twilio-flex-token-validator').functionValidator;

const helpersPath = Runtime.getFunctions().helpers.path;
const { handleError } = require(helpersPath);

// eslint-disable-next-line sonarjs/cognitive-complexity
exports.handler = JWEValidator(async function (context, event, callback) {
  // setup twilio client
  const client = context.getTwilioClient();

  const resp = new Twilio.Response();
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  resp.setHeaders(headers);

  // get method
  const { mode } = event;

  //    global function to update callback Task attributes
  //    controlling the UI call button view
  async function PluginTaskUpdate(type, taskSid, attr, state) {
    if (type === 'callback') {
      attr.ui_plugin.cbCallButtonBlocked = event.state;
    }

    // update task attributes
    await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .tasks(taskSid)
      .update({
        attributes: JSON.stringify(attr),
      })
      .then((result) => {
        return { status: 'success', type: 'cbUpdateAttr', data: result };
      })
      .catch((error) => {
        return { status: 'error', type: 'cbUpdateAttr', data: error };
      });
    // error - updateTask
  }

  switch (mode) {
    case 'UiPlugin':
      const tsk = await PluginTaskUpdate(event.type, event.taskSid, event.attributes, event.state);
      return callback(null, resp.setBody(tsk));

      break;
    default:
      return callback(500, 'Mode not specified');
      break;
  }
});
