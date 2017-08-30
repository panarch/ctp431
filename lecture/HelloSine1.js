const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
gainNode.connect(audioCtx.destination);

let onPlaying = false;
let oscillator = audioCtx.createOscillator();
oscillator.type = 'sine'; // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
oscillator.frequency.value = 2500; // value in hertz
oscillator.start();

const $play = document.querySelector('#play');
$play.addEventListener('click', function (e) {
  if (onPlaying) {
    // oscillator.stop();
    if (oscillator.context) oscillator.disconnect(gainNode);
    oscillator.frequency.value = 2500;
    toggleButton(false);
    return;
  }

  oscillator.connect(gainNode);
  toggleButton(true);
  setTimeout(onTick, 50);
});

function onTick() {
  if (!onPlaying) return;

  oscillator.frequency.value -= 20;

  if (oscillator.frequency.value > 1000) {
    setTimeout(onTick, 50);
  } else {
    if (oscillator.context) oscillator.disconnect(gainNode);
    oscillator.frequency.value = 2500;
    toggleButton(false);
  }
}

function toggleButton(_onPlaying = !onPlaying) {
  onPlaying = _onPlaying;
  $play.textContent = onPlaying ? 'Stop' : 'Play';
}
