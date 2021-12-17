import { run } from './game.js';
import pacmanDirectionHandler from './task.js';
import { GAME_SETTINGS } from './settings.js';

run({
    settings: GAME_SETTINGS.secondTask,
    pacmanDirectionHandler,
    showTestOutput: true,
    turnLimit: 1000,
    turnTimeMs: 1000,
});
