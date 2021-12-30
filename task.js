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
const foodTypes = ['pacdot', 'powerPellet']

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
    for (let i = entities.length - 1; i >= 0; i--) {
        let entity = entities[i];
        mapEntities[entity.position.y][entity.position.x] = entity;
    }
}

function makeStep(maze, pacmanPosition) {
    return getDirectionToFood(maze, pacmanPosition, stepByStepPath.pop());
}

function getNeighbors(maze, position) {
    const neighbor = [];

    for (let x = -1; x < 2; x++) {
        if (x === 0) continue;

        if (position.x + x < 0) {
            if (maze[position.y][maze[0].length + position.x + x] === 'o') {
                neighbor.push({x: maze[0].length + position.x + x, y: position.y});
            }
        } else {
            if (maze[position.y][(position.x + x) % maze[0].length] === 'o') {
                neighbor.push({x: (position.x + x) % maze[0].length, y: position.y});
            }
        }
    }
    for (let y = -1; y < 2; y++) {
        if (y === 0) continue;

        if (position.y + y < 0) {
            if (maze[maze.length + position.y + y][position.x] === 'o') {
                neighbor.push({x: position.x, y: maze.length + position.y + y});
            }
        } else {
            if (maze[(position.y + y) % maze.length][position.x] === 'o') {
                neighbor.push({x: position.x, y: (position.y + y) % maze.length});
            }
        }
    }
    return neighbor;
}

function getPathToFood(maze, pacmanPosition) {
    let frontier = [];
    frontier.push(pacmanPosition);
    let came_from = new Map();
    came_from.set(pacmanPosition, null);

    while (frontier.length !== 0) {
        let current = frontier.shift();
        if (mapEntities[current.y][current.x] && foodTypes.includes(mapEntities[current.y][current.x].type) && !mapEntities[current.y][current.x].taken) {
            if (current.x !== pacmanPosition.x || current.y !== pacmanPosition.y) {
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


function getDirectionToFood(maze, pacmanPosition, foodPosition) {
    if (foodPosition) {
        if (Math.abs(foodPosition.x - pacmanPosition.x) === maze[0].length - 1) {
            if (foodPosition.x > pacmanPosition.x) {
                return Direction.Left;
            }
            if (foodPosition.x < pacmanPosition.x) {
                return Direction.Right;
            }
        }
        if (foodPosition.x > pacmanPosition.x) {
            return Direction.Right;
        }
        if (foodPosition.x < pacmanPosition.x) {
            return Direction.Left;
        }

        if (Math.abs(foodPosition.y - pacmanPosition.y) === maze.length - 1) {
            if (foodPosition.y > pacmanPosition.y) {
                return Direction.Up;
            }
            if (foodPosition.y < pacmanPosition.y) {
                return Direction.Down;
            }
        }
        if (foodPosition.y > pacmanPosition.y) {
            return Direction.Down;
        }
        if (foodPosition.y < pacmanPosition.y) {
            return Direction.Up;
        }

    }
    return Direction.Right;
}

function hasKey(map, obj) {
    for (let key of map.keys()) {
        if (obj.x === key.x && obj.y === key.y) {
            return true;
        }
    }
    return false;
}


export default pacmanDirectionHandler;



