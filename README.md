# Calculadora de Pizza

Aplicación React y Vite para calcular ingredientes con o sin prefermento.

## Desarrollo

Entorno comprobado con Node.js 24 y npm 11.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run typecheck
npm run build
```

## Cálculo

- **Cantidad de pizzas:** introduce el número entero de pizzas y el peso de cada bola. Se inicia con 3 pizzas de 250 g.
- **Cantidad de harina:** introduce la harina disponible y calcula el agua y los demás ingredientes a partir de ella. Se inicia con 500 g de harina.
- Los porcentajes se pueden escribir directamente o ajustar con los botones. Sal, aceite, azúcar y levadura se editan en el modo avanzado.
- La hidratación admite del 50 al 80%. El porcentaje de harina en prefermento admite del 10 al 100%, dentro del agua disponible.
- El poolish usa tanta agua como harina; la biga usa la mitad de agua que de harina. Ningún prefermento puede superar la harina o el agua totales.
- Los valores vacíos, negativos o fuera de los límites muestran un mensaje y desactivan la exportación. Corregirlos restaura los resultados.
- Cambiar de modo conserva las cantidades introducidas durante la sesión.

Las pruebas de `tests/calculator.test.ts` cubren ambos modos, proporciones, validación y límites de prefermento.
