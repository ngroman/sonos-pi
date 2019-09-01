const {exec, spawn} = require('child_process');
const SonosSystem = require('sonos-discovery');

const PLAYING = 'PLAYING';
const player_uuid = 'RINCON_949F3EB497C801400'; // Dining room
const SHUTDOWN_TIMEOUT_MS = 10 * 60 * 1000;

const irCommand = process.env.IR_COMMAND || 'irsend';

function log(...args) {
  console.log.apply(console, args);
}

class Receiver {
  powerOn() {
    // log('IR_SEND', 'allPowerOn');
    this.irSend('allPowerOn');
  }

  powerOff() {
    // log('IR_SEND', 'allPowerOff');
    this.irSend('allPowerOff');
  }

  // irsend --count=5 SEND_ONCE denon-ir1 allPowerOn
  // irsend --count=5 SEND_ONCE denon-ir1 allPowerOff
  irSend(command) {
    const fullCmd = `${irCommand} --count=5 SEND_ONCE denon-ir1 "${command}"`;
    const outBuf = [];
    const errBuf = [];

    log('ir-send:', fullCmd);
    const proc = exec(fullCmd, {timeout: 1000, stdio: 'inherit'});

    // // proc.stdout.on('data', data => {
    // //   outBuf.push(data);
    // // });
    // // proc.stderr.on('data', data => {
    // //   errBuf.push(data);
    // // });
    proc.on('exit', code => {
      if (code !== 0) {
        log(`ERROR: IR send failed code=${code}`);
        outBuf.length && log(`OUT: ${outBuf.join('')}`);
        errBuf.length && log(`ERR: ${errBuf.join('')}`);
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
