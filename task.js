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
let order = 0;
let mapEntities = [[]];

function pacmanDirectionHandler(entities, maze) {
    let pacman = entities[0];
    if (firstCall){
        initEntitiesMap(maze, entities);
        firstCall = false;
    }
    updateEntitiesMap(entities);
    //let positionFood = findFood(maze, pacman.position, entities);
    //let neighod = getNeighbors(maze, pacman.position);
    //let food = getPathToFood(maze, pacman.position);
    let dir;
    if (stepByStepPath.length !== 0){
        dir = makeStep(maze, pacman.position);
        return dir;
    }else{
        stepByStepPath = getPathToFood(maze, pacman.position, entities);
        dir = makeStep(maze, pacman.position);
        return dir;
    }
}

function initEntitiesMap(maze, entities){
    let map = new Array(maze.length)
    for (let i = 0; i < map.length; i++){
        map[i] = [];
    }
    mapEntities = map;
    updateEntitiesMap(entities);

    /*for (let x = 0; x < maze.length; x++){
        for (let y = 0; y < maze[0].length; y++){
            mapEntities[x][y] = {};
        }
    }*/
/*    let map = new Array(heightMaze)
    for (let i = 0; i < map.length; i++){
        map[i] = [];
    }
    entities.forEach(entity => {
        map[entity.position.y][entity.position.x] = entity;
    })
    mapEntities = map;*/
}

function updateEntitiesMap(entities){
    entities.forEach(entity => {
        mapEntities[entity.position.y][entity.position.x] = entity;
    })
}

function makeStep(maze, pacmanPosition){
    let ll = getDirectionToFood(maze, pacmanPosition, stepByStepPath.pop());
    return ll;
}

function getNeighbors(maze, position){
    const neighbor = [];
    for (let x = -1; x < 2; x++){
        if (maze[position.y][position.x + x] === 'o'){ //maze[position.y][position.x + x] === 'o' || maze[position.y][position.x + x] === ' '
            neighbor.push({x: position.x + x, y: position.y});
        }
    }
    for (let y = -1; y < 2; y++){
        if (maze[position.y + y][position.x] === 'o'){  //maze[position.y + y][position.x] === 'o' || maze[position.y + y][position.x] === ' '
            neighbor.push({x: position.x, y: position.y + y});
        }
    }
    return neighbor.slice();
}

function getPathToFood(maze, playerPosition, entities){
    let frontier = [];
    frontier.push(playerPosition);
    let came_from = new Map();
    came_from.set(playerPosition, null);

    while (frontier.length !== 0){
        let current = frontier.shift();
        if (mapEntities[current.y][current.x] && mapEntities[current.y][current.x].type === 'pacdot' && !mapEntities[current.y][current.x].taken)
        {
            if (current.x !== playerPosition.x || current.y !== playerPosition.y){
                came_from.set('goat', current)
                break;
            }
        }

        for (let next of getNeighbors(maze, current)){
            if (!came_from.has(next)){
                frontier.push(next);
                came_from.set(next, current);
            }
        }
    }
    let lll = getStepByStep(came_from);
    return lll;
}

function getStepByStep(came_from){
    let stepByStep = [];
    stepByStep.push(came_from.get('goat'));
    while (true){
        if (came_from.get(stepByStep[stepByStep.length - 1]) == null){
            stepByStep.pop();
            break;
        }
        stepByStep.push(came_from.get(stepByStep[stepByStep.length - 1]))
    }
    return stepByStep;
}





function findFood(maze, position, entities){
    const playerX = position.x;
    const playerY = position.y;
    for (let i = 1; i < maze.length; i++){
        for (let x = -1; x < i; x++) {
            for (let y = -1; y < i; y++) {
                if (maze[playerY + y][playerX + x] === 'o' && !getStatusFood(entities, {x: playerX + x, y: playerY + y})) {
                    return {x: playerX + x, y: playerY + y};
                }
            }
        }
    }
}

function getStatusFood(entities, position){
    for (let i = 0; i < entities.length; i++){
        if (entities[i].position.x === position.x && entities[i].position.y === position.y && entities[i].type === 'pacdot'){
            return entities[i].taken;
        }
    }
    /*return entities.forEach((entity) =>
    {
        if (entity.position === position){
            return entity.taken;
        }
    })*/
}

function getDirectionToFood(maze, positionPlayer, positionFood){
    if (positionFood.x > positionPlayer.x){
        return Direction.Right;
    }
    if (positionFood.x < positionPlayer.x){
        return Direction.Left;
    }
    else{
        if (positionFood.y > positionPlayer.y){
            return Direction.Down;
        }
        if (positionFood.y < positionPlayer.y){
            return Direction.Up;
        }
    }
    return Direction.Down;
}




export default pacmanDirectionHandler;
