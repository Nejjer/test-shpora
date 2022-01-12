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

let countCall = 0;
let stepByStepPath = [];
let mapEntities = [[]];
const foodTypes = ['pacdot', 'powerPellet']
const ghost = 'ghost';
let blackList = [];
let enemies = [];
let startPacmanPos;

function pacmanDirectionHandler(entities, maze) {
    countCall++;
    let pacman = entities[0];
    if (countCall === 1) {
        startPacmanPos = pacman.position;
        initEnemyList(entities);
        initEntitiesMap(maze, entities);
    }else if(countCall === 2){
        setEnemiesVelocity(entities);
    }
    updateEntitiesMap(entities);
    if (findEnemy(pacman.position, maze)){
        stepByStepPath = [];
    }


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
    let map = new Array(mapEntities.length)
    for (let i = 0; i < map.length; i++) {
        map[i] = [];
    }
    mapEntities = map;

    for (let i = entities.length - 1; i >= 0; i--) {
        let entity = entities[i];
        if (entity.type === ghost){
            if (enemies[i - 1] && enemies[i - 1].velocity){
                entity.velocity = enemies[i - 1].velocity
            }else{
                entity.velocity = 1;
            }
        }
        mapEntities[entity.position.y][entity.position.x] = entity;
    }
}

function initEnemyList(entities) {
    for (let i = 1; i < entities.length; i++){
        if (entities[i].type === ghost){
            enemies[i-1] = entities[i];
        }else{
            break;
        }
    }
}

function setEnemiesVelocity(entities) {
    for (let i = 0; i < enemies.length; i++){
        let deltaX = Math.abs(entities[i+1].position.x - enemies[i].position.x);
        let deltaY = Math.abs(entities[i+1].position.y - enemies[i].position.y);
        enemies[i].velocity = deltaX !== 0 ? deltaX : deltaY;
    }
}

function makeStep(maze, pacmanPosition) {
    return getDirectionToFood(maze, pacmanPosition, stepByStepPath.pop());
}

