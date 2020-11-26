import { Accent, Brackets } from './../../notation-service/symbol/attached-object';
import { StaffNote, HalfBarline } from './../../notation-service/staff/staff';
import { MelodyService } from '../melody.service';
import { Note } from '../../notation-service/symbol/symbol';

type testResult = ReturnType<MelodyService['parseMelody']>;

export const parseMelodyTest: { testString: string, result: testResult } = {
  testString: 'd f#_ b0 eb *f goo (e) =',
  result: {
    errors: [
      { erroneousSymbol: 'goo', atIndex: 5 }
    ],
    result: [
      new StaffNote(new Note({ pitch: 'd1', duration: 'quarterNote' })),
      new StaffNote(new Note({ pitch: 'f#1', duration: 'brevis' })),
      new StaffNote(new Note({ pitch: 'b0', duration: 'quarterNote' })),
      new StaffNote(new Note({ pitch: 'eb1', duration: 'quarterNote' })),
      new StaffNote(new Note({ pitch: 'f1', duration: 'quarterNote'})).attachObject(new Accent()),
      new StaffNote(new Note({ pitch: 'e1', duration: 'quarterNote' })).attachObject(new Brackets()),
      new HalfBarline()
    ]
  }
};
