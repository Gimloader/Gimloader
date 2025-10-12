import type Character from './character/character';
import type Scene from './scene/scene';

export default interface Phaser {
    mainCharacter: Character;
    mainCharacterTeleported: boolean;
    scene: Scene;
}