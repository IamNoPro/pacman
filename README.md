# Pac-Man game

### 1. Creation of game and joining

In order to create a game one of the users should create a party
with unique secret code (#####), pressing button __Create New Game__. Others join the
game entering the secret code.
```
![ScreenShot](https://raw.githubusercontent.com/IamNoPro/pacman/main/public/screenshots/game_creation.png)
![Game code](https://raw.githubusercontent.com/IamNoPro/pacman/main/public/screenshots/game_code.png)
```
### 2. Game start point - __(Pac-Mans, NLO, Ghosts)__

As game starts, all four __Pac-mans__ are spawned with single __Ghost__. __NLO__ will fly around
and wait until one of the __Pac-mans__ will be caught by __Ghost__.
```
![Game creation](https://raw.githubusercontent.com/IamNoPro/pacman/main/public/screenshots/game_start.png)
```
### 3. Win condition

Win point is reached when last __Pac-man__ is left. Last __Pac-man__ is the winner.
```
![Game creation](https://raw.githubusercontent.com/IamNoPro/pacman/main/public/screenshots/pacman_win.png)
```
### 4. Transformation to __Ghost__, new objective 

Upon the death, __NLO__ arrives kidnapping your body and dropping back new __Ghost__. 
At this point Player has new objective, catch all left __Pac-mans__.
```
![Game creation](https://raw.githubusercontent.com/IamNoPro/pacman/main/public/screenshots/pacman_eaten.png)
![Game code](https://raw.githubusercontent.com/IamNoPro/pacman/main/public/screenshots/pacman_revive.png)
```
### 6. Pac-Man to Pac-Man collision
```
![Game creation]https://raw.githubusercontent.com/IamNoPro/pacman/main/public/screenshots/pacman_collision.png)
```
In case of collision to friendly __Pac-man's__, both of Players are stunned for 5 seconds.
It's a good advantage for ghosts to catch __Pac-man's__ at this point.
