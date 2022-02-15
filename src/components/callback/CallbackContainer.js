import { Actions, TaskHelper } from '@twilio/flex-ui';

import CallbackComponent from './CallbackComponent';

const autoAcceptEnabled = JSON.parse(process.env.REACT_APP_CHANNEL_AUTO_ACCEPT);
const autoDialEnabled = JSON.parse(process.env.REACT_APP_CHANNEL_AUTO_DIAL);

export default class CallbackContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cbCallButtonBlocked: true,
      outboundCallTriggered: false,
    };
  }

  componentDidMount() {
    if (['accepted', 'wrapping'].includes(this.props.task.status)) {
      this.checkIfWorkerHasVoiceCall();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.task.status === 'accepted' &&
      this.props.task.status === 'accepted' &&
      this.state.cbCallButtonBlocked === true &&
      this.state.outboundCallTriggered === false &&
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
    return (
      <CallbackComponent
        task={this.props.task}
        startCall={this.startCall}
        cbCallButtonBlocked={this.state.cbCallButtonBlocked}
      />
    );
  }
}
