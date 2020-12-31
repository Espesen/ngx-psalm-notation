export const validMelodies: string[] = [
  'f g a_ *b (a) a *g (g) a = a_ g a *f d',
  'e g a_ *c2 (c2) h *g (a) a = g a_ h *g (e) e'
];

type expectedError = {
  atIndex: number,
  message: string
};

export const erroneousMelodies: { melodyString: string, expecteErrors: expectedError[] }[] = [
  {
    melodyString: 'f g a',
    expecteErrors: [
      { atIndex: 0, message: 'Psalmimelodiassa tulee olla kaksi säettä' }
    ]
  },
  {
    melodyString: 'f g a_ *g a = a_ g_ *a f',
    expecteErrors: [
      { atIndex: 7, message: 'Kummassakin säkeessä tulee olla täsmälleen yksi resitointisävel'}
    ]
  },
  {
    melodyString: 'f g a_ *b a = g *f e',
    expecteErrors: [
      { atIndex: 8, message: 'Kummassakin säkeessä tulee olla täsmälleen yksi resitointisävel'}
    ]
  },
  {
    melodyString: 'f g a *g a = a_ g *a f',
    expecteErrors: [
      { atIndex: 5, message: 'Kummassakin säkeessä tulee olla täsmälleen yksi resitointisävel'}
    ]
  },
  {
    melodyString: 'f g a_ g a = a_ g *a f',
    expecteErrors: [
      { atIndex: 2, message: 'Resitointisävelen jälkeen on oltava vähintään yksi painollinen sävel'}
    ]
  },
  {
    melodyString: 'f g a_ *g a = a_ g a f',
    expecteErrors: [
      { atIndex: 6, message: 'Resitointisävelen jälkeen on oltava vähintään yksi painollinen sävel'}
    ]
  },
  {
    melodyString: 'f g a_ *g = a_ g *a f',
    expecteErrors: [
      { atIndex: 3, message: 'Painollinen sävel ei voi olla säkeessä viimeisenä'}
    ]
  },
  {
    melodyString: 'f g a_ *g a = a_ g a *f',
    expecteErrors: [
      { atIndex: 9, message: 'Painollinen sävel ei voi olla säkeessä viimeisenä'}
    ]
  },
  {
    melodyString: 'f g a_ *g *a g = a_ g *a f',
    expecteErrors: [
      { atIndex: 3, message: 'Painollisten sävelten välissä on oltava 1-2 painotonta säveltä'}
    ]
  },
  {
    melodyString: 'f g a_ *g a = a_ g a *f g g g *e g',
    expecteErrors: [
      { atIndex: 9, message: 'Painollisten sävelten välissä on oltava 1-2 painotonta säveltä'}
    ]
  },
  {
    melodyString: validMelodies[0] + 'foo',
    expecteErrors: [
      { atIndex: validMelodies[0].split(' ').length - 1, message: 'Melodiassa on väärin kirjoitettuja nuotteja'}
    ]
  }
];

type psalmLine = {
  initium: string,
  tenor: string,
  extraNotes: string,
  terminalGroups: string[]
};

type expectedAnalysis = {
  firstLine: psalmLine,
  secondLine: psalmLine
};

export const melodyAnalysisExpectations: { melodyString: string, expectedResult: expectedAnalysis }[] = [
  {
    melodyString: 'f g a_ *b a *g a = a_ g *a g *f d',
    expectedResult: {
      firstLine: {
        initium: 'f1 g1',
        extraNotes: '',
        tenor: 'a1',
        terminalGroups: ['b1 a1', 'g1 a1']
      },
      secondLine: {
        initium: '',
        tenor: 'a1',
        extraNotes: 'g1',
        terminalGroups: ['a1 g1', 'f1 d1']
      }
    }
  },
  {
    melodyString: 'e g a_ g h *c2 (h) h *c2 a = a_ h *g (e) e',
    expectedResult: {
      firstLine: {
        initium: 'e1 g1',
        tenor: 'a1',
        extraNotes: 'g1 h1',
        terminalGroups: [ 'c2 (h1) h1', 'c2 a1' ]
      },
      secondLine: {
        initium: '',
        tenor: 'a1',
        extraNotes: 'h1',
        terminalGroups: [ 'g1 (e1) e1' ]
      }
    }
  }
];
