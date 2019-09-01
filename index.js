const {spawn} = require('child_process');
const SonosSystem = require('sonos-discovery');

const PLAYING = 'PLAYING';
const player_uuid = 'RINCON_949F3EB497C801400'; // Dining room
const SHUTDOWN_TIMEOUT_MS = 10 * 60 * 1000;

const irCommand = process.env.IR_COMMAND || 'irsend';

function log(...args) {
  console.log.apply(console, args);
}

class Receiver {
  constructor() {
    this.cmdInFlight = false;
  }

  powerOn() {
    this.irSend('mainZoneOn');
  }

  powerOff() {
    this.irSend('allPowerOff');
  }

  // irsend --count=5 SEND_ONCE denon-ir1 mainZoneOn
  // irsend --count=5 SEND_ONCE denon-ir1 allPowerOff
  irSend(command) {
    if (this.cmdInFlight) {
      log('IR command already in flight. Skipping.');
      return;
    }
    this.cmdInFlight = true;
    const args = ['--count=5', 'SEND_ONCE', 'denon-ir1', command];
    log('ir-send:', irCommand, args.join(' '));
    const child = spawn(irCommand, args, {stdio: 'inherit'});
    const killTimeout = setTimeout(() => {
      child.kill(); // Just in case
    }, 2000);
    child.on('exit', code => {
      this.cmdInFlight = false;
      clearTimeout(killTimeout);
      if (code !== 0) {
        log(`ERROR: IR send failed code=${code}`);
      }
    });
  }
}

const toState = system => ({
  // PLAYING, PAUSED_PLAYBACK, STOPPED
  playbackState: system.getPlayerByUUID(player_uuid).state.playbackState,
});
const isPlaying = state => !!(state && state.playbackState === PLAYING);

const sonos = new SonosSystem({});
const rec = new Receiver();
let prevState = null;
let timeout = null;

sonos.on('transport-state', transportState => {
  const newState = toState(sonos);
  log('transport-state', newState);
  if (isPlaying(newState)) {
    clearTimeout(timeout);
    timeout = null;

    rec.powerOn();
  } else if (!timeout && isPlaying(prevState)) {
    log('Scheduling power off');
    timeout = setTimeout(() => {
      timeout = null;
      rec.powerOff();
    }, SHUTDOWN_TIMEOUT_MS);
  }
  prevState = newState;
});
