"use client";

import { useState } from "react";
import { DRINK_OPTIONS, FOOD_OPTIONS, GENDER_OPTIONS, MAX_GUESTS_PER_GROUP, POSITIONS } from "@/lib/constants";
import type { HelperRoleOption } from "@/lib/helper-roles";
import {
  adultFoodField,
  childFoodField,
  guestDrinkValue,
  type FieldErrors,
  type RawFormValues,
} from "@/lib/validation";
import { CountStepper } from "./CountStepper";
import { checked, FieldError, invalidProps, listValue, textValue } from "./form-bits";

type FoodTilesProps = {
  name: string;
  labelId: string;
  chosen: string;
};

function FoodTiles({ name, labelId, chosen }: FoodTilesProps) {
  return (
    <div className="kacheln" role="radiogroup" aria-labelledby={labelId}>
      {FOOD_OPTIONS.map((option) => (
        <label key={option.value} className="haken">
          <input type="radio" name={name} value={option.value} defaultChecked={chosen === option.value} />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

type DrinkTilesProps = {
  name: string;
  labelId: string;
  valueFor: (drink: (typeof DRINK_OPTIONS)[number]["value"]) => string;
  chosen: string[];
};

function DrinkTiles({ name, labelId, valueFor, chosen }: DrinkTilesProps) {
  return (
    <div className="kacheln" role="group" aria-labelledby={labelId}>
      {DRINK_OPTIONS.map((option) => (
        <label key={option.value} className="haken">
          <input
            type="checkbox"
            name={name}
            value={valueFor(option.value)}
            defaultChecked={chosen.includes(valueFor(option.value))}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

type ParticipationFieldsProps = {
  values: RawFormValues | undefined;
  errors: FieldErrors | undefined;
  helperRoles: HelperRoleOption[];
  genderEnabled: boolean;
  tournamentLocked: boolean;
  guestFee: string | null;
};

export function ParticipationFields({
  values,
  errors,
  helperRoles,
  genderEnabled,
  tournamentLocked,
  guestFee,
}: ParticipationFieldsProps) {
  const [plays, setPlays] = useState(checked(values, "playsTournament"));
  const chosenPositions = listValue(values, "positions");
  const chosenRoles = listValue(values, "helperRoleIds");
  const chosenFood = textValue(values, "foodChoice");
  const chosenDrinks = listValue(values, "drinkChoices");
  const [guestAdults, setGuestAdults] = useState(Number(textValue(values, "guestAdults")) || 0);
  const [guestChildren, setGuestChildren] = useState(Number(textValue(values, "guestChildren")) || 0);
  const chosenGuestDrinks = listValue(values, "guestDrinks");
  const currentYear = new Date().getFullYear();

  return (
    <>
      <fieldset className="teil">
        <legend>Du kommst zum Event</legend>
        <div className="zeile">
          <div className="feld">
            <label htmlFor="firstName">Vorname</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              maxLength={50}
              autoComplete="given-name"
              defaultValue={textValue(values, "firstName")}
              {...invalidProps(errors, "firstName")}
            />
            <FieldError errors={errors} name="firstName" />
          </div>
          <div className="feld">
            <label htmlFor="nickname">Spitzname (optional)</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              maxLength={50}
              autoComplete="nickname"
              defaultValue={textValue(values, "nickname")}
              {...invalidProps(errors, "nickname")}
            />
            <FieldError errors={errors} name="nickname" />
            <p className="feld-hilfe">Hast du einen, steht er statt deines Vornamens auf der Teilnehmerliste.</p>
          </div>
        </div>
        <div className="feld">
          <span className="label" id="zeitraum-label">
            Wann warst du im Verein aktiv? (optional)
          </span>
          <div className="zeile" role="group" aria-labelledby="zeitraum-label">
            <div className="feld">
              <label htmlFor="activeFrom">von (Jahr)</label>
              <input
                id="activeFrom"
                name="activeFrom"
                type="number"
                inputMode="numeric"
                min={1950}
                max={currentYear}
                placeholder="z. B. 1998"
                defaultValue={textValue(values, "activeFrom")}
                {...invalidProps(errors, "activeFrom")}
              />
              <FieldError errors={errors} name="activeFrom" />
            </div>
            <div className="feld">
              <label htmlFor="activeTo">bis (Jahr)</label>
              <input
                id="activeTo"
                name="activeTo"
                type="number"
                inputMode="numeric"
                min={1950}
                max={currentYear}
                placeholder="leer = bis heute"
                defaultValue={textValue(values, "activeTo")}
                {...invalidProps(errors, "activeTo")}
              />
              <FieldError errors={errors} name="activeTo" />
            </div>
          </div>
          <p className="feld-hilfe">Daraus entsteht die Statistik, wer aus welchem Jahrgang dabei ist.</p>
        </div>
        <label className="haken">
          <input type="checkbox" name="showPublicly" defaultChecked={checked(values, "showPublicly")} />
          <span>
            Mein Spitzname (oder ohne Spitzname mein Vorname) und meine aktive Zeit dürfen auf der Teilnehmerliste
            stehen. Ohne Haken erscheinst du dort anonym.
          </span>
        </label>
      </fieldset>

      <fieldset className="teil teil-optional" data-aktiv={guestAdults + guestChildren > 0}>
        <legend>Bringst du jemanden mit?</legend>
        <p className="feld-hilfe">
          Hier geht es nur um Begleitung, die zuschaut und mitfeiert. Wer mitspielen oder helfen will, zum Beispiel als
          Schiedsrichter, meldet sich bitte selbst an.
        </p>
        <div>
          <CountStepper
            name="guestAdults"
            label="Erwachsene"
            hint={guestFee ? `Du zahlst je ${guestFee} mit` : "Du zahlst den Teilnahmebeitrag mit"}
            value={guestAdults}
            max={MAX_GUESTS_PER_GROUP}
            onChange={setGuestAdults}
          />
          <CountStepper
            name="guestChildren"
            label="Kinder"
            hint="Kostenlos"
            value={guestChildren}
            max={MAX_GUESTS_PER_GROUP}
            onChange={setGuestChildren}
          />
        </div>
        <FieldError errors={errors} name="guestAdults" />
        <FieldError errors={errors} name="guestChildren" />
      </fieldset>

      <fieldset className="teil teil-optional" data-aktiv={chosenFood !== "" || chosenDrinks.length > 0}>
        <legend>Für den Abend</legend>
        <p className="feld-hilfe">
          Damit wir richtig einkaufen. Alles freiwillig: Ohne Angabe planen wir mit Wurst und Bier
          {guestChildren > 0 ? ", bei Kindern mit Wurst und alkoholfreien Getränken." : "."}
        </p>
        <div className="person">
          {guestAdults + guestChildren > 0 && <p className="person-titel">Für dich</p>}
          <div className="feld">
            <span className="label" id="essen-label">
              Essen
            </span>
            <FoodTiles name="foodChoice" labelId="essen-label" chosen={chosenFood} />
          </div>
          <div className="feld">
            <span className="label" id="getraenke-label">
              Getränke (Mehrfachauswahl)
            </span>
            <DrinkTiles name="drinkChoices" labelId="getraenke-label" valueFor={(drink) => drink} chosen={chosenDrinks} />
          </div>
        </div>
        {Array.from({ length: guestAdults }, (_, index) => (
          <div key={`erwachsen-${index}`} className="person">
            <p className="person-titel">Erwachsene Begleitung {index + 1}</p>
            <div className="feld">
              <span className="label" id={`gast-${index}-essen`}>
                Essen
              </span>
              <FoodTiles
                name={adultFoodField(index)}
                labelId={`gast-${index}-essen`}
                chosen={textValue(values, adultFoodField(index))}
              />
            </div>
            <div className="feld">
              <span className="label" id={`gast-${index}-getraenke`}>
                Getränke (Mehrfachauswahl)
              </span>
              <DrinkTiles
                name="guestDrinks"
                labelId={`gast-${index}-getraenke`}
                valueFor={(drink) => guestDrinkValue(index, drink)}
                chosen={chosenGuestDrinks}
              />
            </div>
          </div>
        ))}
        {Array.from({ length: guestChildren }, (_, index) => (
          <div key={`kind-${index}`} className="person">
            <p className="person-titel">Kind {index + 1}</p>
            <div className="feld">
              <span className="label" id={`kind-${index}-essen`}>
                Essen
              </span>
              <FoodTiles
                name={childFoodField(index)}
                labelId={`kind-${index}-essen`}
                chosen={textValue(values, childFoodField(index))}
              />
              <p className="feld-hilfe">Für Kinder gibt es alkoholfreie Getränke.</p>
            </div>
          </div>
        ))}
        <p className="feld-hilfe">Spritzgetränke (Aperol und Sarti Spritz) gibt es, wenn genug Leute Interesse haben.</p>
      </fieldset>

      <fieldset className="teil teil-optional" data-aktiv={plays}>
        <legend>Du spielst im Turnier mit</legend>
        <label className="haken haken-gross">
          <input
            type="checkbox"
            name="playsTournament"
            defaultChecked={checked(values, "playsTournament")}
            disabled={tournamentLocked && !plays}
            onChange={(event) => setPlays(event.target.checked)}
          />
          <span>Ja, ich spiele mit</span>
        </label>
        {tournamentLocked && !plays && (
          <p className="feld-hilfe">Die Anmeldung fürs Turnier ist geschlossen.</p>
        )}
        {plays && (
          <>
            <div className="feld">
              <span className="label" id="positionen-label">
                Auf welchen Positionen spielst du?
              </span>
              <div className="kacheln" role="group" aria-labelledby="positionen-label">
                {POSITIONS.map((position) => (
                  <label key={position} className="haken">
                    <input
                      type="checkbox"
                      name="positions"
                      value={position}
                      defaultChecked={chosenPositions.includes(position)}
                    />
                    <span>{position}</span>
                  </label>
                ))}
              </div>
              <FieldError errors={errors} name="positions" />
            </div>
            {genderEnabled && (
              <div className="feld">
                <label htmlFor="gender">Geschlecht</label>
                <select id="gender" name="gender" defaultValue={textValue(values, "gender")} aria-describedby="gender-hilfe">
                  <option value="">Bitte wählen</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="feld-hilfe" id="gender-hilfe">
                  Wir brauchen die Angabe für die Einteilung in Damen- und Herrenturnier.
                </p>
              </div>
            )}
            <div className="hinweis">
              <p>
                <strong>Versicherung:</strong> [Platzhalter] Wer kein Vereinsmitglied ist, ist beim Turnier nicht über
                den Verein versichert. Du spielst auf eigenes Risiko und bist nur über deine private Versicherung
                abgesichert.
              </p>
              <label className="haken">
                <input
                  type="checkbox"
                  name="insuranceAccepted"
                  defaultChecked={checked(values, "insuranceAccepted")}
                  {...invalidProps(errors, "insuranceAccepted")}
                />
                <span>Ich habe den Hinweis zur Versicherung gelesen und spiele auf eigenes Risiko.</span>
              </label>
              <FieldError errors={errors} name="insuranceAccepted" />
            </div>
          </>
        )}
      </fieldset>

      {helperRoles.length > 0 && (
        <fieldset className="teil teil-optional" data-aktiv={chosenRoles.length > 0}>
          <legend>Du hilfst mit</legend>
          <p className="feld-hilfe">Freiwillig, aber ohne Helfer gibt es kein Turnier. Mehrfachauswahl möglich.</p>
          {helperRoles.map((role) => {
            const chosen = chosenRoles.includes(String(role.id));
            const full = role.freeSlots === 0 && !chosen;
            return (
              <label key={role.id} className="haken">
                <input
                  type="checkbox"
                  name="helperRoleIds"
                  value={String(role.id)}
                  defaultChecked={chosen}
                  disabled={full}
                />
                <span>
                  <strong>{role.label}</strong>
                  {role.description ? <span className="leise"> – {role.description}</span> : null}
                  <span className="rollen-info">
                    {role.exemptsFromFee && <span className="marke marke-gelb">ohne Teilnahmebeitrag</span>}
                    {role.freeSlots !== null && (
                      <span className="leise">
                        {full
                          ? "Schon voll besetzt"
                          : `Noch ${role.freeSlots} von ${role.maxCount} ${role.maxCount === 1 ? "Platz" : "Plätzen"} frei`}
                      </span>
                    )}
                  </span>
                </span>
              </label>
            );
          })}
          <FieldError errors={errors} name="helperRoleIds" />
        </fieldset>
      )}
    </>
  );
}
