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

/*    let runEnem = runFromEnemies(pacman.position, maze);
    if (runEnem){
        stepByStepPath = [];
        return  runEnem;
    }*/
    /*if (scanNearEnemy(pacman.position, maze)){
        stepByStepPath = [];
        return scanNearEnemy(pacman.position, maze);
    }*/

    if (stepByStepPath.length !== 0) {
        return makeStep(maze, pacman.position);
    } else {
        stepByStepPath = getPathToFood(maze, pacman.position, entities);
        return makeStep(maze, pacman.position);
    }
}
/*ДАЖЕ НЕ ЧС А ТАК ЧТОБЫ ЕСЛИ ОНО НА ПУТИ(алгоритма поиска пути) ПОПАДАЕТСЯ, ТО СРАЗУ БРОСАТЬ
РЕШИТЬ С ПОМОЩЬЮ ЧЕРНОГО СПИСКА ТИПА ЕСЛИ НА ПУТИ ВРАГ, ТО ТУ ПЕЧЕНЬКУ В ЧЕРНЫЙ СПИСОК И ИСКАТЬ НОВУЮ И ТАК ПО КРУГУ
НЕ ЗАБЫТЬ ПРО СЛУЧАЙ, КОГДА ЗАПЕРТ С ДВУХ СТОРОН
ЕСЛИ ЗАКРЫТЫ, ТО ОТПРАВЛЯЙ НА СТАРЫЙ АЛГОРИТМ, ОН РАБОТАЕТ*/
function initEntitiesMap(maze, entities) {
    let map = new Array(maze.length)
    for (let i = 0; i < map.length; i++) {
        map[i] = [];
    }
    mapEntities = map;
    updateEntitiesMap(entities);
}

