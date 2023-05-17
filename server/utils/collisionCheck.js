export function collisionCheck({player,wall}){
    const padding = wall.width - player.radius - 0.2
    return(
        player.position.z - player.radius + player.velocity.z <= wall.position.z + wall.depth / 2 + padding 
        && player.position.x + player.radius + player.velocity.x >= wall.position.x - padding - wall.width / 2
        && player.position.z + player.radius + player.velocity.z >= wall.position.z - padding - wall.depth / 2
        && player.position.x - player.radius + player.velocity.x <= wall.position.x + wall.width / 2 + padding
    )
}