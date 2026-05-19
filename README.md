# Example Insurance – Reestructuración de Deuda (Frontend)

Frontend responsive de un flujo de **reestructuración de deuda** hecho con **Vite + React + Tailwind CSS**.  
Incluye 6 pantallas: bienvenida/validación, selección de plan, verificación, contrato (T&C), espera y confirmación.

---

## Requisitos

- **Node.js 18+** (recomendado 18 LTS o 20 LTS)
- npm / pnpm / yarn (los ejemplos usan **npm**)

## Comenzar

```bash
# 1) Instala dependencias
npm install

# 2) Levanta el servidor de desarrollo
npm run dev
# Abre http://localhost:5173 (o el puerto que indique Vite)

# 3) Build para producción
npm run build

# 4) Previsualiza el build
npm run preview
```

---

## Estructura del proyecto

```
suma-financiera-restructuracion-frontend/
├─ public/
├─ src/
│  ├─ assets/
│  │  ├─ pantalla1.png          # imagen de la primera tarjeta
│  │  └─ clock.png              # imagen del loader “Un momento…”
│  ├─ components/
│  │  └─ layout/
│  │     ├─ Header.jsx          # logo centrado + botón “Salir” (oculto en '/')
│  │     └─ Footer.jsx
│  ├─ pages/
│  │  ├─ IntroVerification.jsx  # Pantalla 1: Bienvenida/validación de fecha
│  │  ├─ PlanSelection.jsx      # Pantalla 2: Plan de pago (3 tarjetas)
│  │  ├─ Verification.jsx       # Pantalla 3: Verificación del plan elegido
│  │  ├─ Contract.jsx           # Pantalla 4: Contrato (Términos y condiciones)
│  │  ├─ LoadingAdjust.jsx      # Pantalla 5: “Un momento…” + spinner
│  │  └─ Confirmation.jsx       # Pantalla 6: Confirmación final
│  ├─ App.jsx                   # Rutas + layout global (Header/Footer)
│  ├─ main.jsx                  # Bootstrap de React
│  └─ index.css                 # Tailwind (base/components/utilities)
├─ index.html
├─ package.json
├─ tailwind.config.cjs
├─ postcss.config.cjs
└─ vite.config.js
```

---

## Rutas

- `/` – **IntroVerification**  
- `/plan` – **PlanSelection**  
- `/verificacion` – **Verification**  
- `/contrato` – **Contract**  
- `/ajustando` – **LoadingAdjust**  
- `/confirmacion` – **Confirmation**

> El **Header** muestra el logo centrado en todas las pantallas. El botón **“Salir”** aparece en cualquier ruta **≠ '/'** y regresa a la pantalla inicial (limpiando selección).

---

## Persistencia (temporal)

Se usan claves en `localStorage` para pasar datos entre pantallas:

- `suma-financiera:clienteNombre` – nombre del cliente (se setea en `IntroVerification.jsx`)
- `suma-financiera:selectedPlan` – plan seleccionado (se setea en `PlanSelection.jsx`)
- `suma-financiera:loan` – snapshot de datos del préstamo usado en vistas siguientes

> Si algo se “queda pegado”, borra el storage desde la consola:
```js
localStorage.removeItem('suma-financiera:clienteNombre');
localStorage.removeItem('suma-financiera:selectedPlan');
localStorage.removeItem('suma-financiera:loan');
```

---

## Personalización rápida

- **Nombre del cliente (mock):** en `IntroVerification.jsx` cambia la constante `NOMBRE_CLIENTE`.  
- **Imágenes:** reemplaza `src/assets/pantalla1.png` y `src/assets/clock.png`.  
- **Colores/estilos:** ajusta clases Tailwind en los componentes; si quieres tokens globales, edítalos en `tailwind.config.cjs`.  
- **Stepper:** cada página incluye su propio Stepper con `current={1|2|3}`; pinta el paso activo en verde.

---

## Solución de problemas

- **Tailwind no aplica estilos:**  
  - Verifica que `src/index.css` tenga **solo**:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
  - Asegura que `tailwind.config.cjs` tenga:
    ```js
    module.exports = {
      content: ["./index.html", "./src/**/*.{js,jsx}"],
      theme: { extend: {} },
      plugins: [],
    }
    ```
  - Reinicia el server: `npm run dev`.

- **Faltan plugins de Vite/React:**  
  ```bash
  npm i -D @vitejs/plugin-react vite tailwindcss postcss autoprefixer
  npm i react react-dom react-router-dom
  ```

- **Node incompatible:** Vite 5 requiere **Node 18+**. Comprueba con `node -v`.

---

## Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## Deploy

El build (`npm run build`) genera archivos estáticos en `dist/`.  
Súbelos a cualquier hosting estático: **Vercel, Netlify, GitHub Pages, S3, Cloudflare Pages**, etc.

---

## Licencia

Uso interno