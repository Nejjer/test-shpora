var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) =>
    key in obj
        ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value })
        : (obj[key] = value);
var __spreadValues = (a, b) => {
    for (var prop in b || (b = {})) __hasOwnProp.call(b, prop) && __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
        for (var prop of __getOwnPropSymbols(b))
            __propIsEnum.call(b, prop) && __defNormalProp(a, prop, b[prop]);
    return a;
};
var CharacterUtil = class {
    static getPropertyToChange(direction) {
        switch (direction) {
            case this.directions.up:
            case this.directions.down:
                return 'y';
            default:
                return 'x';
        }
    }
    static getVelocity(direction, velocityPerMs) {
        switch (direction) {
            case this.directions.up:
            case this.directions.left:
                return -1 * velocityPerMs;
            default:
                return velocityPerMs;
        }
    }
    static turningAround(direction, desiredDirection) {
        return desiredDirection === this.getOppositeDirection(direction);
    }
    static getOppositeDirection(direction) {
        switch (direction) {
            case this.directions.up:
                return this.directions.down;
            case this.directions.down:
                return this.directions.up;
            case this.directions.left:
                return this.directions.right;
            default:
                return this.directions.left;
        }
    }
    static determineRoundingFunction(direction) {
        switch (direction) {
            case this.directions.up:
            case this.directions.left:
                return Math.floor;
            default:
                return Math.ceil;
        }
    }
    static changingGridPosition(oldPosition, position) {
        return (
            Math.floor(oldPosition.x) !== Math.floor(position.x) ||
            Math.floor(oldPosition.y) !== Math.floor(position.y)
        );
    }
    static checkForWallCollision(desiredNewGridPosition, mazeArray, direction) {
        const roundingFunction = this.determineRoundingFunction(direction);
        const desiredX = roundingFunction(desiredNewGridPosition.x);
        const desiredY = roundingFunction(desiredNewGridPosition.y);
        let newGridValue;
        Array.isArray(mazeArray[desiredY]) && (newGridValue = mazeArray[desiredY][desiredX]);
        return 'X' === newGridValue;
    }
    static determineNewPositions(position, direction, velocityPerMs, elapsedMs) {
        const newPosition = Object.assign({}, position);
        newPosition[this.getPropertyToChange(direction)] +=
            this.getVelocity(direction, velocityPerMs) * elapsedMs;
        return { newPosition, newGridPosition: __spreadValues({}, newPosition) };
    }
    static snapToGrid(position, direction) {
        const newPosition = Object.assign({}, position);
        const roundingFunction = this.determineRoundingFunction(direction);
        switch (direction) {
            case this.directions.up:
            case this.directions.down:
                newPosition.y = roundingFunction(newPosition.y);
                break;
            default:
                newPosition.x = roundingFunction(newPosition.x);
        }
        return newPosition;
    }
    static handleWarp(position, mazeArray) {
        const newPosition = Object.assign({}, position);
        const gridPosition = __spreadValues({}, position);
        gridPosition.x < 0
            ? (newPosition.x = mazeArray[0].length - 1)
            : gridPosition.x >= mazeArray[0].length && (newPosition.x = 0);
        gridPosition.y < 0
            ? (newPosition.y = mazeArray.length - 1)
            : gridPosition.y >= mazeArray.length && (newPosition.y = 0);
        return newPosition;
    }
};
((obj, key, value) => {
    __defNormalProp(obj, 'symbol' != typeof key ? key + '' : key, value);
})(CharacterUtil, 'directions', { up: 'up', down: 'down', left: 'left', right: 'right' });
var Pacman = class {
    constructor(pacmanSettings, mazeArray) {
        this.type = 'pacman';
        this.mazeArray = mazeArray;
        this.defaultPosition = pacmanSettings.position;
        this.reset(pacmanSettings.initialDirection);
    }
    reset(initialDirection) {
        this.velocityPerMs = 0.01;
        this.desiredDirection = initialDirection ?? CharacterUtil.directions.left;
        this.direction = initialDirection ?? CharacterUtil.directions.left;
        this.position = __spreadValues({}, this.defaultPosition);
    }
    changeDirection(newDirection) {
        this.desiredDirection = newDirection;
    }
    handleSnappedMovement(elapsedMs) {
        const desired = CharacterUtil.determineNewPositions(
            this.position,
            this.desiredDirection,
            this.velocityPerMs,
            elapsedMs,
        );
        const alternate = CharacterUtil.determineNewPositions(
            this.position,
            this.direction,
            this.velocityPerMs,
            elapsedMs,
        );
        if (
            CharacterUtil.checkForWallCollision(
                desired.newGridPosition,
                this.mazeArray,
                this.desiredDirection,
            )
        )
            return CharacterUtil.checkForWallCollision(
                alternate.newGridPosition,
                this.mazeArray,
                this.direction,
            )
                ? this.position
                : alternate.newPosition;
        this.direction = this.desiredDirection;
        return desired.newPosition;
    }
    handleUnsnappedMovement(gridPosition, elapsedMs) {
        const desired = CharacterUtil.determineNewPositions(
            this.position,
            this.desiredDirection,
            this.velocityPerMs,
            elapsedMs,
        );
        const alternate = CharacterUtil.determineNewPositions(
            this.position,
            this.direction,
            this.velocityPerMs,
            elapsedMs,
        );
        if (CharacterUtil.turningAround(this.direction, this.desiredDirection)) {
            this.direction = this.desiredDirection;
            return desired.newPosition;
        }
        return CharacterUtil.changingGridPosition(gridPosition, alternate.newGridPosition)
            ? CharacterUtil.snapToGrid(gridPosition, this.direction)
            : alternate.newPosition;
    }
    update(elapsedMs) {
        const snapped = CharacterUtil.snapToGrid(this.position, this.direction);
        JSON.stringify(this.position) === JSON.stringify(snapped)
            ? (this.position = this.handleSnappedMovement(elapsedMs))
            : (this.position = this.handleUnsnappedMovement(this.position, elapsedMs));
        this.position = CharacterUtil.handleWarp(this.position, this.mazeArray);
    }
};
var Ghost = class {
    constructor(mazeArray, settings, pacman, ghosts, eventCallback) {
        this.type = 'ghost';
        this.mazeArray = mazeArray;
        this.pacman = pacman;
        this.settings = settings;
        this.ghosts = ghosts;
        this.eventCallback = eventCallback;
        this.reset();
    }
    reset() {
        this.setDefaultPosition();
        this.setMovementStats(this.pacman, this.settings);
    }
    setMovementStats(pacman, settings) {
        const pacmanSpeed = pacman.velocityPerMs;
        this.velocityPerMs = () =>
            (('function' == typeof settings.velocity
                ? settings.velocity(pacman.position, this.position)
                : settings.velocity) ?? 1) * pacmanSpeed;
    }
    setDefaultPosition() {
        this.position = this.settings.position;
    }
    getTile(mazeArray, y, x) {
        let tile = !1;
        mazeArray[y] && mazeArray[y][x] && 'X' !== mazeArray[y][x] && (tile = { x, y });
        return tile;
    }
    determinePossibleMoves(gridPosition, direction, mazeArray) {
        const { x, y } = gridPosition;
        const possibleMoves = {
            up: this.getTile(mazeArray, y - 1, x),
            down: this.getTile(mazeArray, y + 1, x),
            left: this.getTile(mazeArray, y, x - 1),
            right: this.getTile(mazeArray, y, x + 1),
        };
        this.settings.canTurnAround ||
            (possibleMoves[CharacterUtil.getOppositeDirection(direction)] = !1);
        Object.keys(possibleMoves).forEach((tile) => {
            !1 === possibleMoves[tile] && delete possibleMoves[tile];
        });
        return possibleMoves;
    }
    calculateDistance(position, pacman) {
        return Math.sqrt((position.x - pacman.x) ** 2 + (position.y - pacman.y) ** 2);
    }
    getPositionInFrontOfPacman(pacmanGridPosition, spaces) {
        const target = Object.assign({}, pacmanGridPosition);
        const pacDirection = this.pacman.direction;
        const tileOffset = 'up' === pacDirection || 'left' === pacDirection ? -1 * spaces : spaces;
        target['up' === pacDirection || 'down' === pacDirection ? 'y' : 'x'] += tileOffset;
        return target;
    }
    determineBestMove(possibleMoves, gridPosition, pacmanGridPosition) {
        let bestDistance = 1 / 0;
        let bestMove;
        const target = this.settings.getMoveTarget(
            { type: 'ghost', position: this.position },
            [this.pacman, ...this.ghosts],
            this.mazeArray,
        );
        Object.keys(possibleMoves).forEach((move) => {
            const distance = this.calculateDistance(possibleMoves[move], target);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMove = move;
            }
        });
        return bestMove;
    }
    determineDirection(gridPosition, pacmanGridPosition, direction, mazeArray) {
        const possibleMoves = this.determinePossibleMoves(gridPosition, direction, mazeArray);
        return this.determineBestMove(possibleMoves, gridPosition, pacmanGridPosition);
    }
    handleSnappedMovement(elapsedMs, gridPosition, velocity, pacmanGridPosition) {
        const newPosition = Object.assign({}, this.position);
        this.direction = this.determineDirection(
            gridPosition,
            pacmanGridPosition,
            this.direction,
            this.mazeArray,
        );
        newPosition[CharacterUtil.getPropertyToChange(this.direction)] +=
            CharacterUtil.getVelocity(this.direction, velocity) * elapsedMs;
        return newPosition;
    }
    handleUnsnappedMovement(elapsedMs, gridPosition, velocity) {
        const desired = CharacterUtil.determineNewPositions(
            this.position,
            this.direction,
            velocity,
            elapsedMs,
        );
        return CharacterUtil.changingGridPosition(gridPosition, desired.newGridPosition)
            ? CharacterUtil.snapToGrid(gridPosition, this.direction)
            : desired.newPosition;
    }
    handleMovement(elapsedMs) {
        let newPosition;
        const snapped = CharacterUtil.snapToGrid(this.position, this.direction);
        newPosition =
            JSON.stringify(this.position) === JSON.stringify(snapped)
                ? this.handleSnappedMovement(
                      elapsedMs,
                      this.position,
                      this.velocityPerMs(),
                      this.pacman.position,
                  )
                : this.handleUnsnappedMovement(elapsedMs, this.position, this.velocityPerMs());
        newPosition = CharacterUtil.handleWarp(newPosition, this.mazeArray);
        return newPosition;
    }
    checkCollision(position, pacman) {
        this.calculateDistance(position, pacman) < 1 && this.eventCallback('pacmanEaten');
    }
    update(elapsedMs) {
        this.position = this.handleMovement(elapsedMs);
        this.checkCollision(this.position, this.pacman.position);
    }
};
var Pickup = class {
    constructor(type, position, pacman, eventCallback) {
        this.type = type;
        this.pacman = pacman;
        this.taken = !1;
        this.position = position;
        this.eventCallback = eventCallback;
    }
    checkForCollision() {
        const { x, y } = this.position;
        const { x: px, y: py } = this.pacman.position;
        return Math.sqrt((x - px) ** 2 + (y - py) ** 2) < 0.4;
    }
    update() {
        if (!this.taken && this.checkForCollision()) {
            this.taken = !0;
            this.eventCallback('pickupTaken');
        }
    }
};
var GameEngine = class {
    constructor(settings, eventCallback) {
        this.settings = settings;
        this.eventCallback = eventCallback;
        this.initEntities();
        eventCallback && this.sendEvent('update');
    }
    setEventCallback(eventCallback) {
        this.eventCallback = eventCallback;
        this.sendEvent('update');
    }
    initEntities() {
        const { mazeArray, pacman, ghosts } = this.settings;
        this.pacman = new Pacman(pacman, mazeArray);
        this.ghosts = [];
        this.pickups = [];
        this.entityList = [this.pacman];
        ghosts.forEach((gSettings) => {
            const newGhost = new Ghost(
                mazeArray,
                gSettings,
                this.pacman,
                this.ghosts,
                this.handleEvent,
            );
            this.ghosts.push(newGhost);
            this.entityList.push(newGhost);
        });
        mazeArray.forEach((row, rowIndex) => {
            row.forEach((block, columnIndex) => {
                if ('o' === block || 'O' === block) {
                    const pickup = new Pickup(
                        'o' === block ? 'pacdot' : 'powerPellet',
                        { x: columnIndex, y: rowIndex },
                        this.pacman,
                        this.handleEvent,
                    );
                    this.entityList.push(pickup);
                    this.pickups.push(pickup);
                }
            });
        });
    }
    changePacmanDirection(direction) {
        this.pacman.changeDirection(direction);
    }
    update(elapsedMs) {
        this.entityList.forEach((entity) => entity.update(elapsedMs));
        this.sendEvent('update');
    }
    sendEvent(type) {
        if ('update' === type) this.eventCallback({ type, entities: this.mapEntities() });
        else this.eventCallback({ type });
    }
    mapEntities() {
        return this.entityList.map((e) => {
            const { type, position, taken } = e;
            switch (type) {
                case 'ghost':
                case 'pacman':
                    return { type, position };
                default:
                    return { type, position, taken };
            }
        });
    }
    handleEvent = (type) => {
        switch (type) {
            case 'pacmanEaten':
                this.sendEvent('gameFailed');
                break;
            case 'pickupTaken':
                this.pickups.find((e) => !e.taken) || this.sendEvent('gameComplete');
                break;
        }
    };
    serialize = () => {
        const { mazeArray } = this.settings;
        const layout = mazeArray.map((row) => row.map((block) => ('X' === block ? '░' : ' ')));
        const lenY = layout.length;
        const lenX = layout[0].length;
        const write = (pos, char, dir = CharacterUtil.directions.left) => {
            const { x, y } = CharacterUtil.snapToGrid(pos, dir);
            layout[y % lenY][x % lenX] = char;
        };
        for (const { type, position, taken } of this.pickups)
            if (!taken) {
                write(position, 'pacdot' === type ? '·' : '°');
            }
        for (const { position, direction } of this.ghosts) write(position, '×', direction);
        write(this.pacman.position, '@', this.pacman.direction);
        return layout.map((row) => row.join('')).join('\n');
    };
};
function getHistory(engine, size = 5) {
    const initial = engine.serialize();
    const records = new Map();
    let step = 0;
    return {
        record() {
            records.set(++step, engine.serialize());
            if (records.size > size) {
                const oldest = records.entries().next();
                records.delete(oldest.value[0]);
            }
        },
        print: () =>
            [[0, initial], ...records.entries()]
                .map(([turn, record]) => `\nШаг: ${turn}\n${record}\n`)
                .join('\n'),
    };
}
var getTestGame = (settings, pacmanDirectionHandler, historySize2 = 8) => {
    const engine = new GameEngine(settings);
    const history = getHistory(engine, historySize2);
    let gameState = 'playing';
    let stepsCount = 0;
    const mazeCopy = JSON.parse(JSON.stringify(settings.mazeArray));
    engine.setEventCallback(({ type, entities = [] }) => {
        const entitiesCopy = JSON.parse(JSON.stringify(entities));
        switch (type) {
            case 'update':
                engine.changePacmanDirection(pacmanDirectionHandler(entitiesCopy, mazeCopy));
                break;
            case 'gameFailed':
                gameState = 'loss';
                break;
            case 'gameComplete':
                gameState = 'win';
        }
    });
    return {
        engine,
        get gameState() {
            return gameState;
        },
        get stepsCount() {
            return stepsCount;
        },
        update() {
            if ('playing' === gameState) {
                engine.update(100);
                history.record();
                stepsCount++;
            }
        },
        history,
    };
};
var getTestScore = ({ game, minStepsToEatFood }) => {
    const takenPickups = game.engine.pickups.filter((p) => p.taken);
    const score =
        'win' === game.gameState
            ? 2 * minStepsToEatFood + (500 * takenPickups.length) / game.stepsCount
            : 100 * takenPickups.length;
    return Math.ceil(score);
};
var getTestOutput = ({ game, minStepsToEatFood }, points) => {
    const score = points || getTestScore({ game, minStepsToEatFood });
    return `\nРезультат: ${game.gameState.toUpperCase()}\nСчет: ${score}\nИстория ходов: ${game.history.print()}\n`;
};
var sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));
async function run({
    settings,
    pacmanDirectionHandler,
    turnLimit = 5e3,
    showTestOutput = !0,
    turnTimeMs = 1e3,
}) {
    const game = getTestGame(settings, pacmanDirectionHandler, 10);
    console.clear();
    console.log(game.engine.serialize());
    try {
        for (let i = 0; i < turnLimit; i++) {
            turnTimeMs > 0 && (await sleep(turnTimeMs));
            console.clear();
            game.update();
            console.log(game.engine.serialize());
            if ('playing' !== game.gameState) break;
        }
    } catch (e) {
        console.error(e);
    }
    showTestOutput && console.log(getTestOutput({ game, minStepsToEatFood: turnLimit }));
}
export { run };
