import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import PhoneCallbackIcon from '@material-ui/icons/PhoneCallback';
import React from 'react';

import reducers, { namespace } from './states';
import { CallbackComponent } from './components';

const PLUGIN_NAME = 'RacCallbackPlugin';

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
    this.registerReducers(manager);

    this.registerCallbackChannel(flex, manager);
  }

  /**
   * Registers the {@link CallbackComponent}
   */
  registerCallbackChannel(flex, manager) {
    // Create RAC Channel
    const RacChannel = flex.DefaultTaskChannels.createDefaultTaskChannel(
      'rac',
      (task) => task.taskChannelUniqueName === 'rac',
      'CallbackIcon',
      'CallbackIcon',
      'palegreen',
    );
    // Basic Voicemail Channel Settings
    RacChannel.templates.TaskListItem.firstLine = (task) => `${task.queueName}: ${task.attributes.name}`;
    RacChannel.templates.TaskCanvasHeader.title = (task) => `${task.queueName}: ${task.attributes.name}`;
    RacChannel.templates.IncomingTaskCanvas.firstLine = (task) => task.queueName;
    // Lead Channel Icon
    RacChannel.icons.active = <PhoneCallbackIcon key="active-callback-icon" />;
    RacChannel.icons.list = <PhoneCallbackIcon key="list-callback-icon" />;
    RacChannel.icons.main = <PhoneCallbackIcon key="main-callback-icon" />;
    // Register Lead Channel
    flex.TaskChannels.register(RacChannel);

    flex.TaskInfoPanel.Content.replace(<CallbackComponent key="demo-component" manager={manager} />, {
      sortOrder: -1,
      if: (props) => props.task.taskChannelUniqueName === 'rac',
    });
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    //  add the reducers to the manager store
    manager.store.addReducer(namespace, reducers);
  }
}
