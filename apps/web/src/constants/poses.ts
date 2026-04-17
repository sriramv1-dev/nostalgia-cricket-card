import { CharacterColors, LayeredCharacterSources } from '@/components/card/LayeredCharacter'

export interface PoseConfig {
  src: string
  label: string
  width: number
  height: number
  parts: (keyof CharacterColors)[]
  layers: LayeredCharacterSources
}

const BATTING_PARTS: (keyof CharacterColors)[] = ['cap', 'capAccent', 'bat', 'gloves', 'pads', 'shoes']
const SCOOP_PARTS:   (keyof CharacterColors)[] = ['cap', 'capAccent', 'bat', 'gloves', 'pads', 'shoes', 'ball']
const BOWLING_PARTS: (keyof CharacterColors)[] = ['cap', 'capAccent', 'ball', 'shoes']
const KEEPING_PARTS:  (keyof CharacterColors)[] = ['cap', 'capAccent', 'gloves', 'pads', 'shoes', 'ball', 'wickets']
const KEEPING2_PARTS: (keyof CharacterColors)[] = ['cap', 'capAccent', 'gloves', 'pads', 'shoes', 'wickets']

export const POSE_REGISTRY: PoseConfig[] = [
  {
    label: 'Keeping 1',
    src: '/images/card/keeping1/keeping1-body-base.png',
    width: 1760,
    height: 2410,
    parts: KEEPING_PARTS,
    layers: {
      base:       '/images/card/keeping1/keeping1-body-base.png',
      cap:        '/images/card/keeping1/keeping1-cap.png',
      capAccent:  '/images/card/keeping1/keeping1-cap-accent.png',
      gloves:     '/images/card/keeping1/keeping1-gloves.png',
      pads:       '/images/card/keeping1/keeping1-pads.png',
      shoes:      '/images/card/keeping1/keeping1-shoes.png',
      ball:       '/images/card/keeping1/keeping1-ball.png',
      wickets:    '/images/card/keeping1/keeping1-wickets.png',
    },
  },
  {
    label: 'Keeping 2',
    src: '/images/card/keeping2/keeping2-body.png',
    width: 730,
    height: 1000,
    parts: KEEPING2_PARTS,
    layers: {
      base:      '/images/card/keeping2/keeping2-body.png',
      cap:       '/images/card/keeping2/keeping2-cap.png',
      capAccent: '/images/card/keeping2/keeping2-cap-accent.png',
      gloves:    '/images/card/keeping2/keeping2-gloves.png',
      pads:      '/images/card/keeping2/keeping2-pads.png',
      shoes:     '/images/card/keeping2/keeping2-shoes.png',
      wickets:   '/images/card/keeping2/keeping2-wickets.png',
    },
  },
  {
    label: 'Scoop',
    src: '/images/card/scoop-shot/scoop-base.png',
    width: 880,
    height: 1205,
    parts: SCOOP_PARTS,
    layers: {
      base:       '/images/card/scoop-shot/scoop-base.png',
      cap:        '/images/card/scoop-shot/scoop-cap.png',
      capAccent:  '/images/card/scoop-shot/scoop-cap-accent.png',
      gloves:     '/images/card/scoop-shot/scoop-gloves.png',
      pads:       '/images/card/scoop-shot/scoop-pads.png',
      shoes:      '/images/card/scoop-shot/scoop-shoes.png',
      bat:        '/images/card/scoop-shot/scoop-bat.png',
      ball:       '/images/card/scoop-shot/scoop-ball.png',
    },
  },
  {
    label: 'Sweep Shot',
    src: '/images/card/sweep-shot/sweep-body.png',
    width: 1080,
    height: 1350,
    parts: BATTING_PARTS,
    layers: {
      base:       '/images/card/sweep-shot/sweep-body.png',
      cap:        '/images/card/sweep-shot/sweep-cap.png',
      capAccent:  '/images/card/sweep-shot/sweep-cap-accent.png',
      gloves:     '/images/card/sweep-shot/sweep-gloves.png',
      pads:       '/images/card/sweep-shot/sweep-pads.png',
      shoes:      '/images/card/sweep-shot/sweep-shoes.png',
      bat:        '/images/card/sweep-shot/sweep-bat.png',
    },
  },
  {
    label: 'Loft Shot',
    src: '/images/card/loft-shot/loft-body.png',
    width: 1080,
    height: 1350,
    parts: BATTING_PARTS,
    layers: {
      base:       '/images/card/loft-shot/loft-body.png',
      cap:        '/images/card/loft-shot/loft-cap.png',
      capAccent:  '/images/card/loft-shot/loft-cap-accent.png',
      gloves:     '/images/card/loft-shot/loft-gloves.png',
      pads:       '/images/card/loft-shot/loft-pads.png',
      shoes:      '/images/card/loft-shot/loft-shoes.png',
      bat:        '/images/card/loft-shot/loft-bat-body.png',
      batOutline: '/images/card/loft-shot/loft-bat-outline.png',
    },
  },
  {
    label: 'Spin',
    src: '/images/card/spin-masks/spin-body.png',
    width: 1253,
    height: 1244,
    parts: BOWLING_PARTS,
    layers: {
      base:      '/images/card/spin-masks/spin-body.png',
      cap:       '/images/card/spin-masks/spin-cap.png',
      capAccent: '/images/card/spin-masks/spin-cap-accent.png',
      ball:      '/images/card/spin-masks/spin-ball.png',
      shoes:     '/images/card/spin-masks/spin-shoes.png',
    },
  },
  {
    label: 'Pace',
    src: '/images/card/pace-masks/pace-body.png',
    width: 1444,
    height: 1270,
    parts: BOWLING_PARTS,
    layers: {
      base:      '/images/card/pace-masks/pace-body.png',
      cap:       '/images/card/pace-masks/pace-cap.png',
      capAccent: '/images/card/pace-masks/pace-cap-accent.png',
      ball:      '/images/card/pace-masks/pace-ball.png',
      shoes:     '/images/card/pace-masks/pace-shoes.png',
    },
  },
  {
    label: 'Uppercut',
    src: '/images/card/uppercut-shot/uppercut-body.png',
    width: 880,
    height: 1205,
    parts: BATTING_PARTS,
    layers: {
      base:       '/images/card/uppercut-shot/uppercut-body.png',
      cap:        '/images/card/uppercut-shot/uppercut-cap.png',
      capAccent:  '/images/card/uppercut-shot/uppercut-cap-accent.png',
      gloves:     '/images/card/uppercut-shot/uppercut-gloves.png',
      pads:       '/images/card/uppercut-shot/uppercut-pads.png',
      shoes:      '/images/card/uppercut-shot/uppercut-shoes.png',
      bat:        '/images/card/uppercut-shot/uppercut-bat.png',
    },
  },
  {
    label: 'Alpha Shot',
    src: '/images/card/alpha-shot/alpha-body.png',
    width: 1553,
    height: 2129,
    parts: BATTING_PARTS,
    layers: {
      base:       '/images/card/alpha-shot/alpha-body.png',
      cap:        '/images/card/alpha-shot/alpha-cap.png',
      capAccent:  '/images/card/alpha-shot/alpha-cap-accent.png',
      gloves:     '/images/card/alpha-shot/alpha-gloves.png',
      pads:       '/images/card/alpha-shot/alpha-pads.png',
      shoes:      '/images/card/alpha-shot/alpha-shoes.png',
      bat:        '/images/card/alpha-shot/alpha-bat.png',
    },
  },
]
