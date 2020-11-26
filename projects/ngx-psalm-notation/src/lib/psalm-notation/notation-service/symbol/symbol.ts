import { parsePitch } from './note-pitch';

type symbolType = 'note' | 'halfBarline';
type noteDuration = 'quarterNote' | 'brevis';
interface NoteOptions {
  duration: noteDuration;
  pitch: string;
}


interface SymbolConstructorOptions {
  type: symbolType;
}

export class NotationSymbol {

  type: symbolType;

  constructor(options: SymbolConstructorOptions) {
    this.type = options.type;
  }

}

export class HalfBarline extends NotationSymbol {
  constructor() {
    super({ type: 'halfBarline' });
  }
}

export class Note extends NotationSymbol {

  duration: noteDuration;
  pitch: string;
  hasBrackets: boolean;

  constructor(noteOptions: NoteOptions) {
    if (!parsePitch(noteOptions.pitch).isValid) {
      throw new Error('Unable to parse pitch: ' + noteOptions.pitch);
    }
    super({ type: 'note'});
    this.duration = noteOptions.duration;
    this.pitch = noteOptions.pitch;
    this.hasBrackets = false;
  }

  addBrackets(): Note {
    this.hasBrackets = true;
    return this;
  }
}

export class BreveNote extends Note {
  constructor(pitch: string) {
    super({ pitch, duration: 'brevis' });
  }
}
