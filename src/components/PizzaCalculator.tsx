import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function PizzaCalculator() {
  const [pizzas, setPizzas] = useState("3");
  const [pesoBola, setPesoBola] = useState("250");
  const [hidratacion, setHidratacion] = useState(65);
  const [sal, setSal] = useState(2);
  const [aceite, setAceite] = useState(2);
  const [azucar, setAzucar] = useState(1);
  const [levadura, setLevadura] = useState(0.6);
  const [usarPrefermento, setUsarPrefermento] = useState(false);
  const [mostrarAvanzado, setMostrarAvanzado] = useState(false);
  const [tipoPrefermento, setTipoPrefermento] = useState("poolish");
  const [prefermentoModo, setPrefermentoModo] = useState("porcentaje");
  const [prefermentoPorcentaje, setPrefermentoPorcentaje] = useState("50");
  const [prefermentoHarina, setPrefermentoHarina] = useState("0");

  const parseOrZero = (val) => parseFloat(val) || 0;
  const masaTotal = parseOrZero(pizzas) * parseOrZero(pesoBola);
  const harina = masaTotal / (1 + hidratacion / 100 + sal / 100 + aceite / 100 + azucar / 100);
  const agua = harina * (hidratacion / 100);
  const salGr = Math.round(harina * (sal / 100));
  const aceiteGr = Math.round(harina * (aceite / 100));
  const azucarGr = Math.round(harina * (azucar / 100));
  const levaduraFresca = harina * (levadura / 100);
  const levaduraSeca = levaduraFresca / 3;

  const harinaPrefermento = prefermentoModo === "porcentaje" ? harina * (parseOrZero(prefermentoPorcentaje) / 100) : parseOrZero(prefermentoHarina);
  const aguaPrefermento = tipoPrefermento === "biga" ? harinaPrefermento * 0.5 : harinaPrefermento;
  const levaduraPrefermento = harinaPrefermento * 0.002;
  const harinaFinal = harina - harinaPrefermento;
  const aguaFinal = agua - aguaPrefermento;
  const excedeLimitePoolish = tipoPrefermento === "poolish" && harinaPrefermento > agua;

  const handleExport = () => {
    const contenido = `Masa total: ${Math.round(masaTotal)} g\nHarina total: ${Math.round(harina)} g\nAgua total: ${Math.round(agua)} g\nSal (${sal}%): ${salGr} g\nAceite (${aceite}%): ${aceiteGr} g\nAzúcar (${azucar}%): ${azucarGr} g (opcional)\nLevadura fresca (${levadura}%): ${levaduraFresca.toFixed(1)} g\nLevadura seca (1/3): ${levaduraSeca.toFixed(1)} g`;
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pizza-calculo.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTextInput = (setter) => (e) => setter(e.target.value);

  const renderStepper = (label, value, setter, step = 1, min = 0, max = 100) => (
    <div className="col-span-1 sm:col-span-2">
      <Label className="block mb-1">{label}: {value}%</Label>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setter(Math.max(min, parseFloat((value - step).toFixed(2))))}><Minus className="h-4 w-4" /></Button>
        <span className="min-w-[50px] text-center">{value}%</span>
        <Button variant="outline" size="icon" onClick={() => setter(Math.min(max, parseFloat((value + step).toFixed(2))))}><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 bg-[#fff7ed] rounded-2xl shadow-lg border border-[#e6c3a5]">
      <Card className="rounded-xl shadow-inner bg-[#fffdf8]">
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-[#3e2f20]">
          <h1 className="col-span-1 sm:col-span-2 text-3xl font-extrabold text-center text-[#9c4221]">🍕 Calculadora de Pizza</h1>

          <Label>Cuántas pizzas:</Label>
          <Input type="number" value={pizzas} onChange={handleTextInput(setPizzas)} inputMode="numeric" min="1" />

          <Label>Peso por bola (g):</Label>
          <Input type="number" value={pesoBola} onChange={handleTextInput(setPesoBola)} inputMode="numeric" min="1" />

          {renderStepper("Hidratación", hidratacion, setHidratacion, 1, 50, 80)}

          <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
            <Switch checked={mostrarAvanzado} onCheckedChange={setMostrarAvanzado} />
            <Label>Modo avanzado (editar sal, aceite, azúcar y levadura)</Label>
          </div>

          {mostrarAvanzado && (
            <>
              {renderStepper("Sal", sal, setSal, 0.1, 0, 5)}
              {renderStepper("Aceite", aceite, setAceite, 0.1, 0, 5)}
              {renderStepper("Azúcar", azucar, setAzucar, 0.1, 0, 5)}
              {renderStepper("Levadura fresca", levadura, setLevadura, 0.05, 0, 2)}
            </>
          )}

          <div className="col-span-1 sm:col-span-2 flex items-center gap-2 border-t pt-4 mt-4">
            <Switch checked={usarPrefermento} onCheckedChange={setUsarPrefermento} />
            <Label>Usar prefermento (Biga o Poolish)</Label>
          </div>

          {usarPrefermento && (
            <div className="col-span-1 sm:col-span-2 space-y-4">
              <div>
                <Label className="block mb-1">Tipo de prefermento:</Label>
                <RadioGroup value={tipoPrefermento} onValueChange={setTipoPrefermento} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="biga" id="biga" className="h-4 w-4 rounded-full border border-gray-400 text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500" />
                    <Label htmlFor="biga">Biga</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="poolish" id="poolish" className="h-4 w-4 rounded-full border border-gray-400 text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500" />
                    <Label htmlFor="poolish">Poolish</Label>
                  </div>
                </RadioGroup>
              </div>

              {tipoPrefermento === "biga" && (
                <div className="text-sm text-yellow-700 italic">
                  Nota: La biga requiere amasadora para integrarse correctamente.
                </div>
              )}

              {tipoPrefermento === "poolish" && (
                <div className="text-sm text-blue-800 italic">
                  Recomendación: El poolish no debe superar el total de agua disponible, ya que tiene hidratación 100%.
                </div>
              )}

              <div>
                <Label className="block mb-1">Método de entrada:</Label>
                <RadioGroup value={prefermentoModo} onValueChange={setPrefermentoModo} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="porcentaje" id="porcentaje" className="h-4 w-4 rounded-full border border-gray-400 text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500" />
                    <Label htmlFor="porcentaje">Porcentaje</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nominal" id="nominal" className="h-4 w-4 rounded-full border border-gray-400 text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500" />
                    <Label htmlFor="nominal">Cantidad (g)</Label>
                  </div>
                </RadioGroup>
              </div>

              {prefermentoModo === "porcentaje"
                ? renderStepper("% de harina en prefermento", parseFloat(prefermentoPorcentaje), (val) => setPrefermentoPorcentaje(val.toString()), 1, 10, 100)
                : (
                  <>
                    <Label>Harina en prefermento (g):</Label>
                    <Input
                      type="number"
                      value={prefermentoHarina}
                      onChange={handleTextInput(setPrefermentoHarina)}
                      inputMode="numeric"
                      min="1"
                    />
                  </>
                )}

              {excedeLimitePoolish && (
                <div className="text-sm text-red-700 italic">
                  ⚠️ Atención: El poolish no debería tener más harina que la cantidad total de agua disponible ({Math.round(agua)} g).
                </div>
              )}

              <div className="border-t pt-4 mt-2 space-y-1">
                <p><strong>Prefermento ({tipoPrefermento}):</strong></p>
                <p>Harina: {Math.round(harinaPrefermento)} g</p>
                <p>Agua: {Math.round(aguaPrefermento)} g</p>
                <p>Levadura fresca (0.2%): {levaduraPrefermento.toFixed(1)} g</p>
                <p>Harina restante: {Math.round(harinaFinal)} g</p>
                <p>Agua restante: {Math.round(aguaFinal)} g</p>
              </div>
            </div>
          )}

          <div className="col-span-1 sm:col-span-2 border-t pt-4 mt-4 space-y-1 bg-[#fff1dc] p-4 rounded-xl">
            <p className="font-bold text-[#4b2c20]">Totales calculados:</p>
            <p>Masa total: {Math.round(masaTotal)} g</p>
            <p>Harina total: {Math.round(harina)} g</p>
            <p>Agua total: {Math.round(agua)} g</p>
            <p>Sal ({sal}%): {salGr} g</p>
            <p>Aceite ({aceite}%): {aceiteGr} g</p>
            <p>Azúcar ({azucar}%): {azucarGr} g <span className="text-xs italic">(opcional)</span></p>
            <p>Levadura fresca ({levadura}%): {levaduraFresca.toFixed(1)} g</p>
            <p>Levadura seca (1/3): {levaduraSeca.toFixed(1)} g</p>
            <div className="pt-4">
              <Button onClick={handleExport} className="flex gap-2 items-center bg-green-600 hover:bg-green-700 text-white">
                <Download className="w-4 h-4" /> Exportar a TXT
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