function updateEntitiesMap(entities) {
    for (let i = entities.length - 1; i >= 0; i--){
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
        }else {
            if (maze[position.y][(position.x + x) % maze[0].length] === 'o') {
                neighbor.push({x: (position.x + x) % maze[0].length, y: position.y});
            }
        }
    }
    for (let y = -1; y < 2; y++) {
        if (y === 0) continue;

        if (position.y + y < 0){
            if (maze[maze.length + position.y + y][position.x] === 'o') {
                neighbor.push({x: position.x, y: maze.length + position.y + y});
            }
        }else {
            if (maze[(position.y + y) % maze.length][position.x] === 'o') {
                neighbor.push({x: position.x, y: (position.y + y) % maze.length});
            }
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
        if (mapEntities[current.y][current.x] && foodTypes.includes(mapEntities[current.y][current.x].type) && !mapEntities[current.y][current.x].taken) {
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
    if (positionFood) {
        if (Math.abs(positionFood.x - positionPlayer.x) === maze[0].length - 1){
            if (positionFood.x > positionPlayer.x) {
                return Direction.Left;
            }
            if (positionFood.x < positionPlayer.x) {
                return Direction.Right;
            }
        }
        if (positionFood.x > positionPlayer.x) {
            return Direction.Right;
        }
        if (positionFood.x < positionPlayer.x) {
            return Direction.Left;
        }

        if (Math.abs(positionFood.y - positionPlayer.y) === maze.length - 1){
            if (positionFood.y > positionPlayer.y) {
                return Direction.Up;
            }
            if (positionFood.y < positionPlayer.y) {
                return Direction.Down;
            }
        }
        if (positionFood.y > positionPlayer.y) {
            return Direction.Down;
        }
        if (positionFood.y < positionPlayer.y) {
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

//TODO rename this and store ALL enemy
function scanNearEnemy(positionPlayer, maze){
    for (let x = -2; x < 3; x++){
        for (let y = -2; y < 3; y++){
            if (mapEntities[positionPlayer.y + y]){
                if (positionPlayer.y + y >= mapEntities.length ||
                    positionPlayer.x + x >= mapEntities[positionPlayer.y + y ].length) continue;

                if (Math.abs(x) === 1 && Math.abs(y) === 1){
                    if (mapEntities[positionPlayer.y + y][positionPlayer.x + x] && mapEntities[positionPlayer.y + y][positionPlayer.x + x].type === 'ghost'){
                        return runFromEnemy(positionPlayer, {x: positionPlayer.x + x, y: positionPlayer.y + y}, maze)
                    }
                }
                else if (Math.abs(x) + Math.abs(y) === 2 && !hasWallBetween(positionPlayer, {x: positionPlayer.x + x, y: positionPlayer.y + y}, maze)){

                    if (mapEntities[positionPlayer.y + y][positionPlayer.x + x] && mapEntities[positionPlayer.y + y][positionPlayer.x + x].type === 'ghost'){
                        return runFromEnemy(positionPlayer, {x: positionPlayer.x + x, y: positionPlayer.y + y}, maze)
                    }
                }
            }

        }
    }
}

function hasWallBetween(playerPos, enemyPos, maze){
    let deltaX = (playerPos.x - enemyPos.x) / 2;
    let deltaY = (playerPos.y - enemyPos.y) / 2;
    if (deltaX !== 0 && maze[playerPos.y][playerPos.x + deltaX] === 'X'){
        return true;
    }
    if (deltaY !== 0 && maze[playerPos.y + deltaY][playerPos.x] === 'X'){
        return true;
    }
}

function runFromEnemy(playerPos, enemyPos, maze){
    let runVert = runVerticalFrom(playerPos, enemyPos, maze);
    let runHor = runHorizontalFrom(playerPos, enemyPos, maze);

    if (Math.abs(enemyPos.x - playerPos.x) === 2){
        if (runVert) return runVert;

        if (runHor) return runHor;
    } else if(Math.abs(enemyPos.y - playerPos.y) === 2){
        if (runHor) return runHor;

        if (runVert) return runVert;
    } else if(Math.abs(enemyPos.x - playerPos.x) === 1) {
        let deltaX = playerPos.x - enemyPos.x;
        let deltaY = playerPos.y - enemyPos.y;
        if (maze[playerPos.y + deltaY][playerPos.x] !== 'X'){
            if (deltaY > 0){
                return Direction.Down;
            }else{
                return Direction.Up;
            }
        }
        if (maze[playerPos.y][playerPos.x + deltaX] !== 'X'){
            if (deltaX > 0){
                return Direction.Right;
            }else{
                return Direction.Left;
            }
        }
    }
}

function runVerticalFrom(playerPos, enemyPos, maze){
    if (maze[playerPos.y + 1][playerPos.x] !== 'X' && playerPos.y >= enemyPos.y) return Direction.Down;

    if (maze[playerPos.y - 1][playerPos.x] !== 'X' && playerPos.y <= enemyPos.y) return Direction.Up;
}

function runHorizontalFrom(playerPos, enemyPos, maze){
    if (maze[playerPos.y][playerPos.x + 1] !== 'X' && playerPos.x >= enemyPos.x) return Direction.Right;

    if (maze[playerPos.y][playerPos.x - 1] !== 'X' && playerPos.x <= enemyPos.x) return Direction.Left;
}



function scanEnemy(playerPos, maze){
    let enemies = [];
    for (let x = -2; x < 3; x++){
        for (let y = -2; y < 3; y++){
            if (mapEntities[playerPos.y + y]){
                if (playerPos.y + y >= mapEntities.length ||
                    playerPos.x + x >= mapEntities[playerPos.y + y ].length) continue;

                if (Math.abs(x) === 1 && Math.abs(y) === 1){
                    if (mapEntities[playerPos.y + y][playerPos.x + x] && mapEntities[playerPos.y + y][playerPos.x + x].type === 'ghost'){
                        enemies.push({x: playerPos.x + x, y: playerPos.y + y});
                    }
                }
                else if (Math.abs(x) + Math.abs(y) === 2 && !hasWallBetween(playerPos, {x: playerPos.x + x, y: playerPos.y + y}, maze)){
                    if (mapEntities[playerPos.y + y][playerPos.x + x] && mapEntities[playerPos.y + y][playerPos.x + x].type === 'ghost'){
                        enemies.push({x: playerPos.x + x, y: playerPos.y + y});
                    }
                }
            }

        }
    }
    return enemies;
}

function runFromEnemies(playerPos, maze){
    let enemies = scanEnemy(playerPos, maze);
    let availableDirect = [];
    for (let i = 0; i < enemies.length; i++){
        let deltaX = playerPos.x - enemies[i].x;
        let deltaY = playerPos.y - enemies[i].y;

        if (deltaX > 0){
            if (maze[playerPos.y][playerPos.x + 1] !== 'X'){
                availableDirect.push(Direction.Right);
            }
        }
        if (deltaX < 0){
            if (maze[playerPos.y][playerPos.x - 1] !== 'X'){
                availableDirect.push(Direction.Left);
            }
        }
        if (deltaY > 0){
            if (maze[playerPos.y + 1][playerPos.x] !== 'X'){
                availableDirect.push(Direction.Down);
            }
        }
        if (deltaY < 0){
            if (maze[playerPos.y - 1][playerPos.x] !== 'X'){
                availableDirect.push(Direction.Up);
            }
        }
    }
    return availableDirect.pop();

}

function getAvailableDirections(playerPos, maze){
    let directions = [];
    if (maze[playerPos.y + 1][playerPos.x] !== 'X'){
        directions.push(Direction.Down);
    }
    if (maze[playerPos.y - 1][playerPos.x] !== 'X'){
        directions.push(Direction.Up);
    }
    if (maze[playerPos.y][playerPos.x + 1] !== 'X'){
        directions.push(Direction.Right);
    }
    if (maze[playerPos.y][playerPos.x - 1] !== 'X'){
        directions.push(Direction.Left);
    }
    return directions;
}




export default pacmanDirectionHandler;



