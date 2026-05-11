"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GlassButton from "@/components/ui/GlassButton";
import GlassSelect from "@/components/ui/GlassSelect";
import { apiClient, extractErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useUiText } from "@/lib/ui-text";
import type { AccountType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateAccountFormProps {
  onCreated?: () => Promise<void> | void;
  redirectTo?: string;
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "danger" | "icon";
}

type CreateAccountPayload = {
  type: AccountType;
  ownerId?: string;
};

export default function CreateAccountForm({
  onCreated,
  redirectTo,
  triggerLabel,
  triggerVariant = "primary",
}: CreateAccountFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useUiText();
  const router = useRouter();
  const [type, setType] = useState<AccountType | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const accountTypeOptions = useMemo(
    () => [
      { value: "saving", label: t("accountForm.types.saving", "Saving") },
      { value: "fixed", label: t("accountForm.types.fixed", "Fixed") },
    ],
    [t]
  );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!type) {
      showToast("error", t("accountForm.errors.typeRequired", "Please select an account type"));
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateAccountPayload = {
        type,
        ...(user?.id ? { ownerId: user.id } : {}),
      };

      await apiClient.post("/accounts", payload);

      showToast("success", t("accountForm.success.created", "Bank account request created"));
      setType("");
      setOpen(false);
      await onCreated?.();

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error) {
      showToast("error", extractErrorMessage(error, t("accountForm.errors.createFailed", "Unable to create account")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <GlassButton type="button" variant={triggerVariant} onClick={() => setOpen(true)}>
        {triggerLabel ?? t("accountForm.actions.open", "Create Bank Account")}
      </GlassButton>

      <Dialog open={open} onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setType("");
        }
      }}>
        <DialogContent className="max-w-md border-white/20 bg-background/95 text-foreground backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{t("accountForm.title", "Create Bank Account")}</DialogTitle>
            <DialogDescription>{t("accountForm.subtitle", "Choose the account type to open a new account.")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <GlassSelect
              id="account-type"
              label={t("accountForm.fields.type", "Account Type")}
              value={type}
              onValueChange={(value) => setType(value as AccountType)}
              placeholder={t("accountForm.fields.typePlaceholder", "Select account type")}
              options={accountTypeOptions}
            />

            <GlassButton type="submit" className="w-full" loading={submitting} loadingText={t("accountForm.actions.creating", "Creating...")}>
              {t("accountForm.actions.submit", "Create Bank Account")}
            </GlassButton>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}