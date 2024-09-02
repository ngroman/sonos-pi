const http = require('http');
const SonosSystem = require('sonos-discovery');

const PLAYING = 'PLAYING';
const PLAYER_UUID = process.env.SONOS_UUID || 'RINCON_949F3EB497C801400'; // Dining room
const SHUTDOWN_TIMEOUT_MS = 5 * 60 * 1000;

const receiverHostname = process.env.RECEIVER_HOSTNAME || 'denon.local.nroman.dev';
const receiverSetInput = process.env.RECEIVER_INPUT_CMD || 'SIMPLAY'; // Set Input Media Player
const REC_PATH = '/goform/formiPhoneAppDirect.xml'
const REC_CMD_ON = 'ZMON'; // Zone main on
const REC_CMD_OFF = 'PWSTANDBY'

function log(...args) {
  console.log.apply(console, args);
}

class Receiver {
  constructor() {
    this.cmdInFlight = false;
  }

  powerOn() {
    this.sendHttp(REC_CMD_ON);
    this.sendHttp(receiverSetInput);
  }

  powerOff() {
    this.sendHttp(REC_CMD_OFF);
  }

  sendHttp(command) {
    log(`Sending command: ${command}`);
    const options = {
      host: receiverHostname,
      path: `${REC_PATH}?${command}`,
    };
    log(options);

    var req = http.get(options, function(res) {
      log('Response status', res.statusCode);
    });
    req.on('error', function(e) {
      console.log('ERROR: ' + e.message);
    });
  }
}

const toState = system => ({
  // PLAYING, PAUSED_PLAYBACK, STOPPED
  playbackState: system.getPlayerByUUID(PLAYER_UUID).state.playbackState,
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
