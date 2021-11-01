import build, { OnUnknown } from "../../index";
import { expectType } from "tsd";
import { Duplexify } from "duplexify";
import { Transform } from "stream";

/**
 * build with enablePipelining returns a Duplexify stream
 */
expectType<Duplexify>(build((source) => source, { enablePipelining: true }));

/**
 * build without enablePipelining returns a node stream
 */
expectType<Transform & OnUnknown>(build((source) => {}));

/**
 * build also accepts an async function
 */
expectType<Transform  & OnUnknown>(build(async (source) => {}));
