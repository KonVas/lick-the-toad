// =====================================================================
// SuperCollider Workspace
// =====================================================================

OSCFunc.trace(false)
s.boot
NetAddr.langPort


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

Ndef(\instr, {Instruction.ar(b.bufnum)}).play;

Ndef(\instr)[1] = \filter -> {|in| Shaper.ar(b, in) + in };
Ndef(\instr)[2] = \filter -> {|in| LeakDC.ar(in) + in };
Ndef(\instr)[3] = \filter -> {|in| Resonz.ar(in) + in };
Ndef(\instr)[4] = \filter -> {|in| FreeVerb.ar(in)*0.5 + in};
Ndef(\instr)[5] = \filter -> {|in| GVerb.ar(in)*0.2 + in };
Ndef(\instr)[6] = \filter -> {|in| Ringz.ar(in*0.07, decay:90) };




Ndef(\looper)[1] = \filter -> {|in| Shaper.ar(b, in, add:in) };


Spec.add(\freq, [0.1, 1.0]);
Spec.add(\recRate, [0.1, 10]);
Spec.add(\recScale, [0.1, 10]);

(
OSCdef(\rgrsn, {|msg|
	msg.postln;
	Ndef(\rec).set(\freq, \freq.asSpec.map(msg[1] / 1000));
}, '/neural/net/regression');
);

(
OSCdef(\crsX, {|msg|
	msg.postln;
	Ndef(\looper).set(\recRate, \recRate.asSpec.map(msg[1].round(0.01) / 1000.0));
},  '/neural/net/cursor/x');
);


(
OSCdef(\crsY, {|msg|
	msg.postln;
		Ndef(\looper).set(\recScale, \recScale.asSpec.map(msg[1].round(0.01) / 1000.0));
}, '/neural/net/cursor/y');
);


Ndef(\looper, {Looper.ar(Ndef.ar(\instr)*0.1, 2, LFNoise0.kr(1).range(0.1, 1.75), \recRate.kr(1, 3), \recScale.kr(1, 3) )}).play(1, 1);
Ndef(\looper).vol_(0.25);
Ndef(\looper)[1] = \filter -> {|in| Shaper.ar(b, in) ** in };
Ndef(\looper)[2] = \filter -> {|in| LeakDC.ar(in) ** in };


NdefMixer(s);
)
//tester
n = NetAddr("127.0.0.1", 57120).sendMsg('/right/open/posx', 0.2);
//NetAddr.langPort
//
