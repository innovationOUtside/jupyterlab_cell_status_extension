/*

Functions related to audio and speech handling.

- say: speak a message aloud;
- play_tone: generate tone;
- play_success: play a tone on successful execution of a cell;
- play_error: play a tone on unsuccessful execution of a cell;
              also accept a message that be be spoken after the tone;

*/

// Create an AudioContext object for generating feedback tones as required.
const audioContext = new window.AudioContext();

// Speak a message aloud using a browser SpeechSynthesisUtterance
// The SpeechSynthesisUtterance object should be available
// for garbage collection after the message is spoken.
export const say = (message: string | null) => {
  if (message) {
    let utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }
};

// Generate a tone using the AudioContext object.
export function play_tone(
  frequency: number = 440,
  duration_ms: number = 1000, //milliseconds
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

  // Set the gain envelope
  gain.gain.exponentialRampToValueAtTime(
    0.00001,
    audioContext.currentTime + duration_ms
  );

  // Stop the oscillator after the specified duration
  setTimeout(() => {
    oscillator.stop();
    if (message)
      setTimeout(() => {
        say(message);
      }, 100);
  }, duration_ms);
}

export function play_success(msg: string | null = null) {
  play_tone(1000, 100, 0.1, 'sine', msg);
}

export function play_error(msg: string | null = null) {
  play_tone(50, 400, 0.1, 'sawtooth', msg);
}

/*
// Notes for a possible heartbeat, if we can identify when a cell starts running
// Extensions that support notifications or cell execution timing may be relevnt here.

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
