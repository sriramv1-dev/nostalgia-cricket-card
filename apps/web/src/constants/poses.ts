import { CharacterColors } from '@/components/card/DynamicCharacter'
import { LayeredCharacterSources } from '@/components/card/LayeredCharacter'

export interface PoseConfig {
  src: string
  label: string
  width: number
  height: number
  /** List of parts that are actually visible and colorable in this pose. */
  parts: (keyof CharacterColors)[]
  /**
   * When present, this pose uses LayeredCharacter (pre-split PNG layers)
   * instead of the canvas-based DynamicCharacter.
   */
  layers?: LayeredCharacterSources
  /** Custom Y-threshold for detecting pads vs cap. */
  padsThresholdY?: number
  /** Custom Y-threshold for detecting shoes vs pads. */
  shoesThresholdY?: number
  /** Custom X-threshold for detecting gloves vs cap. */
  glovesThresholdX?: number
  /** Custom X-threshold for detecting bat vs cap accent. */
  batThresholdX?: number
}

const BATTING_PARTS: (keyof CharacterColors)[] = ['cap', 'capAccent', 'bat', 'gloves', 'pads', 'shoes']
const SCOOP_PARTS:   (keyof CharacterColors)[] = ['cap', 'capAccent', 'bat', 'gloves', 'pads', 'shoes', 'ball']
const BOWLING_PARTS: (keyof CharacterColors)[] = ['cap', 'capAccent', 'ball', 'shoes']
const KEEPING_PARTS:  (keyof CharacterColors)[] = ['cap', 'capAccent', 'gloves', 'pads', 'shoes', 'ball', 'wickets']
const KEEPING2_PARTS: (keyof CharacterColors)[] = ['cap', 'capAccent', 'gloves', 'pads', 'shoes', 'wickets']

export const POSE_REGISTRY: PoseConfig[] = [
  { 
    label: 'Pull Shot', 
    src: '/images/card/pull-shot.png',
    width: 500,
    height: 425,
    parts: BATTING_PARTS,
    // Aggressive thresholds to capture the low crouch of the Pull Shot
    padsThresholdY: 0.48,
    shoesThresholdY: 0.85,
    glovesThresholdX: 0.78
  },
  { 
    label: 'Fast Ball', 
    src: '/images/card/fast-ball.png',
    width: 450,
    height: 400,
    parts: BOWLING_PARTS,
    padsThresholdY: 0.6
  },
  { 
    label: 'Spin Ball', 
    src: '/images/card/spin-ball.png',
    width: 450,
    height: 450,
    parts: BOWLING_PARTS,
    padsThresholdY: 0.6
  },
  {
    label: 'Keeping 1',
    src: '/images/card/keeping-1.png',
    width: 1760,
    height: 2410,
    parts: KEEPING_PARTS,
    glovesThresholdX: 0.4,
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
    src: '/images/card/keeping-2.png',
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
    src: '/images/card/scoop.png',
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
    label: 'Shot X', 
    src: '/images/card/shot-x.png',
    width: 525,
    height: 450,
    parts: BATTING_PARTS
  },
  { 
    label: 'Shot XX', 
    src: '/images/card/shot-xx.png',
    width: 450,
    height: 450,
    parts: BATTING_PARTS
  },
  { 
    label: 'Shot Z', 
    src: '/images/card/shot-z.png',
    width: 425,
    height: 425,
    parts: BATTING_PARTS
  }
]
