import React from 'react';
import { Actions, TaskHelper } from '@twilio/flex-ui';
import moment from 'moment';
import 'moment-timezone';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Icon from '@material-ui/core/Icon';

import styles from './CallbackStyles';

const autoAcceptEnabled = JSON.parse(process.env.REACT_APP_CHANNEL_AUTO_ACCEPT);
const autoDialEnabled = JSON.parse(process.env.REACT_APP_CHANNEL_AUTO_DIAL);

export default class CallbackComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cbCallButtonBlocked: true,
      outboundCallTriggered: false
    };
  }

  componentDidMount() {
    if (['accepted', 'wrapping'].includes(this.props.task.status)) {
      this.checkIfWorkerHasVoiceCall();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.task.status === 'accepted' && this.props.task.status === 'accepted') &&
      (this.state.cbCallButtonBlocked === true && this.state.outboundCallTriggered == false) &&
      // we need to do an additional check for a pre-existing voice task if auto accept or auto dial are disabled
      (!autoAcceptEnabled || !autoDialEnabled)
    ) {
      this.checkIfWorkerHasVoiceCall();
    }
  }

  checkIfWorkerHasVoiceCall() {
    const workerTasksArr = Array.from(this.props.manager.store.getState().flex.worker.tasks.values());
    if (workerTasksArr) {
      workerTasksArr.forEach((potentialVoiceTask) => {
        if (TaskHelper.isCallTask(potentialVoiceTask)) {
          this.setState({ cbCallButtonBlocked: true });
          return;
        }
        this.setState({ cbCallButtonBlocked: false });
        if (autoDialEnabled && this.props.task.status === 'accepted') {
          this.startCall();
        }
      });
    }
  }

  startCall = async () => {
    const activityName = this.props.manager.workerClient.activity.name;
    if (activityName === 'Offline') {
      // eslint-disable-next-line no-alert
      alert('Change activity state from "Offline" to place call to contact');
      return;
    }
    this.setState({ cbCallButtonBlocked: true });
    const { queueSid, taskSid, attributes } = this.props.task;
    const { callbackDestination, callerId } = attributes;
    const attr = {
      type: 'outbound',
      name: `Contact: ${callbackDestination}`,
      phone: callbackDestination,
      conversations: {
        // eslint-disable-next-line camelcase
        conversation_id: taskSid, // link original rac and voice tasks in Insights
      },
    };
    try {
      this.setState({ outboundCallTriggered: true });
      await Actions.invokeAction('StartOutboundCall', {
        destination: callbackDestination,
        queueSid,
        callerId,
        taskAttributes: attr,
      });
      // Wrap up original task to disable auto-dial in cases where it is enabled
      Actions.invokeAction('WrapupTask', { sid: this.props.task.sid });
    } catch (error) {
      alert(error);
    }
  };

  render() {
    const { attributes } = this.props.task;
    const timeReceived = moment(attributes.utcDateTimeReceived);
    const localTz = moment.tz.guess();
    const localTimeShort = timeReceived.tz(localTz).format('MM-D-YYYY, h:mm:ss a z');
    const serverTimeShort = timeReceived.tz(attributes.mainTimeZone).format('MM-D-YYYY, h:mm:ss a z');

    return (
      <span className="Twilio">
        <h1>Contact CallBack Request</h1>
        <p>A contact has requested an immediate callback.</p>
        <h4 style={styles.itemBold}>Callback Details</h4>
        <ul>
          <li>
            <div style={styles.itemWrapper}>
              <span style={styles.item}>Contact Phone:</span>
              <span style={styles.itemDetail}>{attributes.callbackDestination}</span>
            </div>
          </li>
          <li>&nbsp;</li>
          <li>
            <div style={styles.itemWrapper}>
              <span style={styles.itemBold}>Call Reception Information</span>
            </div>
          </li>
          <li>
            <div style={styles.itemWrapper}>
              <label style={styles.item}>Received:&nbsp;</label>
              <Tooltip title="System call reception time" placement="right" arrow="true">
                <Icon color="primary" fontSize="small" style={styles.info}>
                  info
                </Icon>
              </Tooltip>
              <label style={styles.itemDetail}>{serverTimeShort}</label>
            </div>
          </li>
          <li>
            <div style={styles.itemWrapper}>
              <label style={styles.item}>Localized:&nbsp;</label>
              <Tooltip title="Call time localized to agent" placement="right" arrow="true">
                <Icon color="primary" fontSize="small" style={styles.info}>
                  info
                </Icon>
              </Tooltip>
              <label style={styles.itemDetail}>{localTimeShort}</label>
            </div>
          </li>
          <li>&nbsp;</li>
        </ul>
        <Button
          style={styles.cbButton}
          variant="contained"
          color="primary"
          onClick={async () => this.startCall()}
          disabled={this.state.cbCallButtonBlocked}
        >
          Place Call Now ( {attributes.callbackDestination} )
        </Button>
      </span>
    );
  }
}
