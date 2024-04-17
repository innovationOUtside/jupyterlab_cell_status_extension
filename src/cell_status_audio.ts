const audioContext = new window.AudioContext();

export const say = (message: string | null) => {
  if (message) {
    let utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }
};

export function play_tone(
  frequency: number = 440,
  duration: number = 1000, //milliseconds
  volume: number = 0.1,
  type: OscillatorType = 'sine', //  "sine", "square", "sawtooth", "triangle",  "custom"
  message: string | null = null
) {
  // Create a new AudioContext

  // Create an OscillatorNode
  const oscillator = audioContext.createOscillator();

  // Create a gain node
  const gain = audioContext.createGain();

  // Set the colume
  gain.gain.value = volume;

  // Set the type of the oscillator
  oscillator.type = type;

  // Set the frequency of the oscillator
  oscillator.frequency.value = frequency;

  // Connect the gain function
  oscillator.connect(gain);

  // Connect the oscillator to the audio context's destination (the speakers)
  oscillator.connect(audioContext.destination);

  // Start the oscillator immediately
  oscillator.start();

  gain.gain.exponentialRampToValueAtTime(
    0.00001,
    audioContext.currentTime + duration
  );
  // Stop the oscillator after the specified duration
  setTimeout(() => {
    oscillator.stop();
    if (message)
      setTimeout(() => {
        say(message);
      }, 100);
  }, duration);
}
export function play_success(msg: string | null = null) {
  play_tone(1000, 100, 0.1, 'sine', msg);
}

export function play_error(msg: string | null = null) {
  play_tone(50, 400, 0.1, 'sawtooth', msg);
}

export function report_cellnum_error(cell_num: number | null) {
  let utterance = new SpeechSynthesisUtterance(`Borked in cell ${cell_num}`);
  window.speechSynthesis.speak(utterance);
}

/*
// Notes for a possible heartbeat, if we can identify when a cell starts running
// Extensions that support notificitions or cell execution timing may be relevnt here.

const hearbeatContext = new window.AudioContext();

function createHeartbeat() {
  const o = hearbeatContext.createOscillator();
  g = hearbeatContext.createGain();
  o.connect(g);
  o.type = 'sine';
  g.connect(hearbeatContext.destination);
  o.start(0);
  g.gain.exponentialRampToValueAtTime(
    0.00001,
    hearbeatContext.currentTime + 0.05;
  );
}

// Really, we need to have separate hearbeats for different notebooks?
// Does the notifications extension suggest a way for that, perhaps?
export function audio_pulse(pulse_s: number = 5) {
  console.log('pulse...');
  let heartbeatInterval = setInterval(
    () => createHeartbeat(),
    pulse_s*1000
  );
  return heartbeatInterval;
}

// With the return value, when a cell has finished execution,
// we can then call: clearInterval(heartbeatInterval)
*/
