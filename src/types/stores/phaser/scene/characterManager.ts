import type Character from '../character/character';
import type Scene from './scene';

interface Spectating {
    findNewCharacter: any;
    onBeginSpectating: any;
    onEndSpectating: any;
    setShuffle: any;
}

export default interface CharacterManager {
    addCharacter: any;
    // complex
    characterContainer: any;
    characters: Map<string, Character>;
    cullCharacters: any;
    removeCharacter: any;
    scene: Scene;
    spectating: Spectating;
    update: any;
}