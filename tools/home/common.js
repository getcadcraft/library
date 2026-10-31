/* SPDX-License-Identifier: Apache-2.0 */
/** Colours, layers and small helpers shared by the home set's item files. */
import { IN } from './kit.js';

export const C = {
  porcelain: '#f2f2ee', enamel: '#f6f6f3', chrome: '#c3c8ce', steel: '#a9aeb4', darkSteel: '#4a4e54', black: '#1f2124', graphite: '#33363a',
  glass: '#1c252c', clear: '#bcd4de', water: '#5b9cc4', wood: '#8a5e3c', oak: '#b58a58', brick: '#9a4f3b', firebrick: '#c7a77c', stone: '#b9b3a7',
  slate: '#5a5d61', brass: '#b39a5a', copper: '#b8714a', red: '#a52a2a', rubber: '#1c1d1f', white: '#f4f4f4', gray: '#8e9399', lightGray: '#d3d6da',
};

export const FX = [['FIXTURE', 7], ['FIXTURE-DETAIL', 8], ['FIXTURE-ABOVE', 4], ['CLEARANCE', 3]];
export const EQ = [['EQUIP', 7], ['EQUIP-DETAIL', 8], ['EQUIP-ABOVE', 4], ['SWING', 3], ['CLEARANCE', 3]];
export const FU = [['FURNITURE', 7], ['FURNITURE-DETAIL', 8]];
export const VH = [['VEHICLE', 8], ['VEHICLE-DETAIL', 8]];

export const SIZE_NOTE = 'Common nominal size, not any maker\'s product; check the chosen unit\'s spec sheet.';
export const inch = (n) => n * IN;
export const ft = (n) => n * 304.8;
