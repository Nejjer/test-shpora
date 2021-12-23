/**
 * Напиши здесь логику, которая будет решать, куда пойти пакману!
 *
 * @typedef {Object} Point - координаты на карте
 * @property {number} x
 * @property {number} y
 *
 * @typedef {Object} Pickup - Объект "еды", которую можно подбирать или "есть"
 * @property {'pacdot' | 'powerPellet'} type - тип еды
 * @property {Point} position - положение объекта на карте
 * @property {boolean} taken - флаг, был ли объект поднят или "съеден"
 *
 * @typedef {Object} Pacman - Объект пакмана
 * @property {'pacman'} type - тип пакман
 * @property {Point} position - положение пакмана на карте
 *
 * @typedef {Object} Ghost - Объект призрака
 * @property {'ghost'} type - тип призрака
 * @property {Point} position - положение призрака на карте
 *
 * @typedef {Pickup | Pacman | Ghost} Entity - одна из игровых сущностей
 *
 * @param {Entity[]} entities - Массив сущностей на игровой карте
 * @param {string[][]} maze - Начальное состояние игрового лабиринта, где каждое значение это:
 * - 'X' — стена лабиринта
 * - 'o' — еда или "точки", за подбор которых начисляются очки
 * - ' ' — свободное пространство в лабиринте
 * @return {'up' | 'down' | 'left' | 'right'} направление, в которое надо пойти пакману
 */

const Direction = {
    Right: 'right',
    Left: 'left',
    Down: 'down',
    Up: 'up',
}

let firstCall = true;
let stepByStepPath = [];
let mapEntities = [[]];

function pacmanDirectionHandler(entities, maze) {
    let pacman = entities[0];
    if (firstCall) {
        initEntitiesMap(maze, entities);
        firstCall = false;
    }
    updateEntitiesMap(entities);

    if (stepByStepPath.length !== 0) {
        return makeStep(maze, pacman.position);
    } else {
        stepByStepPath = getPathToFood(maze, pacman.position, entities);
        return makeStep(maze, pacman.position);
    }
}

function initEntitiesMap(maze, entities) {
    let map = new Array(maze.length)
    for (let i = 0; i < map.length; i++) {
        map[i] = [];
    }
    mapEntities = map;
    updateEntitiesMap(entities);
}

function updateEntitiesMap(entities) {
    entities.forEach(entity => {
        mapEntities[entity.position.y][entity.position.x] = entity;
    })
}

function makeStep(maze, pacmanPosition) {
    return getDirectionToFood(maze, pacmanPosition, stepByStepPath.pop());
}

function getNeighbors(maze, position) {
    const neighbor = [];
    for (let x = -1; x < 2; x++) {
        if (x === 0 || position.x + x < 0 || position.x + x >= maze[0].length) continue;
        if (maze[position.y][position.x + x] === 'o') {
            neighbor.push({x: position.x + x, y: position.y});
        }
    }
    for (let y = -1; y < 2; y++) {
        if (y === 0 || position.y + y < 0 || position.y + y >= maze.length) continue;
        if (maze[position.y + y][position.x] === 'o') {
            neighbor.push({x: position.x, y: position.y + y});
        }
    }
    return neighbor.slice();
}

function getPathToFood(maze, playerPosition) {
    let frontier = [];
    frontier.push(playerPosition);
    let came_from = new Map();
    came_from.set(playerPosition, null);

    while (frontier.length !== 0) {
        let current = frontier.shift();
        if (mapEntities[current.y][current.x] && mapEntities[current.y][current.x].type === 'pacdot' && !mapEntities[current.y][current.x].taken) {
            if (current.x !== playerPosition.x || current.y !== playerPosition.y) {
                came_from.set('goat', current)
                break;
            }
        }
        
        let neighbors = getNeighbors(maze, current)
        for (let next of neighbors) {
            if (!hasKey(came_from, next)) {
                frontier.push(next);
                came_from.set(next, current);
            }
        }
    }
    return getStepByStep(came_from);
}

function getStepByStep(came_from) {
    let stepByStep = [];
    stepByStep.push(came_from.get('goat'));
    while (true) {
        if (came_from.get(stepByStep[stepByStep.length - 1]) == null) {
            stepByStep.pop();
            break;
        }
        stepByStep.push(came_from.get(stepByStep[stepByStep.length - 1]))
    }
    return stepByStep;
}


function getDirectionToFood(maze, positionPlayer, positionFood) {
    if (positionFood){
        if (positionFood.x > positionPlayer.x) {
            return Direction.Right;
        }
        if (positionFood.x < positionPlayer.x) {
            return Direction.Left;
        } else {
            if (positionFood.y > positionPlayer.y) {
                return Direction.Down;
            }
            if (positionFood.y < positionPlayer.y) {
                return Direction.Up;
            }
        }
    }
    return Direction.Right;
}

function hasKey(map, obj){
    for (let key of map.keys()){
        if (obj.x === key.x && obj.y === key.y){
            return true;
        }
    }
    return false;
}

export default pacmanDirectionHandler;
