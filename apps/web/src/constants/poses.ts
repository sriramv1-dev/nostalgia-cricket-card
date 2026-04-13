import { CharacterColors } from '@/components/card/DynamicCharacter'

export interface PoseConfig {
  src: string
  label: string
  width: number
  height: number
  /** List of parts that are actually visible and colorable in this pose. */
  parts: (keyof CharacterColors)[]
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
const BOWLING_PARTS: (keyof CharacterColors)[] = ['cap', 'capAccent', 'ball', 'shoes']
const KEEPING_PARTS: (keyof CharacterColors)[] = ['cap', 'capAccent', 'gloves', 'pads', 'shoes', 'ball', 'wickets']

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
    width: 500,
    height: 450,
    parts: KEEPING_PARTS,
    glovesThresholdX: 0.4
  },
  { 
    label: 'Keeping 2', 
    src: '/images/card/keeping-2.png',
    width: 450,
    height: 450,
    parts: KEEPING_PARTS
  },
  { 
    label: 'Scoop', 
    src: '/images/card/scoop.png',
    width: 275,
    height: 450,
    parts: BATTING_PARTS,
    padsThresholdY: 0.7
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
