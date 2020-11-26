import { erroneousMelodies } from './../../melody-service/test/analyze-melody-expectations';

export const nicePsalmLyrics = [
  'Herra on minun paimeneni, = ei minulta mitään puutu',
  'Tämä on säeparin ensimmäinen säe = ja tämä sitten se toinen'
];


type melodyErrorExpectation = { melodyString: string, expectedError: string};
export const melodyErrorExpectations: melodyErrorExpectation[] = erroneousMelodies
  .map(foolishMelody => ({
    melodyString: foolishMelody.melodyString,
    expectedError: foolishMelody.expecteErrors[0].message
  }));

type renderedExpectation = {
  lyrics: string,
  melody: string,
  expectedResult: {
    firstLine: string,
    secondLine: string
  }
};

export const successfulRenderPsalmExpectations: renderedExpectation[] = [
  {
    lyrics: nicePsalmLyrics[0],
    melody: 'f g a_ *b a = a_ g *a f',
    expectedResult: {
      firstLine: 'f1 Her- g1 ra a1 on_minun_paime- b1 ne- a1 ni,',
      secondLine: 'a1 ei_minulta_mi- g1 tään a1 puu- f1 tu'
    }
  },
  {
    lyrics: nicePsalmLyrics[0],
    melody: 'f g a_ *b a a = a_ g *a f f',
    expectedResult: {
      firstLine: 'f1 Her- g1 ra a1 on_minun_paime- b1 ne- a1 ni,',
      secondLine: 'a1 ei_minulta_mi- g1 tään a1 puu- f1 tu'
    }
  },
  {
    lyrics: 'Silloin koko maa on hänen = ja ylistää koko maa',
    melody: 'f g a_ *b a *g a = a_ g *a f',
    expectedResult: {
      firstLine: 'f1 Sil- g1 loin a1 koko b1 maa a1 on g1 hä- a1 nen',
      secondLine: 'a1 ja_ylis- g1 tää a1 ko- f1 ko f1 maa'
    }
  }

];