function getNeighbors(maze, position) {
    const neighbor = [];

    for (let x = -1; x < 2; x++) {
        if (x === 0) continue;

        if (!hasPosition(blackList, {x: (position.x + x) % maze[0].length, y: position.y})){
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

    }
    for (let y = -1; y < 2; y++) {
        if (y === 0) continue;

        if (!hasPosition(blackList, {x: position.x, y: (position.y + y) % maze.length})) {
            if (position.y + y < 0) {
                if (maze[maze.length + position.y + y][position.x] === 'o' || maze[maze.length + position.y + y][position.x] === ' ') {
                    neighbor.push({x: position.x, y: maze.length + position.y + y});
                }
            } else {
                if (maze[(position.y + y) % maze.length][position.x] === 'o' || maze[(position.y + y) % maze.length][position.x] === ' ') {
                    neighbor.push({x: position.x, y: (position.y + y) % maze.length});
                }
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
        if (mapEntities[current.y][current.x] &&
            foodTypes.includes(mapEntities[current.y][current.x].type) &&
            !mapEntities[current.y][current.x].taken) {
            if (current.x !== pacmanPosition.x || current.y !== pacmanPosition.y) {
                came_from.set('goat', current);
                break;
            }
        }

        let neighbors = getNeighbors(maze, current);
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
    return getAbleDirectionToMove(maze, pacmanPosition);
}

function getAbleDirectionToMove(maze, pacmanPosition) {
    let ablePlaces = getNeighbors(maze, pacmanPosition);
    if (ablePlaces.length !== 0){
        return getDirectionToFood(maze, pacmanPosition, ablePlaces[0]);
    }
    return scipTurn(maze, pacmanPosition);
}

function scipTurn(maze, pacmanPosition){
    if (maze[pacmanPosition.y + 1][pacmanPosition.x] === 'X'){
        return Direction.Down;
    }
    if (maze[pacmanPosition.y - 1][pacmanPosition.x] === 'X'){
        return Direction.Up;
    }
    if (maze[pacmanPosition.y][pacmanPosition.x + 1] === 'X'){
        return Direction.Right;
    }
    if (maze[pacmanPosition.y][pacmanPosition.x - 1] === 'X'){
        return Direction.Left;
    }

}

function hasKey(map, obj) {
    for (let key of map.keys()) {
        if (obj.x === key.x && obj.y === key.y) {
            return true;
        }
    }
    return false;
}

function hasPosition(arr, position){
    let has = false;
    arr.forEach(pos => {
        if (pos.x === position.x && pos.y === position.y){
            has = true;
        }
    })
    return has;
}

function findEnemy(pacmanPosition, maze){
    return f(pacmanPosition, maze);
    blackList = [];
    let foundEnemy = false;
    for (let x = -3; x < 4; x++){
        for (let y = -3; y < 4; y++){
            if (mapEntities[pacmanPosition.y + y]){
                if (pacmanPosition.y + y >= mapEntities.length ||
                    pacmanPosition.x + x >= mapEntities[pacmanPosition.y + y ].length) continue;

                if (Math.abs(x) === 1 && Math.abs(y) === 1){
                    if (mapEntities[pacmanPosition.y + y][pacmanPosition.x + x] && mapEntities[pacmanPosition.y + y][pacmanPosition.x + x].type === ghost){
                        blackList.push({x: pacmanPosition.x, y: pacmanPosition.y + y});
                        blackList.push({x: pacmanPosition.x + x, y: pacmanPosition.y});
                        foundEnemy = true;
                    }
                }
                else if (Math.abs(x) + Math.abs(y) === 2 && !hasWallBetween(pacmanPosition, {x: pacmanPosition.x + x, y: pacmanPosition.y + y}, maze)){

                    if (mapEntities[pacmanPosition.y + y][pacmanPosition.x + x] && mapEntities[pacmanPosition.y + y][pacmanPosition.x + x].type === ghost){
                        //blackList.push({x: pacmanPosition.x + x / 2, y: pacmanPosition.y + y / 2});
                        let deltaX = x !== 0 ? x / Math.abs(x) : 0;
                        let deltaY = y !== 0 ? y / Math.abs(y) : 0;
                        let velocity = mapEntities[pacmanPosition.y + y][pacmanPosition.x + x].velocity;
                        blackList.push({x: pacmanPosition.x + x - velocity * deltaX, y: pacmanPosition.y + y - velocity * deltaY});
                        foundEnemy = true;
                    }
                }
            }
        }
    }
    return foundEnemy;
}

function hasWallBetween(playerPos, enemyPos, maze){
    let deltaX = (enemyPos.x - playerPos.x) / 2;
    let deltaY = (enemyPos.y - playerPos.y) / 2;
    if (deltaX !== 0 && maze[playerPos.y][playerPos.x + deltaX] === 'X'){
        return true;
    }
    if (deltaY !== 0 && maze[playerPos.y + deltaY][playerPos.x] === 'X'){
        return true;
    }
    return false;
}

//TODO Сделать так, чтобы враги искались и через край,
//TODO исправить баг, который даже повторился
function f(pacmanPosition, maze){
    let foundEnemy = false;

    blackList = [];
    for (let x = -3; x < 4; x++){
        for (let y = -3; y < 4; y++){
            if (mapEntities[pacmanPosition.y + y]){
                if (pacmanPosition.y + y >= mapEntities.length ||
                    pacmanPosition.x + x >= mapEntities[pacmanPosition.y + y ].length) continue;

                if (mapEntities[pacmanPosition.y + y][pacmanPosition.x + x] && mapEntities[pacmanPosition.y + y][pacmanPosition.x + x].type === ghost){
                    foundEnemy = true;
/*                    let v = mapEntities[pacmanPosition.y + y][pacmanPosition.x + x].velocity;
                    let enemyX = pacmanPosition.x + x;
                    let enemyY = pacmanPosition.y + y;
                    blackList.push({x: enemyX, y: enemyY - v});
                    blackList.push({x: enemyX, y: enemyY + v});
                    blackList.push({x: enemyX - v, y: enemyY});
                    blackList.push({x: enemyX + v, y: enemyY});*/
                }

            }
        }
    }
    findGhosts(pacmanPosition);
    return foundEnemy;
}


function findGhosts(pacmanPosition){
    blackList = [];
    for (let x = -3; x < 4; x++){
        if (x === 0 || pacmanPosition.x + x >= mapEntities[pacmanPosition.y].length || pacmanPosition.x + x < 0) continue;
        if (mapEntities[pacmanPosition.y][pacmanPosition.x + x] && mapEntities[pacmanPosition.y][pacmanPosition.x + x].type === ghost){
            let direction = x / Math.abs(x);
            let ghost = mapEntities[pacmanPosition.y][pacmanPosition.x + x];
            blackList.push({x: ghost.position.x - direction * ghost.velocity , y: pacmanPosition.y});
        }
    }
    for (let y = -3; y < 4; y++){
        if (y === 0 || pacmanPosition.y + y >= mapEntities.length || pacmanPosition.y + y < 0) continue;

        if (mapEntities[pacmanPosition.y + y][pacmanPosition.x] && mapEntities[pacmanPosition.y + y][pacmanPosition.x].type === ghost){
            let direction = y / Math.abs(y);
            let ghost = mapEntities[pacmanPosition.y + y][pacmanPosition.x];
            blackList.push({x: pacmanPosition.x, y: ghost.position.y - direction * ghost.velocity});
        }
    }

    for (let x = -1; x < 2; x++){
        for (let y = -1; y < 2; y++){
            if (mapEntities[pacmanPosition.y + y]){
            if (pacmanPosition.y + y >= mapEntities.length ||
                pacmanPosition.x + x >= mapEntities[pacmanPosition.y + y ].length) continue;

            if (Math.abs(x) === 1 && Math.abs(y) === 1){
                if (mapEntities[pacmanPosition.y + y][pacmanPosition.x + x] && mapEntities[pacmanPosition.y + y][pacmanPosition.x + x].type === ghost){
                    blackList.push({x: pacmanPosition.x, y: pacmanPosition.y + y});
                    blackList.push({x: pacmanPosition.x + x, y: pacmanPosition.y});
                }
            }
            }
        }
    }
}


export default pacmanDirectionHandler;



