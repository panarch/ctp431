window.alert('ok!');

const synth = new Tone.Synth().toMaster();
synth.triggerAttackRelease('C4', '8n');
