import { useEffect, useState } from "react";
import { KeyRound, Mail, Phone, ShieldCheck, UserRound, Briefcase, Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";
import { ROLE_LABELS, getUserRole } from "../lib/roles";
import { fmtDateTime } from "../lib/format";
import { Alert, Field, PageHeader, Section, Spinner } from "../components/desk/ui";

const passwordChecks = (pw) => [
  { ok: pw.length >= 8, label: "At least 8 characters" },
  { ok: /[A-Za-z]/.test(pw), label: "Contains a letter" },
  { ok: /\d/.test(pw), label: "Contains a number" },
];

function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className="input pr-10"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bodyText hover:text-heading"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem("user") || "{}"));
  const [form, setForm] = useState({ name: "", phone: "", designation: "", email: "", currentPassword: "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    api("user/me")
      .then((d) => {
        setUser(d.user);
        sessionStorage.setItem("user", JSON.stringify(d.user));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      designation: user.designation || "",
      email: user.email || "",
      currentPassword: "",
    });
  }, [user]);

  const emailChanged = form.email.trim().toLowerCase() !== String(user.email || "").toLowerCase();

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const body = { name: form.name, phone: form.phone, designation: form.designation };
      if (emailChanged) {
        body.email = form.email;
        body.currentPassword = form.currentPassword;
      }
      const d = await api("user/me", { method: "PUT", body: JSON.stringify(body) });
      setUser(d.user);
      sessionStorage.setItem("user", JSON.stringify(d.user));
      setProfileMsg({ type: "success", text: "Your profile has been updated." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const checks = passwordChecks(pw.newPassword);
  const pwValid = checks.every((c) => c.ok) && pw.newPassword === pw.confirm && pw.currentPassword;

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    setSavingPw(true);
    try {
      await api("user/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }),
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setPwMsg({ type: "success", text: "Password changed. Use the new password next time you sign in." });
    } catch (err) {
      setPwMsg({ type: "error", text: err.message });
    } finally {
      setSavingPw(false);
    }
  };

  const role = getUserRole(user);
  const initials = (user.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="page max-w-5xl">
      <PageHeader eyebrow="Account" title="My profile" subtitle="Manage your personal details and sign-in security" />

      <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand text-white flex items-center justify-center text-xl font-semibold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-heading">{user.name || "-"}</p>
          <p className="text-sm text-bodyText">{user.designation || ROLE_LABELS[role]}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-bodyText">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} /> {ROLE_LABELS[role]} access
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} /> {user.email}
            </span>
            {user.lastLoginAt && <span>Last sign-in {fmtDateTime(user.lastLoginAt)}</span>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Section title="Personal details" description="Shown on documents you prepare" className="lg:col-span-3">
          <form onSubmit={saveProfile} className="space-y-4">
            {profileMsg && <Alert type={profileMsg.type}>{profileMsg.text}</Alert>}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <div className="relative">
                  <UserRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bodyText" />
                  <input
                    className="input pl-9"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </Field>
              <Field label="Designation">
                <div className="relative">
                  <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bodyText" />
                  <input
                    className="input pl-9"
                    value={form.designation}
                    placeholder="e.g. Finance Manager"
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  />
                </div>
              </Field>
              <Field label="Phone">
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bodyText" />
                  <input
                    className="input pl-9"
                    value={form.phone}
                    placeholder="03xx-xxxxxxx"
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
              </Field>
              <Field label="Email" hint={emailChanged ? "Changing email requires your current password" : undefined}>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bodyText" />
                  <input
                    type="email"
                    className="input pl-9"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </Field>
              {emailChanged && (
                <Field label="Current password" className="sm:col-span-2">
                  <PasswordInput
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    autoComplete="current-password"
                  />
                </Field>
              )}
            </div>
            <div className="flex justify-end">
              <button className="btn-primary" disabled={savingProfile}>
                {savingProfile && <Spinner />} Save changes
              </button>
            </div>
          </form>
        </Section>

        <Section title="Change password" description="Use a strong password you don't use elsewhere" className="lg:col-span-2">
          <form onSubmit={savePassword} className="space-y-4">
            {pwMsg && <Alert type={pwMsg.type}>{pwMsg.text}</Alert>}
            <Field label="Current password">
              <PasswordInput
                value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                autoComplete="current-password"
              />
            </Field>
            <Field label="New password">
              <PasswordInput
                value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                autoComplete="new-password"
              />
            </Field>
            <Field
              label="Confirm new password"
              error={pw.confirm && pw.confirm !== pw.newPassword ? "Passwords do not match" : undefined}
            >
              <PasswordInput
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                autoComplete="new-password"
              />
            </Field>
            <ul className="space-y-1">
              {checks.map((c) => (
                <li key={c.label} className={`text-xs flex items-center gap-2 ${c.ok ? "text-emerald-700" : "text-bodyText"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.ok ? "bg-emerald-500" : "bg-gray-300"}`} />
                  {c.label}
                </li>
              ))}
            </ul>
            <button className="btn-primary w-full" disabled={!pwValid || savingPw}>
              {savingPw ? <Spinner /> : <KeyRound size={16} />} Update password
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
}
