import type { FoodChoice } from "@/db/schema";
import { DEFAULT_DRINKS, DEFAULT_FOOD, DRINK_OPTIONS, FOOD_OPTIONS, type DrinkChoice } from "./constants";
import type { RegistrationDetails } from "./registrations";

export type ShoppingLine = {
  value: string;
  label: string;
  count: number;
  viaDefault: number;
  viaGuests: number;
};

export type ChildrenSummary = {
  total: number;
  byFood: { value: string; label: string; count: number }[];
};

export type EveningSummary = {
  food: ShoppingLine[];
  drinks: ShoppingLine[];
  children: ChildrenSummary;
};

type AdultPlate = {
  food: FoodChoice | null;
  drinks: DrinkChoice[];
  guest: boolean;
};

function orderedDrinks(drinks: string[]): DrinkChoice[] {
  return DRINK_OPTIONS.map((option) => option.value).filter((value) => drinks.includes(value));
}

export function effectiveFood(food: FoodChoice | null): string {
  return food ?? DEFAULT_FOOD;
}

export function effectiveDrinks(drinks: string[]): DrinkChoice[] {
  const chosen = orderedDrinks(drinks);
  return chosen.length > 0 ? chosen : DEFAULT_DRINKS;
}

export function foodLabel(value: string): string {
  return FOOD_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function drinkLabel(value: string): string {
  return DRINK_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function adultPlates(entries: RegistrationDetails[]): AdultPlate[] {
  return entries.flatMap((entry) => [
    { food: entry.foodChoice, drinks: orderedDrinks(entry.drinkChoices), guest: false },
    ...Array.from({ length: entry.guestAdults }, (_, index) => {
      const preference = entry.guestPreferences.adults[index];
      return { food: preference?.food ?? null, drinks: orderedDrinks(preference?.drinks ?? []), guest: true };
    }),
  ]);
}

export function guestPreferenceSummary(entry: RegistrationDetails): string {
  const adults = Array.from({ length: entry.guestAdults }, (_, index) => {
    const preference = entry.guestPreferences.adults[index];
    const food = preference?.food ?? null;
    const drinks = preference?.drinks ?? [];
    const foodText = `${foodLabel(effectiveFood(food))}${food === null ? " (Standard)" : ""}`;
    const drinkText = `${effectiveDrinks(drinks).map(drinkLabel).join(", ")}${drinks.length === 0 ? " (Standard)" : ""}`;
    return `E${index + 1}: ${foodText}, ${drinkText}`;
  });
  const children = Array.from({ length: entry.guestChildren }, (_, index) => {
    const food = entry.guestPreferences.children[index]?.food ?? null;
    return `K${index + 1}: ${foodLabel(effectiveFood(food))}${food === null ? " (Standard)" : ""}`;
  });
  return [...adults, ...children].join(" | ");
}

export function eveningSummary(entries: RegistrationDetails[]): EveningSummary {
  const plates = adultPlates(entries);

  const food = FOOD_OPTIONS.map((option) => {
    const matching = plates.filter((plate) => effectiveFood(plate.food) === option.value);
    return {
      value: option.value,
      label: option.label,
      count: matching.length,
      viaDefault: matching.filter((plate) => plate.food === null).length,
      viaGuests: matching.filter((plate) => plate.guest).length,
    };
  });

  const drinks = DRINK_OPTIONS.map((option) => {
    const matching = plates.filter((plate) => effectiveDrinks(plate.drinks).includes(option.value));
    return {
      value: option.value,
      label: option.label,
      count: matching.length,
      viaDefault: matching.filter((plate) => plate.drinks.length === 0).length,
      viaGuests: matching.filter((plate) => plate.guest).length,
    };
  });

  const childFoods = entries.flatMap((entry) =>
    Array.from({ length: entry.guestChildren }, (_, index) => effectiveFood(entry.guestPreferences.children[index]?.food ?? null)),
  );
  const children = {
    total: childFoods.length,
    byFood: FOOD_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      count: childFoods.filter((value) => value === option.value).length,
    })).filter((line) => line.count > 0),
  };

  return { food, drinks, children };
}
