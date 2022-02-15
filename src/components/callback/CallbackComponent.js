import React from 'react';
import moment from 'moment';
import 'moment-timezone';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Icon from '@material-ui/core/Icon';

import styles from './CallbackStyles';

export default class CallbackComponent extends React.Component {
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
          onClick={async () => this.props.startCall()}
          disabled={this.props.cbCallButtonBlocked}
        >
          Place Call Now ( {attributes.callbackDestination} )
        </Button>
      </span>
    );
  }
}
