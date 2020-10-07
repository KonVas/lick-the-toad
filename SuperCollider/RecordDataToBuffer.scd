// =====================================================================
// SuperCollider Workspace
// =====================================================================
(
Server.default.options.outDevice_("JackBridge");
s.reboot;
//OSCFunc.trace(false)
)

//Record controls:

(
b = Buffer.alloc(s, s.sampleRate / Server.default.options.blockSize*2);
b.plot;
//{RecordBuf.kr(LFNoise1.kr(10, 120), b)}.play;

Ndef(\rec, {RecordBuf.kr( \freq.kr(10, 0.3), b)}).play;

Ndef(\in, {SinOsc.ar(PlayBuf.kr(1, b, loop: 1).range(100, 500), 0, 0.1).dup}).play(0, 1);
Ndef(\in)[1] = \filter -> {|in| Shaper.ar(b, in) + in };
Ndef(\in)[2] = \filter -> {|in| LeakDC.ar(in) + in };


Ndef(\looper)[1] = \filter -> {|in| Shaper.ar(b, in, add:in) };


Spec.add(\freq, [0.1, 1.0]);
Spec.add(\recRate, [0.1, 1]);
Spec.add(\recScale, [0.1, 1]);

OSCdef(\rgrsn, {|msg|
	msg.postln;
	Ndef(\rec).set(\freq, \freq.asSpec.map(msg[1]));
}, '/right/open/posx');

OSCdef(\crsX, {|msg|
	msg.postln;
	Ndef(\looper).set(\recRate, \recRate.asSpec.map(msg[1].round(0.01)));
}, '/left/open/posx');

OSCdef(\crsY, {|msg|
	//msg.postln;
		Ndef(\looper).set(\recScale, \recScale.asSpec.map(msg[1].round(0.01)));
}, '/right/open/posy');



Ndef(\looper, {Looper.ar(Ndef.ar(\in), 2, LFNoise0.kr(1).range(0.1, 1.75), \recRate.kr(1, 3), \recScale.kr(1, 3) )}).play(1, 1);
Ndef(\looper).vol_(0.25);
Ndef(\looper)[1] = \filter -> {|in| Shaper.ar(b, in) ** in };
Ndef(\looper)[2] = \filter -> {|in| LeakDC.ar(in) ** in };


NdefMixer(s)
)
//tester
n = NetAddr("127.0.0.1", 57120).sendMsg('/right/open/posx', 0.2);
//NetAddr.langPort