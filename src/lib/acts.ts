import { ACT_RANGES } from '../config/acts';
import type { ActId } from '../types';
export const getAct=(date:Date):ActId|null=>ACT_RANGES.find(a=>date>=new Date(a.start)&&date<new Date(a.end))?.id??null;
