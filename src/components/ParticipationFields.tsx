"use client";

import { useState } from "react";
import { GENDER_OPTIONS, POSITIONS } from "@/lib/constants";
import type { HelperRoleOption } from "@/lib/helper-roles";
import type { FieldErrors, RawFormValues } from "@/lib/validation";
import { checked, FieldError, invalidProps, listValue, textValue } from "./form-bits";

type ParticipationFieldsProps = {
  values: RawFormValues | undefined;
  errors: FieldErrors | undefined;
  helperRoles: HelperRoleOption[];
  genderEnabled: boolean;
  tournamentLocked: boolean;
};

export function ParticipationFields({
  values,
  errors,
  helperRoles,
  genderEnabled,
  tournamentLocked,
}: ParticipationFieldsProps) {
  const [plays, setPlays] = useState(checked(values, "playsTournament"));
  const chosenPositions = listValue(values, "positions");
  const chosenRoles = listValue(values, "helperRoleIds");
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
              <div className="positionen" role="group" aria-labelledby="positionen-label">
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
            <div className="feld">
              <label htmlFor="gender">Geschlecht</label>
              <select
                id="gender"
                name="gender"
                disabled={!genderEnabled}
                defaultValue={textValue(values, "gender")}
                aria-describedby="gender-hilfe"
              >
                <option value="">Bitte wählen</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="feld-hilfe" id="gender-hilfe">
                {genderEnabled
                  ? "Wir brauchen die Angabe für die Einteilung in Damen- und Herrenturnier."
                  : "Ob es zusätzlich ein Damenturnier gibt, klären wir noch. Bis dahin bleibt das Feld gesperrt."}
              </p>
            </div>
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
