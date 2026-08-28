import { FoodItem, PortionOption } from '../types';

export interface FoodWithPortions extends FoodItem {
  id: string;
  name: string;
  aliases?: string[];
  category: string;
  categoryLabel: string;
  subCat?: 'vegan' | 'vegetarian' | 'animal' | 'dairy' | 'drink' | 'fat' | string;
  icon: string;
  baseCal: number;
  baseProt: number;
  baseCarb: number;
  baseFat: number;
  baseFiber: number;
  isLiquid?: boolean;
  portions: PortionOption[];
}
