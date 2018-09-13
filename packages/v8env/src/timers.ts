// /**
//  * @module timers
//  */

// declare var bridge: any

// /**
//  * Fires a callback function after the specified time elapses.
//  * @param cb function to execute after time elapses
//  * @param ms milliseconds to wait before executing
//  * @return an ID for the newly created timeout
//  */
// export function setTimeout(cb, ms) {
//   const ref = bridge.wrapFunction(cb)
//   return bridge.dispatchSync("setTimeout", ref, ms)
// }

// /**
//  * Cancels a previously specified timeout
//  * @param id the id of the timeout to cancel
//  */
// export function clearTimeout(id) {
//   bridge.dispatch("clearTimeout", id)
// }

// /**
//  * Fires a callback after the current task yields
//  * @param cb The callback to fire asynchronously
//  */
// export function setImmediate(cb) {
//   setTimeout(cb, 0)
// }

// /**
//  * Fires a callback over and over
//  * @param cb The callback to fire every <ms> milliseconds
//  * @param ms Milliseconds to wait between intervals
//  * @return id of newly created interval
//  */
// export function setInterval(cb, ms) {
//   const ref = bridge.wrapFunction(cb)
//   return bridge.dispatchSync("setInterval", ref, ms)
// }

// /**
//  * Cancels the previously created interval
//  * @param id The interval ID to cancel
//  */
// export function clearInterval(id) {
//   bridge.dispatch("clearInterval", id)
// }


// Copyright 2018 the Deno authors. All rights reserved. MIT license.
import { assert } from "./util";
import * as util from "./util";
import { fly as fbs } from "./msg_generated";
import { flatbuffers } from "flatbuffers";
import { sendSync, sendAsync } from "./dispatch";
import { libfly } from "./libfly";

let nextTimerId = 1;

// tslint:disable-next-line:no-any
export type TimerCallback = (...args: any[]) => void;

interface Timer {
  id: number;
  cb: TimerCallback;
  interval: boolean;
  // tslint:disable-next-line:no-any
  args: any[];
  delay: number; // milliseconds
}

function startTimer(
  id: number,
  cb: TimerCallback,
  delay: number,
  interval: boolean,
  // tslint:disable-next-line:no-any
  args: any[]
): void {
  const timer: Timer = {
    id,
    interval,
    delay,
    args,
    cb
  };
  util.log("timers.ts startTimer");

  // Send TimerStart message
  // const builder = new flatbuffers.Builder();
  // fbs.TimerStart.startTimerStart(builder);
  // fbs.TimerStart.addId(builder, timer.id);
  // fbs.TimerStart.addDelay(builder, timer.delay);
  // const msg = fbs.TimerStart.endTimerStart(builder);

  sendAsync("timer_start", id, delay).then(args => {
    //   baseRes => {
    //     assert(fbs.Any.TimerReady === baseRes!.msgType());
    //     const msg = new fbs.TimerReady();
    //     assert(baseRes!.msg(msg) != null);
    //     assert(msg.id() === timer.id);
    //     if (msg.canceled()) {
    //       util.log("timer canceled message");
    //     } else {
    cb(...args);
    if (interval) {
      // TODO Faking setInterval with setTimeout.
      // We need a new timer implementation, this is just a stopgap.
      startTimer(id, cb, delay, true, args);
    }
    //     }
    //   },
    //   error => {
    //     throw error;
    //   }
  });


}

export function setTimeout(
  cb: TimerCallback,
  delay: number,
  // tslint:disable-next-line:no-any
  ...args: any[]
): number {
  const id = nextTimerId++;
  startTimer(id, cb, delay, false, args);
  return id;
}

export function setInterval(
  cb: TimerCallback,
  delay: number,
  // tslint:disable-next-line:no-any
  ...args: any[]
): number {
  const id = nextTimerId++;
  startTimer(id, cb, delay, true, args);
  return id;
}

export function clearTimer(id: number) {
  // const builder = new flatbuffers.Builder();
  // fbs.TimerClear.startTimerClear(builder);
  // fbs.TimerClear.addId(builder, id);
  // const msg = fbs.TimerClear.endTimerClear(builder);
  // const res = sendSync(builder, fbs.Any.TimerClear, msg);
  // assert(res == null);
}