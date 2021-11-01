// Type definitions for pino-abstract-transport 0.4.0
// Project: https://github.com/pinojs/pino-abstract-transport#readme
// Definitions by: Diyar Oktay <https://github.com/windupbird144>

/// <reference types="node" />
/// <reference types="duplexify" />

import { Duplexify } from "duplexify";
import { Transform } from "stream";

type BuildOptions = {
  /**
   * `parseLine(line)` a function that is used to parse line received from pino.
   * @default JSON.parse
   */
  parseLine?: (line: string) => unknown;

  /**
   * `parse` an option to change to data format passed to build function.
   * @default undefined
   *
   */
  parse?: "lines";

  /**
   * `close(err, cb)` a function that is called to shutdown the transport.
   * It's called both on error and non-error shutdowns. It can also return
   * a promise. In this case discard the the cb argument.
   *
   * @example
   * ```typescript
   * {
   *   close: function (err, cb) {
   *     process.nextTick(cb, err)
   *   }
   * }
   * ```
   * */
  close?: (err: Error, cb: Function) => void | Promise<void>;

  /**
   * `metadata` If set to false, do not add metadata properties to the returned stream
   */
  metadata?: false;
};

type DuplexifyBuildOptions = BuildOptions & {
  enablePipelining: true;
};

interface OnUnknown {
  /**
   * `unknown` is the event emitted where an unparsable line is found
   *
   * @param event 'unknown'
   * @param line the unparsable line
   * @param error the error that was thrown when parsing the line
   */
  on(event: "unknown", listener: (line: string, error: unknown) => void): void;
}

/**
 * Create a split2 instance and returns it. This same instance is also passed
 * to the given function, which is called synchronously.
 *
 * @returns {Transform} the split2 instance
 */
declare function build(
  fn: (transform: Transform & OnUnknown) => void | Promise<void>,
  opts?: BuildOptions
): Transform & OnUnknown;

/**
 * Creates a split2 instance and passes it to the given function, which is called synchronously.
 * Wraps the split2 instance and the returned stream using duplexify, so they can be concatenated
 * into multiple transports.
 *
 * @returns {duplexify.Duplexify} the wrapped split2 instance
 */
declare function build(
  fn: (transform: Transform & OnUnknown) => Transform & OnUnknown,
  opts: DuplexifyBuildOptions
): Duplexify;

export { OnUnknown };

export default build;
