import { DEFAULT_DRINKS, DEFAULT_FOOD, DRINK_OPTIONS, FOOD_OPTIONS, type DrinkChoice } from "./constants";
import type { RegistrationDetails } from "./registrations";

export type ShoppingLine = {
  value: string;
  label: string;
  count: number;
  viaDefault: number;
};

export type EveningSummary = {
  food: ShoppingLine[];
  drinks: ShoppingLine[];
};

function isDefaultDrink(value: string): boolean {
  return DEFAULT_DRINKS.some((drink) => drink === value);
}

export function effectiveFood(entry: RegistrationDetails): string {
  return entry.foodChoice ?? DEFAULT_FOOD;
}

export function effectiveDrinks(entry: RegistrationDetails): DrinkChoice[] {
  const chosen = DRINK_OPTIONS.map((option) => option.value).filter((value) => entry.drinkChoices.includes(value));
  return chosen.length > 0 ? chosen : DEFAULT_DRINKS;
}

export function foodLabel(value: string): string {
  return FOOD_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function drinkLabel(value: string): string {
  return DRINK_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function eveningSummary(entries: RegistrationDetails[]): EveningSummary {
  const withoutFood = entries.filter((entry) => entry.foodChoice === null).length;
  const withoutDrinks = entries.filter((entry) => entry.drinkChoices.length === 0).length;

  const food = FOOD_OPTIONS.map((option) => {
    const viaDefault = option.value === DEFAULT_FOOD ? withoutFood : 0;
    const explicit = entries.filter((entry) => entry.foodChoice === option.value).length;
    return { value: option.value, label: option.label, count: explicit + viaDefault, viaDefault };
  });

  const drinks = DRINK_OPTIONS.map((option) => {
    const viaDefault = isDefaultDrink(option.value) ? withoutDrinks : 0;
    const explicit = entries.filter((entry) => entry.drinkChoices.includes(option.value)).length;
    return { value: option.value, label: option.label, count: explicit + viaDefault, viaDefault };
  });

  return { food, drinks };
}
