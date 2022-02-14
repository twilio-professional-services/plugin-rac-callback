import { FlexPlugin } from 'flex-plugin';
import { Actions, TaskChannelCapability } from '@twilio/flex-ui';
import PhoneCallbackIcon from '@material-ui/icons/PhoneCallback';
import React from 'react';

import { CallbackComponent } from './components';

const PLUGIN_NAME = 'RacCallbackPlugin';
const autoAcceptEnabled = JSON.parse(process.env.REACT_APP_CHANNEL_AUTO_ACCEPT);
const channelUniqueName = process.env.REACT_APP_CHANNEL_UNIQUE_NAME;

export default class RacCallbackPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    this.registerCallbackChannel(flex, manager);

    if (autoAcceptEnabled) {
      manager.workerClient.on('reservationCreated', (reservation) => {
        if (reservation.task.taskChannelUniqueName === channelUniqueName) {
          flex.Actions.invokeAction('AcceptTask', { sid: reservation.sid });
        }
      });
      Actions.addListener('afterAcceptTask', async (payload) => {
        if (payload.task.taskChannelUniqueName === channelUniqueName) {
          Actions.invokeAction('SelectTask', { sid: payload.task.sid });
        }
      });
    }
  }

  /**
   * Registers the {@link CallbackComponent}
   */
  registerCallbackChannel(flex, manager) {
    // Create RAC Channel
    const RacChannel = flex.DefaultTaskChannels.createDefaultTaskChannel(
      process.env.REACT_APP_CHANNEL_UNIQUE_NAME,
      (task) => task.taskChannelUniqueName === process.env.REACT_APP_CHANNEL_UNIQUE_NAME,
      'CallbackIcon',
      'CallbackIcon',
      'palegreen',
    );
    // Basic RAC Channel Settings
    RacChannel.templates.TaskListItem.firstLine = (task) => `${task.queueName}: ${task.attributes.name}`;
    RacChannel.templates.TaskCanvasHeader.title = (task) => `${task.queueName}: ${task.attributes.name}`;
    RacChannel.templates.IncomingTaskCanvas.firstLine = (task) => task.queueName;
    // RAC Channel Icon
    RacChannel.icons.active = <PhoneCallbackIcon key="active-callback-icon" />;
    RacChannel.icons.list = <PhoneCallbackIcon key="list-callback-icon" />;
    RacChannel.icons.main = <PhoneCallbackIcon key="main-callback-icon" />;
    // Add Wrapup to RAC Channel
    RacChannel.capabilities.add(TaskChannelCapability.Wrapup);
    // Register RAC Channel
    flex.TaskChannels.register(RacChannel);

    flex.TaskInfoPanel.Content.replace(<CallbackComponent key="callback-component" manager={manager} />, {
      sortOrder: -1,
      if: (props) => props.task.taskChannelUniqueName === process.env.REACT_APP_CHANNEL_UNIQUE_NAME,
    });
  }
}
