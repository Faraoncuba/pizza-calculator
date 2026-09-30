import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  calculateRecipe, defaultRecipe,
  type RecipeInput, type CalculationMode, type PrefermentType, type PrefermentMode,
} from "@/lib/calculator";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="text-sm text-red-700 mt-1">{message}</p> : null;
}

interface PercentageControlProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  error?: string;
}

function PercentageControl({ id, label, value, onChange, step = 1, min = 0, max = 100, error }: PercentageControlProps) {
  const changeBy = (direction: number) => {
    const current = value.trim() === "" || !Number.isFinite(Number(value)) ? min : Number(value);
    onChange(String(Number(Math.max(min, Math.min(max, current + direction * step)).toFixed(2))));
  };
  return (
    <div className="col-span-1 sm:col-span-2">
      <Label htmlFor={id} className="block mb-1">{label} (%)</Label>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" aria-label={`Reducir ${label.toLowerCase()}`} onClick={() => changeBy(-1)}>
          <Minus className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="w-24 shrink-0">
          <Input id={id} type="number" inputMode="decimal" value={value} min={min} max={max} step="any"
            onChange={(event) => onChange(event.target.value)} className="text-center"
            aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
        </div>
        <span aria-hidden="true">%</span>
        <Button type="button" variant="outline" size="icon" aria-label={`Aumentar ${label.toLowerCase()}`} onClick={() => changeBy(1)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export default function PizzaCalculator() {
  const [recipe, setRecipe] = useState<RecipeInput>({ ...defaultRecipe });
  const [mostrarAvanzado, setMostrarAvanzado] = useState(false);
  const { amounts, errors } = calculateRecipe(recipe);
  const { modo, pizzas, pesoBola, harinaBase, hidratacion, sal, aceite, azucar, levadura,
    usarPrefermento, tipoPrefermento, prefermentoModo, prefermentoPorcentaje, prefermentoHarina } = recipe;

  const update = <K extends keyof RecipeInput>(field: K, value: RecipeInput[K]) => {
    setRecipe((current) => ({ ...current, [field]: value }));
  };

  const handleExport = () => {
    if (!amounts) return;
    const { masaTotal, harina, agua, salGr, aceiteGr, azucarGr, levaduraFresca, levaduraSeca,
      harinaPrefermento, aguaPrefermento, levaduraPrefermento, harinaFinal, aguaFinal } = amounts;
    let contenido = `Masa total: ${Math.round(masaTotal)} g\nHarina total: ${Math.round(harina)} g\nAgua total: ${Math.round(agua)} g\nSal (${sal}%): ${salGr} g\nAceite (${aceite}%): ${aceiteGr} g\nAzúcar (${azucar}%): ${azucarGr} g (opcional)\nLevadura fresca (${levadura}%): ${levaduraFresca.toFixed(1)} g\nLevadura seca (1/3): ${levaduraSeca.toFixed(1)} g`;
    if (usarPrefermento) {
      contenido += `\n\nPrefermento (${tipoPrefermento}):\nHarina: ${Math.round(harinaPrefermento)} g\nAgua: ${Math.round(aguaPrefermento)} g\nLevadura fresca (0.2%): ${levaduraPrefermento.toFixed(1)} g\nHarina restante: ${Math.round(harinaFinal)} g\nAgua restante: ${Math.round(aguaFinal)} g`;
    }
    const url = URL.createObjectURL(new Blob([contenido], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pizza-calculo.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 bg-[#fff7ed] rounded-2xl shadow-lg border border-[#e6c3a5]">
      <Card className="rounded-xl shadow-inner bg-[#fffdf8]">
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-[#3e2f20]">
          <h1 className="col-span-1 sm:col-span-2 text-3xl font-extrabold text-center text-[#9c4221]">🍕 Calculadora de Pizza</h1>

          <fieldset className="col-span-1 sm:col-span-2">
            <legend id="modo-label" className="text-sm font-medium mb-2">Calcular a partir de:</legend>
            <RadioGroup value={modo} onValueChange={(value) => update("modo", value as CalculationMode)}
              aria-labelledby="modo-label" className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="pizzas" id="modo-pizzas" />
                <Label htmlFor="modo-pizzas">Cantidad de pizzas</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="harina" id="modo-harina" />
                <Label htmlFor="modo-harina">Cantidad de harina</Label>
              </div>
            </RadioGroup>
          </fieldset>

          {modo === "pizzas" ? (
            <>
              <Label htmlFor="pizzas">Cuántas pizzas:</Label>
              <div>
                <Input id="pizzas" type="number" value={pizzas} onChange={(event) => update("pizzas", event.target.value)}
                  inputMode="numeric" min="1" step="1" aria-invalid={Boolean(errors.pizzas)}
                  aria-describedby={errors.pizzas ? "pizzas-error" : undefined} />
                <FieldError id="pizzas-error" message={errors.pizzas} />
              </div>
              <Label htmlFor="peso-bola">Peso por bola (g):</Label>
              <div>
                <Input id="peso-bola" type="number" value={pesoBola} onChange={(event) => update("pesoBola", event.target.value)}
                  inputMode="decimal" min="0" step="any" aria-invalid={Boolean(errors.pesoBola)}
                  aria-describedby={errors.pesoBola ? "peso-bola-error" : undefined} />
                <FieldError id="peso-bola-error" message={errors.pesoBola} />
              </div>
            </>
          ) : (
            <>
              <Label htmlFor="harina-base">Harina disponible (g):</Label>
              <div>
                <Input id="harina-base" type="number" value={harinaBase} onChange={(event) => update("harinaBase", event.target.value)}
                  inputMode="decimal" min="0" step="any" aria-invalid={Boolean(errors.harinaBase)}
                  aria-describedby={errors.harinaBase ? "harina-base-error" : undefined} />
                <FieldError id="harina-base-error" message={errors.harinaBase} />
              </div>
            </>
          )}

          <PercentageControl id="hidratacion" label="Hidratación" value={hidratacion}
            onChange={(value) => update("hidratacion", value)} min={50} max={80} error={errors.hidratacion} />

          <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
            <Switch id="avanzado" checked={mostrarAvanzado} onCheckedChange={setMostrarAvanzado} />
            <Label htmlFor="avanzado">Modo avanzado (editar sal, aceite, azúcar y levadura)</Label>
          </div>
          {mostrarAvanzado && (
            <>
              <PercentageControl id="sal" label="Sal" value={sal} onChange={(value) => update("sal", value)} step={0.1} max={5} error={errors.sal} />
              <PercentageControl id="aceite" label="Aceite" value={aceite} onChange={(value) => update("aceite", value)} step={0.1} max={5} error={errors.aceite} />
              <PercentageControl id="azucar" label="Azúcar" value={azucar} onChange={(value) => update("azucar", value)} step={0.1} max={5} error={errors.azucar} />
              <PercentageControl id="levadura" label="Levadura fresca" value={levadura} onChange={(value) => update("levadura", value)} step={0.05} max={2} error={errors.levadura} />
            </>
          )}

          <div className="col-span-1 sm:col-span-2 flex items-center gap-2 border-t pt-4 mt-4">
            <Switch id="prefermento" checked={usarPrefermento} onCheckedChange={(value) => update("usarPrefermento", value)} />
            <Label htmlFor="prefermento">Usar prefermento (Biga o Poolish)</Label>
          </div>
          {usarPrefermento && (
            <div className="col-span-1 sm:col-span-2 space-y-4">
              <div>
                <Label id="tipo-prefermento-label" className="block mb-1">Tipo de prefermento:</Label>
                <RadioGroup value={tipoPrefermento} onValueChange={(value) => update("tipoPrefermento", value as PrefermentType)}
                  aria-labelledby="tipo-prefermento-label" className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="biga" id="biga" /><Label htmlFor="biga">Biga</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="poolish" id="poolish" /><Label htmlFor="poolish">Poolish</Label>
                  </div>
                </RadioGroup>
              </div>
              {tipoPrefermento === "biga" ? (
                <div className="text-sm text-yellow-700 italic">Nota: La biga requiere amasadora para integrarse correctamente.</div>
              ) : (
                <div className="text-sm text-blue-800 italic">Recomendación: El poolish no debe superar el total de agua disponible, ya que tiene hidratación 100%.</div>
              )}
              <div>
                <Label id="prefermento-modo-label" className="block mb-1">Método de entrada:</Label>
                <RadioGroup value={prefermentoModo} onValueChange={(value) => update("prefermentoModo", value as PrefermentMode)}
                  aria-labelledby="prefermento-modo-label" className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="porcentaje" id="porcentaje" /><Label htmlFor="porcentaje">Porcentaje</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nominal" id="nominal" /><Label htmlFor="nominal">Cantidad (g)</Label>
                  </div>
                </RadioGroup>
              </div>
              {prefermentoModo === "porcentaje" ? (
                <PercentageControl id="prefermento-porcentaje" label="Harina en prefermento" value={prefermentoPorcentaje}
                  onChange={(value) => update("prefermentoPorcentaje", value)} min={10} max={100} error={errors.prefermentoPorcentaje} />
              ) : (
                <div>
                  <Label htmlFor="prefermento-harina">Harina en prefermento (g):</Label>
                  <Input id="prefermento-harina" type="number" value={prefermentoHarina}
                    onChange={(event) => update("prefermentoHarina", event.target.value)} inputMode="decimal" min="0" step="any"
                    aria-invalid={Boolean(errors.prefermentoHarina)} aria-describedby={errors.prefermentoHarina ? "prefermento-harina-error" : undefined} />
                  <FieldError id="prefermento-harina-error" message={errors.prefermentoHarina} />
                </div>
              )}
              {amounts && (
                <div className="border-t pt-4 mt-2 space-y-1">
                  <p><strong>Prefermento ({tipoPrefermento}):</strong></p>
                  <p>Harina: {Math.round(amounts.harinaPrefermento)} g</p>
                  <p>Agua: {Math.round(amounts.aguaPrefermento)} g</p>
                  <p>Levadura fresca (0.2%): {amounts.levaduraPrefermento.toFixed(1)} g</p>
                  <p>Harina restante: {Math.round(amounts.harinaFinal)} g</p>
                  <p>Agua restante: {Math.round(amounts.aguaFinal)} g</p>
                </div>
              )}
            </div>
          )}

          <div className="col-span-1 sm:col-span-2 border-t pt-4 mt-4 space-y-1 bg-[#fff1dc] p-4 rounded-xl">
            {amounts ? (
              <div aria-live="polite" aria-atomic="true">
                <p className="font-bold text-[#4b2c20]">Totales calculados:</p>
                <p>Masa total: {Math.round(amounts.masaTotal)} g</p>
                <p>Harina total: {Math.round(amounts.harina)} g</p>
                <p>Agua total: {Math.round(amounts.agua)} g</p>
                <p>Sal ({sal}%): {amounts.salGr} g</p>
                <p>Aceite ({aceite}%): {amounts.aceiteGr} g</p>
                <p>Azúcar ({azucar}%): {amounts.azucarGr} g <span className="text-xs italic">(opcional)</span></p>
                <p>Levadura fresca ({levadura}%): {amounts.levaduraFresca.toFixed(1)} g</p>
                <p>Levadura seca (1/3): {amounts.levaduraSeca.toFixed(1)} g</p>
              </div>
            ) : (
              <div role="status">
                <p className="font-bold text-red-700">Revisa los valores para calcular la receta.</p>
                <ul className="text-sm text-red-700 list-disc pl-5">
                  {Object.entries(errors).map(([field, message]) => <li key={field}>{message}</li>)}
                </ul>
              </div>
            )}
            <div className="pt-4">
              <Button type="button" onClick={handleExport} disabled={!amounts} className="flex gap-2 items-center bg-green-600 hover:bg-green-700 text-white">
                <Download className="w-4 h-4" aria-hidden="true" /> Exportar a TXT
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <InstallButton />
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };
  return deferredPrompt ? (
    <button type="button" onClick={handleInstallClick} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Instalar app</button>
  ) : null;
}
