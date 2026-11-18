import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const RECAPTCHA_SRC = "https://www.google.com/recaptcha/api.js?render=explicit";

let turnstilePromise = null;
const loadTurnstile = () => {
  if (window.turnstile?.render) return Promise.resolve(window.turnstile);
  if (!turnstilePromise) {
    turnstilePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const wait = () =>
          window.turnstile?.render ? resolve(window.turnstile) : setTimeout(wait, 50);
        wait();
      };
      script.onerror = () => reject(new Error("Could not load Cloudflare Turnstile"));
      document.head.appendChild(script);
    });
  }
  return turnstilePromise;
};

let recaptchaPromise = null;
const loadRecaptcha = () => {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (!recaptchaPromise) {
    recaptchaPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = RECAPTCHA_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const wait = () =>
          window.grecaptcha?.render ? resolve(window.grecaptcha) : setTimeout(wait, 50);
        wait();
      };
      script.onerror = () => reject(new Error("Could not load reCAPTCHA"));
      document.head.appendChild(script);
    });
  }
  return recaptchaPromise;
};

/**
 * "I am not a robot" verification for the sign-in form.
 * Uses Cloudflare Turnstile when configured, or Google reCAPTCHA v2,
 * otherwise the server's built-in image challenge. Reports { captchaToken, captchaAnswer }.
 */
const HumanCheck = forwardRef(function HumanCheck({ onChange }, ref) {
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const widgetRef = useRef(null);
  const widgetId = useRef(null);

  const load = useCallback(async () => {
    setError("");
    setAnswer("");
    onChange?.({ captchaToken: "", captchaAnswer: "" });
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}user/captcha`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Verification unavailable");
      setChallenge(data);
    } catch (err) {
      setError(err.message);
    }
  }, [onChange]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!widgetRef.current) return;
    let cancelled = false;

    if (challenge?.provider === "turnstile") {
      loadTurnstile()
        .then((t) => {
          if (cancelled || widgetId.current !== null) return;
          widgetId.current = t.render(widgetRef.current, {
            sitekey: challenge.siteKey,
            callback: (token) => onChange?.({ captchaToken: token }),
            "expired-callback": () => onChange?.({ captchaToken: "" }),
            "error-callback": () => setError("Turnstile verification error. Please retry."),
          });
        })
        .catch((e) => setError(e.message));
    } else if (challenge?.provider === "recaptcha") {
      loadRecaptcha()
        .then((g) => {
          if (cancelled || widgetId.current !== null) return;
          widgetId.current = g.render(widgetRef.current, {
            sitekey: challenge.siteKey,
            callback: (token) => onChange?.({ captchaToken: token }),
            "expired-callback": () => onChange?.({ captchaToken: "" }),
          });
        })
        .catch((e) => setError(e.message));
    }

    return () => {
      cancelled = true;
      if (widgetId.current !== null) {
        if (challenge?.provider === "turnstile" && window.turnstile?.remove) {
          try {
            window.turnstile.remove(widgetId.current);
          } catch (_) {}
        }
        widgetId.current = null;
      }
    };
  }, [challenge, onChange]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (challenge?.provider === "turnstile" && widgetId.current !== null) {
        window.turnstile?.reset(widgetId.current);
        onChange?.({ captchaToken: "" });
      } else if (challenge?.provider === "recaptcha" && widgetId.current !== null) {
        window.grecaptcha?.reset(widgetId.current);
        onChange?.({ captchaToken: "" });
      } else {
        load();
      }
    },
  }));

  if (challenge?.provider === "turnstile") {
    return (
      <div className="flex flex-col items-center justify-center my-2">
        <div ref={widgetRef} />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  if (challenge?.provider === "recaptcha") {
    return (
      <div>
        <div ref={widgetRef} />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-bodyText mb-2">
        <ShieldCheck size={14} className="text-brand" /> I am not a robot
      </div>
      <div className="flex items-center gap-3">
        <div className="h-[52px] w-[160px] rounded-lg bg-card border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
          {challenge?.svg ? (
            <img src={challenge.svg} alt="Verification code" className="select-none" draggable={false} />
          ) : (
            <span className="text-xs text-bodyText">{error || "Loading..."}</span>
          )}
        </div>
        <button
          type="button"
          onClick={load}
          className="p-2 rounded-lg text-bodyText hover:bg-card hover:text-brand"
          title="Get a new code"
          aria-label="Get a new code"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <input
        className="input mt-2.5 uppercase tracking-[0.3em] placeholder:normal-case placeholder:tracking-normal"
        placeholder="Type the characters above"
        value={answer}
        maxLength={5}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => {
          const v = e.target.value.toUpperCase();
          setAnswer(v);
          onChange?.({ captchaToken: challenge?.token || "", captchaAnswer: v });
        }}
      />
    </div>
  );
});

export default HumanCheck;
