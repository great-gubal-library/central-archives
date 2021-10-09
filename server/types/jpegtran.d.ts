declare module 'jpegtran' {
	import { Duplex } from "stream";

	export default class JpegTran extends Duplex {
		constructor(args?: (string|number)[]);
	}
}
