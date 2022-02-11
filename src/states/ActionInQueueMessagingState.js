/*
 *This file declares the redux store:
 *1. Action method constants
 *2. Initial state of the store
 *3. ACTIONS (methods)
 *4. Defines the reducer logic
 *
 *Synopsis:  This file creates the application "store" (i.e. State) that
 *is shared across components, or "state" data that is used by components as they
 *are loaded or unloaded.
 *
 *The redux stored allows components to "resume" their state
 */

//  define the action methods identifiers (constants)
const ACTION_CB_CALL_BTN_BLOCKED = 'CB_CALL_BTN_BLOCKED';

//  define the initial state values of the REDUX store
const initialState = {
  cbCallButtonBlocked: false,
};

//  declare the actions (methods) for acting on the reducer
export class Actions {
  // static dismissBar = () => ({ type: ACTION_DISMISS_BAR });
  static cbToggleCallButtonDisable = (value) => ({
    type: ACTION_CB_CALL_BTN_BLOCKED,
    value,
  });
}

//  define the reducer logic (updates to the application state)
export function reduce(state = initialState, action) {
  /*
   * console.log("===== in my reducer =====");
   * console.log(action, state);
   */

  switch (action.type) {
    case ACTION_CB_CALL_BTN_BLOCKED: {
      //  amend the updated store property based in updated value received
      return {
        ...state,
        cbCallButtonBlocked: action.value,
      };
    }
    default:
      return state;
  }
}
