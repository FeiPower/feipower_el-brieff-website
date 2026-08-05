---
type: Playbook
title: Brief fotográfico — Arturo Salazar (El Brieff)
description: Instrucciones para sesión fotográfica profesional del conductor; incluye prompts GenAI por uso final con referencia facial.
tags: [brand, photo, media-kit, cover, host, genai]
status: draft
audience: photographer
generated: { by: agent/composer, at: 2026-08-04T16:20:00Z }
verified: { by: null, at: null }
sources:
  - id: design
    resource: ../../DESIGN.md
    title: DESIGN.md (sistema visual cover-first)
  - id: cover
    resource: ./cover-art.md
    title: Cover art — elbrieff-cover.png
  - id: media-kit
    resource: ./media-kit.md
    title: Media kit — headshot pendiente
  - id: about
    resource: ../requirements/fr-005-about-host.md
    title: FR-005 About host
---

# Brief fotográfico — Arturo Salazar / El Brieff

Documento para **enviar al fotógrafo** y para **generación GenAI** con referencia facial. Objetivo: obtener un set de retratos editoriales del conductor **Arturo Salazar Bazúa** (`@elchearturo`) alineados a la identidad cover-first de **El Brieff** (productora: Brieffy).

Referencia visual canónica: [`elbrieff-cover.png`](../../elbrieff-cover.png) — [cover-art.md](cover-art.md). Prompts por uso final: [§6](#6-prompts-genai-por-uso-final).

---

## 1. Contexto de marca

| Campo | Valor |
|-------|--------|
| Producto | Podcast diario de noticias y análisis breve |
| Mood | Editorial, preciso, sobrio, confiable, contemporáneo |
| Fondo de marca | Carbón verdoso `#121C16` (no negro puro) — **fondo preferido del retrato base** (validado) |
| Vestimenta de referencia en portada | Blazer navy, camisa azul clara (o gingham suave), pañuelo verde |
| Uso principal | Portada de plataformas, sitio web (About / hero), media kit PDF, redes y prensa |

No hace falta recrear tipografía en set. El wordmark **EL / BRI / EFF** y la firma **Brieffy** se componen en postproducción sobre el asset de portada.

---

## 2. Sujeto y look

- **Sujeto:** Arturo Salazar Bazúa.
- **Expresión base:** mirada a cámara, sonrisa suave o gesto serio-accesible; inteligencia y cercanía, sin pose de “influencer”.
- **Aseo:** cabello ordenado; barba/bigote limpios si aplica el look habitual.
- **Wardrobe (traer 2–3 opciones):**
  1. **Look A (canónico portada):** blazer navy + camisa azul clara o cuadro fino + pañuelo verde (o acento verde en bolsillo).
  2. **Look B (prensa / About):** blazer o saco oscuro + camisa lisa clara, sin corbata o con cuello abierto.
  3. **Look C (opcional editorial):** same vibe sobria; evitar logos grandes, gorras, deportivo.
- **Evitar:** estampados ruidosos, rojo intenso, neones, lentes de sol, joyería que distraiga el rostro.

---

## 3. Set técnico (obligatorio)

| Tema | Especificación |
|------|----------------|
| Fondo | **Preferido:** sólido `#121C16` (verde carbón oscuro de marca). **Alternativa cutout:** blanco / gris claro o chroma — solo si se necesita PNG transparente |
| Iluminación | Soft key + fill; definir silueta y cara sin sombras duras en ojos/mejillas |
| Separación | Contorno claro sujeto/fondo (rim suave permitido; sobre `#121C16` evitar que el sujeto se “fusione”) |
| Óptica | 85–135 mm equiv. preferible; evitar gran angular que deforme cara |
| Enfoque | Ojos nítidos; DOF suficiente para orejas/hombros |
| Color | Balance neutro; entregar también RAW |
| Resolución mínima | **4000 px** en el lado largo (ideal ≥ 5000 px) |
| Formatos de entrega | RAW + JPEG alta calidad + **PNG con transparencia** del cutout principal (si se disparó sobre blanco/gris/chroma) |

**Decisión de fondo (retrato base):** `#121C16`. Blanco/gris queda como set secundario para recorte, no como look principal de GenAI ni de entrega “hero”.

Si no hay chroma y se necesita cutout: fondo blanco/gris uniforme, sin textura ni sombras proyectadas fuertes sobre el fondo.

---

## 4. Lista de tomas (qué fotos y para qué)

Prioridad: **P0** imprescindible · **P1** muy recomendable · **P2** nice-to-have.

### P0 — Cutout para portada (reemplazo / refresh de cover)

| Campo | Valor |
|-------|--------|
| Código | `COV-01` |
| Plano | **Medio corto / pecho-arriba** (chest-up). Corte inferior aprox. a mitad de torso o un poco bajo el pecho |
| Ángulo | ¾ cuerpo (hombros ligeramente girados) + **rostro a cámara** |
| Posición en cuadro | Sujeto **a la derecha** del frame, con **aire a la izquierda** (espacio negativo para tipografía EL/BRI/EFF) |
| Proporción de captura | Preferir **3:4 vertical** o **4:5** full-frame del sujeto; el diseñador recortará a composición 1:1 de portada |
| Entrega clave | 1–3 selects + **PNG transparente** (silueta limpia, sin halo) |
| Uso | Portada podcast 1:1, OG/share, hero de marca |

**Notas de composición (como la portada actual):**

- Cabeza y hombros ocupan el tercio derecho; no centrar el sujeto.
- Dejar margen arriba del cabello (~5–8 % del alto) para no cortar en crop 1:1.
- Manos fuera de frame o apenas visibles; prioridad cara + solapa del blazer + pañuelo.

### P0 — Headshot editorial (media kit + About + schema Person)

| Campo | Valor |
|-------|--------|
| Código | `HEAD-01` |
| Plano | **Primer plano / head-and-shoulders** (cabeza + hombros) |
| Ángulo | Frontal o ¾ suave; mirada a cámara |
| Posición | **Centrado** (o casi); simetría limpia para prensa |
| Proporciones a entregar (crops) | **1:1** (avatar / ficha) y **4:5** (prensa / About) |
| Captura sugerida | Vertical 4:5 o 3:4 con aire para recortar ambos |
| Uso | Media kit PDF, página About, foto de perfil prensa, JSON-LD `Person.image` |

### P1 — Retrato medio (web / redes)

| Campo | Valor |
|-------|--------|
| Código | `MID-01` |
| Plano | **Plano medio** (cintura-arriba) |
| Ángulo | ¾; una versión mirada a cámara y una mirada fuera (editorial) |
| Proporciones | **3:4** y crop **16:9** horizontal (sujeto a la derecha o izquierda con negativo) |
| Uso | Secciones About, banners web, LinkedIn/prensa horizontal |

### P1 — Variante expresión / micro-gestos (mismas poses P0)

| Campo | Valor |
|-------|--------|
| Código | `EXP-01` |
| Variantes | (a) sonrisa suave · (b) serio-confiable · (c) leve sonrisa con dientes si natural |
| Cantidad | 2–3 selects por look A |
| Uso | A/B de portada y redes sin re-disparar |

### P2 — Vertical redes / Stories

| Campo | Valor |
|-------|--------|
| Código | `SOC-01` |
| Plano | Pecho-arriba o medio corto |
| Proporción | **9:16** (sujeto en tercio inferior o medio; aire superior para copy) |
| Uso | Stories / Reels / covers verticales de marca |

### P2 — Detalle de presencia (opcional)

| Campo | Valor |
|-------|--------|
| Código | `DET-01` |
| Plano | Detalle solapa + pañuelo, o manos con micrófono de estudio (si hay prop) |
| Uso | Media kit / mood editorial; no sustituye headshot ni cover |

---

## 5. Resumen rápido de proporciones

| Uso final | Ratio | Toma fuente | Notas |
|-----------|-------|-------------|--------|
| Portada podcast / OG | **1:1** | `COV-01` cutout | Tipografía va a la izquierda en diseño |
| Avatar / ficha | **1:1** | `HEAD-01` | Rostro centrado |
| About / prensa | **4:5** | `HEAD-01` o `MID-01` | Vertical editorial |
| Banner / LinkedIn | **16:9** | `MID-01` | Sujeto a un lado + negativo |
| Stories | **9:16** | `SOC-01` | Aire para texto |

---

## 6. Prompts GenAI (por uso final)

Usar cuando se genere o itere el retrato con un modelo de imagen (p. ej. referencia facial + prompt). **No sustituyen** la sesión profesional; sirven para mockups, A/B de composición o assets provisionales hasta selects reales.

**Fondo del retrato base (congelado):** verde carbón oscuro **`#121C16`**. No usar blanco/gris como default GenAI salvo variante explícita de cutout.

### Cómo usar la referencia facial

1. Adjuntar **2–4 fotos reales** de Arturo Salazar (rostro nítido, ángulos distintos, buena luz). Preferir tomas cercanas al look final.
2. Indicar al modelo: *preserve the exact face identity from the reference photos*.
3. Pedir el **aspect ratio** del uso final (abajo).
4. **No** pedir tipografía EL/BRI/EFF ni firma Brieffy en la generación de portada: el wordmark se compone en diseño sobre el cutout.
5. Si el modelo soporta negative prompt, reutilizar el bloque compartido.

### Negative prompt compartido

```text
deformed face, wrong identity, different person, beauty filter, plastic skin, oversharp, HDR glow, neon lights, red accents, busy background, office clutter, white background, light gray background, pure black background, stock photo vibe, influencer pose, sunglasses, large logos, text, watermark, logo, typography, EL BRIEFF lettering, Brieffy script, cropped forehead, cropped chin, extra fingers, warped hands
```

### Bloque de identidad (pegar al inicio de cada prompt)

```text
Use the attached reference photos of Arturo Salazar Bazúa (@elchearturo). Preserve his exact facial identity, age appearance, hairline, skin tone, and expression style. Photorealistic editorial portrait for the Mexican news podcast El Brieff. Mood: precise, sober, trustworthy, contemporary. Soft studio key + fill light, 85mm look, sharp eyes, natural skin texture. Wardrobe Look A: navy blazer, light blue shirt (subtle check OK), green pocket square. Solid seamless background in deep charcoal-green #121C16 (not pure black, not gray, not white). No text, no logos, no watermarks.
```

---

### Uso final: Portada podcast / OG — ratio **1:1** · toma `COV-01`

```text
[IDENTITY BLOCK]

Square 1:1 composition for podcast cover art base (subject only; typography added later). Medium close-up / chest-up portrait. Subject positioned on the RIGHT third of the frame with generous empty NEGATIVE SPACE on the LEFT for large stacked wordmark. Body angled 3/4, face turned to camera, soft approachable smile. Solid seamless background exactly #121C16 deep charcoal-green (not pure black). Clean silhouette with subtle rim separation from the dark background. Head has 5–8% headroom. Hands out of frame. High resolution, print-ready detail.
```

Aspect ratio: `1:1` · Variante opcional cutout: mismo prompt con fondo blanco/gris claro solo si se necesita PNG transparente.

---

### Uso final: Avatar / ficha — ratio **1:1** · toma `HEAD-01`

```text
[IDENTITY BLOCK]

Square 1:1 centered editorial headshot. Head-and-shoulders framing, face filling the frame comfortably without cropping forehead or chin. Near-frontal angle, eyes to camera, calm confident expression (soft smile or serious-trustworthy). Solid seamless background exactly #121C16. Even soft studio lighting with subtle rim so the subject separates from the dark field; no dramatic shadows on the face. Suitable for press kit avatar, website Person schema, and profile thumbnails. Photorealistic, natural retouch only.
```

Aspect ratio: `1:1`

---

### Uso final: About / prensa — ratio **4:5** · toma `HEAD-01` o `MID-01`

```text
[IDENTITY BLOCK]

Vertical 4:5 editorial portrait for About page and press kit. Head-and-shoulders to light medium shot (just below chest OK). Slight 3/4 body angle, face to camera, intelligent approachable presence — not influencer energy. Centered or lightly off-center. Solid seamless background exactly #121C16. Soft professional studio lighting, magazine quality, subtle rim separation. Looks like an authorized press photo of a news podcast host. No props, no microphone unless barely visible at bottom edge. Photorealistic.
```

Aspect ratio: `4:5`

---

### Uso final: Banner / LinkedIn — ratio **16:9** · toma `MID-01`

```text
[IDENTITY BLOCK]

Wide 16:9 horizontal banner portrait for web/LinkedIn/press. Medium shot (waist-up). Subject placed on the RIGHT (or LEFT) third with large empty NEGATIVE SPACE on the opposite side for headline copy. Body 3/4, face toward camera OR subtle editorial glance past camera (generate both if possible; prefer eyes to camera as primary). Solid or softly graduated background exactly #121C16, no clutter. Soft key + fill, cinematic but sober. No text in image. Photorealistic editorial photography.
```

Aspect ratio: `16:9`

---

### Uso final: Stories / Reels — ratio **9:16** · toma `SOC-01`

```text
[IDENTITY BLOCK]

Vertical 9:16 story/reel cover base. Chest-up or medium-close portrait. Subject in the LOWER or MIDDLE third of the frame with generous EMPTY SPACE in the UPPER third for on-screen captions. Face to camera, soft smile, confident podcast-host energy without hype. Solid seamless background exactly #121C16 for brand overlays. Soft studio light, sharp eyes, natural skin, subtle rim separation. No UI mockups, no stickers, no text. Photorealistic.
```

Aspect ratio: `9:16`

---

### Notas de generación

| Uso final | Ratio | Prioridad de composición | Fondo |
|-----------|-------|--------------------------|-------|
| Portada / OG | 1:1 | Sujeto a la **derecha** + negativo izquierda | `#121C16` |
| Avatar / ficha | 1:1 | **Centrado**, head-and-shoulders | `#121C16` |
| About / prensa | 4:5 | Vertical editorial, prensa | `#121C16` |
| Banner / LinkedIn | 16:9 | Sujeto a un lado + negativo para copy | `#121C16` |
| Stories | 9:16 | Sujeto abajo/medio + aire superior | `#121C16` |

Sustituir `[IDENTITY BLOCK]` por el bloque de identidad de arriba (o dejarlo inline). Tras generar: validar parecido facial con referencias; si falla identidad, regenerar con más fotos de referencia o weight/strength más alto en face lock (según herramienta).

---

## 7. Cantidades mínimas de entrega

| Entregable | Mínimo |
|------------|--------|
| Selects retocados (JPEG/PNG) | 8–12 (cubrir P0 + P1) |
| Cutout portada PNG transparente | ≥ 2 (Look A, expresiones distintas) |
| Headshot 1:1 + 4:5 | ≥ 1 set (mismo select, dos crops) |
| RAW de selects | Todos los selects entregados |
| Contact sheet / galería de selects | PDF o carpeta numerada con códigos `COV-01`, `HEAD-01`, etc. |

Retoque: piel natural (sin filtro plástico); quitar polvo de ropa; limpiar fondo; **no** cambiar color de blazer/pañuelo fuera de la familia de marca.

---

## 8. Do / Don’t

**Do**

- Disparar pensando en **recorte** y en **espacio negativo** a la izquierda para tipografía.
- Mantener consistencia de luz entre tomas del mismo look.
- Entregar archivos con nombres claros: `el-brieff_arturo_COV-01_a.png`, etc.

**Don’t**

- Fondos texturizados, oficinas distractoras o bokeh “lifestyle” como único material (pueden ser extras, no el set principal).
- Cortes que maten la frente o la barbilla en headshot.
- Centrar al sujeto en la toma de portada (`COV-01`).
- Over-sharpen / HDR agresivo / blanqueado irreal.

---

## 9. Checklist de sesión (fotógrafo)

- [ ] Fondo limpio para cutout
- [ ] Look A (navy + azul + acento verde) listo
- [ ] `COV-01` pecho-arriba, sujeto a la derecha, aire izquierda
- [ ] `HEAD-01` centrado, 1:1 y 4:5
- [ ] `MID-01` 3:4 y opción 16:9
- [ ] 2–3 micro-expresiones Look A
- [ ] (Opcional) `SOC-01` 9:16
- [ ] RAW + JPEG + PNG transparente de cutouts P0

---

## 10. Contacto de marca (producción)

| Rol | Contacto |
|-----|----------|
| Prensa / conductor | `arturo@strtgy.ai` |
| Operativo / Cc | `mar@strtgy.ai` |

Aprobación final de selects: stakeholder El Brieff / Brieffy. Tras aprobación, actualizar [cover-art.md](cover-art.md), [media-kit.md](media-kit.md) (quitar “headshot pendiente”) y `DESIGN.md` si cambia el asset canónico.

---

## Related

- [Cover art](cover-art.md)
- [Media kit](media-kit.md)
- [FR-005 About host](../requirements/fr-005-about-host.md)
- [DESIGN.md](../../DESIGN.md)
