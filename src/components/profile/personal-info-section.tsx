"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, ReadOnlyField, Select, Textarea } from "@/components/ui/field";
import { usePortal } from "@/lib/data/portal-store";
import type { Gender, Student } from "@/lib/types";
import { formatDate, titleCase } from "@/lib/utils";

const GENDERS: Gender[] = ["male", "female", "other", "prefer_not_to_say"];

/** Student-editable personal details. Toggles between a read view and a form. */
export function PersonalInfoSection({ student }: { student: Student }) {
  const { updateProfile } = usePortal();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);

    await updateProfile({
      fullName: String(form.get("fullName")),
      dateOfBirth: String(form.get("dateOfBirth")),
      gender: String(form.get("gender")) as Gender,
      contactNumber: String(form.get("contactNumber")),
      personalEmail: String(form.get("personalEmail")),
      address: String(form.get("address")),
    });

    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  }

  return (
    <Card>
      <CardHeader
        title="Personal information"
        description="Details you maintain yourself."
        action={
          editing ? null : (
            <div className="flex items-center gap-2">
              {saved ? (
                <span className="flex items-center gap-1 text-[12px] font-medium text-sage-500">
                  <Check className="size-3.5" />
                  Saved
                </span>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </div>
          )
        }
      />

      {editing ? (
        <form onSubmit={handleSubmit}>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName">
              <Input
                id="fullName"
                name="fullName"
                defaultValue={student.fullName}
                required
              />
            </Field>
            <Field label="Date of birth" htmlFor="dateOfBirth">
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={student.dateOfBirth}
                required
              />
            </Field>
            <Field label="Gender" htmlFor="gender">
              <Select id="gender" name="gender" defaultValue={student.gender}>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {titleCase(g)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Contact number" htmlFor="contactNumber">
              <Input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                defaultValue={student.contactNumber}
                required
              />
            </Field>
            <Field
              label="Personal email"
              htmlFor="personalEmail"
              help="Used for notifications outside the university network."
            >
              <Input
                id="personalEmail"
                name="personalEmail"
                type="email"
                defaultValue={student.personalEmail}
                required
              />
            </Field>
            <Field label="Address" htmlFor="address" className="sm:col-span-2">
              <Textarea
                id="address"
                name="address"
                rows={2}
                defaultValue={student.address}
              />
            </Field>
          </CardBody>

          <div className="flex items-center justify-end gap-2 border-t border-sand-200/80 px-5 py-3.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              <X className="size-3.5" />
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {saving ? "Saving" : "Save changes"}
            </Button>
          </div>
        </form>
      ) : (
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <ReadOnlyField label="Full name" value={student.fullName} />
          <ReadOnlyField
            label="Date of birth"
            value={formatDate(student.dateOfBirth)}
          />
          <ReadOnlyField label="Gender" value={titleCase(student.gender)} />
          <ReadOnlyField label="Contact number" value={student.contactNumber} />
          <ReadOnlyField label="Personal email" value={student.personalEmail} />
          <ReadOnlyField
            label="University email"
            value={student.universityEmail}
            locked
          />
          <ReadOnlyField
            label="Address"
            value={student.address}
            className="sm:col-span-2"
          />
        </CardBody>
      )}
    </Card>
  );
}
