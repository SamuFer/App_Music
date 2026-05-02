// src/components/ScoreForm.tsx
import { useState, useRef } from "react";

interface Props {
  songId: string;
  userId: string;
}

const STEP = 0.1;
const MIN = 0;
const MAX = 10;

function round(val: number): number {
  return Math.round(val * 10) / 10;
}

export default function ScoreForm({ songId, userId }: Props) {
  const [score, setScoreState] = useState(5.0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"dim" | "cyan" | "pink">("dim");
  const [btnState, setBtnState] = useState<"idle" | "loading" | "success">("idle");

  // ── Helpers ──────────────────────────────────────────
  function setScore(val: number) {
    const clamped = Math.min(MAX, Math.max(MIN, round(val)));
    setScoreState(clamped);
    setError("");
  }

  function validate(val: number): boolean {
    if (isNaN(val)) {
      setError("// ingresa un número válido");
      return false;
    }
    if (val < MIN || val > MAX) {
      setError(`// el valor debe estar entre ${MIN} y ${MAX}`);
      return false;
    }
    return true;
  }

  // ── Submit ────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(score)) return;

    const payload = { songId, userId, score };

    setBtnState("loading");
    setStatus("// procesando voto...");
    setStatusType("dim");

    try {
      // TODO: reemplazar la URL cuando el backend esté listo
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      setBtnState("success");
      setStatus("// voto guardado correctamente");
      setStatusType("cyan");
    } catch (err) {
      setBtnState("idle");
      setStatus("// error al enviar, intenta de nuevo");
      setStatusType("pink");
      console.error("Vote error:", err);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Formulario de votación"
      className="flex flex-col w-full items-center justify-between pl-5 gap-4 border-t border-dim pt-4 md:border-l-2 md:border-t-0 md:items-end"
    >
      <fieldset className="border-none p-0 m-0">
        <legend className="font-vt text-[1.225rem] text-dim mb-3 text-center md:text-right">
          // Tu puntuación
        </legend>

        <div className="flex items-center gap-4">
          {/* Botón − */}
          <button
            type="button"
            aria-label="Reducir puntuación"
            onClick={() => setScore(score - STEP)}
            className="w-9 h-9 bg-deep border border-dim text-white font-vt text-xl flex items-center justify-center hover:border-cyan hover:text-cyan transition-all cursor-pointer"
          >
            −
          </button>

          {/* Input */}
          <div className="relative">
            <input
              type="number"
              min={MIN}
              max={MAX}
              step={STEP}
              value={score.toFixed(1)}
              aria-live="polite"
              aria-label="Puntuación actual"
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  if (val > MAX) setScoreState(MAX);
                  else if (val < MIN) setScoreState(MIN);
                  else setScoreState(val);
                }
              }}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (!validate(val)) return;
                setScore(val);
              }}
              className={`font-display text-[2.5rem] leading-none text-yellow glow-yellow w-22.5 text-center bg-transparent border-b focus:outline-none text-rose font-bold
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                ${error ? "border-pink" : "border-dim focus:border-cyan"}`}
            />
            <span className="font-vt text-[1rem] text-dim bottom-2" aria-hidden="true">
              /10
            </span>
          </div>

          {/* Botón + */}
          <button
            type="button"
            aria-label="Aumentar puntuación"
            onClick={() => setScore(score + STEP)}
            className="w-9 h-9 bg-deep border border-dim text-white font-vt text-xl flex items-center justify-center hover:border-cyan hover:text-cyan transition-all cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Error de validación */}
        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="font-vt text-[0.8rem] tracking-[2px] text-pink mt-2"
          >
            {error}
          </p>
        )}
      </fieldset>

      {/* Botón submit */}
      <button
        type="submit"
        disabled={btnState === "loading" || btnState === "success"}
        className={`w-full mt-4.5 py-3.25 bg-rose font-vt text-[1.2rem] text-black-m font-bold cursor-pointer relative overflow-hidden transition-colors hover:border-rose hover:text-rose
          ${btnState === "success"
            ? "border border-cyan text-cyan glow-cyan"
            : "border border-pink text-pink glow-pink hover:bg-transparent"
          }`}
      >
        {btnState === "loading"
          ? "[ ENVIANDO... ]"
          : btnState === "success"
          ? "[ ✓ VOTO REGISTRADO ]"
          : "[ Enviar tu Voto ]"}
      </button>

      {/* Estado del envío */}
      {status && (
        <p
          aria-live="polite"
          className={`font-vt text-[0.8rem] tracking-[3px] text-center
            ${statusType === "cyan" ? "text-cyan" : statusType === "pink" ? "text-pink" : "text-dim"}`}
        >
          {status}
        </p>
      )}
    </form>
  );
}