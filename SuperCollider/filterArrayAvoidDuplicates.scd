// =====================================================================
// SuperCollider Workspace
// =====================================================================

(
~memoryLength = inf;
~memory = [];

~filterMessage = {|newValues|
  var handleMessage;

  (~memoryLength == 0).if
  {~memory = []}
  {(~memory.size > ~memoryLength).and{~memory = ~memory[1..~memoryLength]}};

  handleMessage = ~memory.any{|oldValues| oldValues == newValues}.not;

  handleMessage.if{
    ~handleMessage.value(newValues);
    ~memory = ~memory.add(newValues);
    "message processed"
  }
  {
    ~memory = ~memory.add(nil);
    "message discarded";
  }
};

~handleMessage = {|newValues| "message received: %".format(newValues).postln};
)


(
~filterMessage.value([ '387.77', '1540.46', '849.48' ]);
)

OSCdef(\x, { |...args| ~filterMessage.value(args[0].drop(1)) }, '/nn/');