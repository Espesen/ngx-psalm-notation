
export enum ATTACHED_OBJECT_TYPE {
  accidental,
  accent,
  brackets,
  lyrics
}

/**
 * Base class for object that is attached to a note: accidental, accent, etc.
 */
export class AttachedObject {
  constructor(public attachedObjectType: ATTACHED_OBJECT_TYPE) {}
}

export class Accidental extends AttachedObject {

  constructor(public modifier: 'sharp' | 'flat') {
    super(ATTACHED_OBJECT_TYPE.accidental);
  }
}

export class Accent extends AttachedObject {
  constructor() {
    super(ATTACHED_OBJECT_TYPE.accent);
  }
}

export class Brackets extends AttachedObject {
  constructor() {
    super(ATTACHED_OBJECT_TYPE.brackets);
  }
}

export class LyricsObject extends AttachedObject {
  constructor(public text: string) {
    super(ATTACHED_OBJECT_TYPE.lyrics);
  }
}
