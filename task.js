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
function pacmanDirectionHandler(entities, maze) {
    let positionFood = findFood(maze, entities[0].position, entities)
    let direction = getDirectionToFood(maze, entities[0].position, positionFood)
    return direction;
}

function findFood(maze, position, entities){
    const playerX = position.x;
    const playerY = position.y;
    for (let i = 1; i < maze.length / 2; i++){
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
        return 'right';
    }
    if (positionFood.x < positionPlayer.x){
        return 'left';
    }
    else{
        if (positionFood.y > positionPlayer.y){
            return 'down';
        }
        if (positionFood.y < positionPlayer.y){
            return 'up';
        }
    }
    return 'right';
}




export default pacmanDirectionHandler;
