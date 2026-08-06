name: El Brieff
description: Sistema visual editorial para un podcast de noticias y análisis breve conducido por Arturo Salazar. La identidad prioriza claridad, velocidad, confianza y lectura inmediata. Fuente de verdad de portada: elbrieff-cover.png.
# Prototipos de UI (antes de código): Google Stitch
# https://stitch.withgoogle.com/projects/16391393389959999592
# Doc OKF: el-brieff-okf/architecture/stitch-ui.md
ui_prototypes:
  tool: "Google Stitch"
  project_url: "https://stitch.withgoogle.com/projects/16391393389959999592"
  project_id: "16391393389959999592"
  okf: "el-brieff-okf/architecture/stitch-ui.md"
brand_attributes:
  - Editorial
  - Preciso
  - Actual
  - Sobrio
  - Confiable
  - Ágil

# Portada canónica actual (plataformas / OG / hero)
cover_asset: "elbrieff-cover.png"
cover_composition:
  format: "1:1"
  layout: "Tipografía apilada EL / BRI / EFF a la izquierda; retrato del conductor a la derecha; firma Brieffy en script arriba a la derecha"
  background: "Carbón verdoso profundo (#121C16), no negro puro"
  wordmark: "Sans geométrica extrabold, blanca, tracking amplio, tres líneas"
  producer_mark: "Brieffy en script/cursive blanco"

# Logo canónico del podcast (UI / favicon / schema)
logo_asset: "public/el-brieff-logo-compact.svg"
logo:
  status: "approved"
  source: "public/el-brieff-logo-compact.svg"
  purpose: "Marca tipográfica oficial EL / BRI / EFF para hero, chrome, favicon y logo de schema.org"
  format: "SVG vectorial"
  composition: "Wordmark apilado EL / BRI / EFF en blanco (#FEFEFE) sobre fondo transparente; lockup compacto sin letterbox"
  config_key: "site.logo → /el-brieff-logo-compact.svg"
  related:
    stacked_export: "public/el-brieff-logo.svg — exportación apilada alternativa; no es el logo de UI"
  usage:
    - "Señal de marca del hero web y del hero de /about (img SVG; no tipografía HTML seleccionable)"
    - "Favicon del sitio (image/svg+xml) — glifos claros; se lee sobre chrome oscuro / tema del navegador"
    - "Brand mark en SiteHeader fuera de home y /about (esas páginas ya llevan el logo en su hero)"
    - "publisher.logo en JSON-LD de artículos"
  constraints:
    - "Usar el-brieff-logo-compact.svg en todos los aplicativos del sitio (no el-brieff-logo.svg)"
    - "Fondo transparente: solo tinta clara; el color de superficie lo aporta el layout (primary)"
    - "No duplicar el logo en header + hero en home ni /about"
    - "No sustituir el logo SVG por tipografía HTML EL/BRI/EFF seleccionable en hero ni /about"
    - "No sustituye elbrieff-cover.png en plataformas de podcast, OG ni share cards"
    - "No añadir plate/fondo al SVG maestro; no recolorear a tinta oscura sin variante aprobada"
    - "Escalar preservando aspect ratio; no aplastar el stacking EL/BRI/EFF"

approved_variants:
  web_hero_cutout:
    status: "approved"
    source: "public/arturo-cover-cut-out.png"
    purpose: "Retrato cut-out para el hero web (logo SVG + presencia humana)"
    composition: "Retrato de Arturo sobre negro, sin wordmark ni firma Brieffy en el raster; el lockup tipográfico es public/el-brieff-logo-compact.svg"
    constraints:
      - "Usar solo en el hero web junto a el-brieff-logo-compact.svg; no sustituye elbrieff-cover.png en plataformas/OG"
      - "Mantener un solo plano de fondo (primary); evitar cajas o fills que dupliquen el carbón verdoso"
      - "Servir variantes responsivas AVIF/WebP desde public/hero/ (npm run optimize:hero); PNG solo como fallback"
      - "No reemplaza el asset canónico en plataformas, OG ni share cards"
  media_kit_cover:
    status: "approved"
    source: "src/print/media-kit.html"
    purpose: "Portada vertical A4 para el kit de prensa"
    composition: "Lockup EL / BRI / EFF a la izquierda, firma Brieffy arriba y retrato editorial de Arturo a la derecha sobre carbón verdoso"
    constraints:
      - "Mantener la paleta, el wordmark apilado y la firma de la portada canónica"
      - "Usar únicamente retratos editoriales aprobados de Arturo Salazar"
      - "No reemplaza el asset canónico en plataformas, OG ni share cards"

colors:
  # Extraídos / alineados a elbrieff-cover.png
  primary: "#121C16"      # fondo de portada (carbón verdoso)
  secondary: "#566899"    # navy del blazer (acento de vestimenta / UI secundaria)
  tertiary: "#78A08A"     # verde del pañuelo (acento de marca puntual)
  accent: "#A0BFE5"       # azul camisa (links / highlights suaves)
  ink: "#FFFFFF"          # tipografía principal sobre primary
  muted: "#A3ACA8"        # metadatos sobre dark (≥7:1 AAA vs primary)
  surface: "#121C16"      # superficie base del sitio (cover-first)
  surface-elevated: "#1A2420"
  border: "#2A3530"
  # Superficie clara opcional para fichas/contenido largo (no es el default de marca)
  surface-light: "#F5F6F7"
  ink-on-light: "#121C16"

typography:
  display-wordmark:
    fontFamily: "Montserrat"   # proxy de la sans geométrica extrabold de portada
    fontSize: "clamp(2.5rem, 8vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "0.06em"
    textTransform: uppercase
    notes: "Composición EL / BRI / EFF en tres líneas; no aplastar el tracking"
  producer-script:
    fontFamily: "Caveat"       # proxy del script Brieffy en portada; sustituir si hay font propietaria
    fontSize: "1.25rem"
    fontWeight: 500
    notes: "Solo para la marca Brieffy / firma productora; no usar en body"
  h1:
    fontFamily: "Montserrat"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.05
  h2:
    fontFamily: "Montserrat"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.1
  body-md:
    fontFamily: "Source Sans 3"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label-caps:
    fontFamily: "Montserrat"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.08em"
    textTransform: uppercase

rounded:
  sm: 4px
  md: 10px
  lg: 16px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px

visual_system:
  style: "Editorial digital cover-first"
  imagery: "Logo canónico el-brieff-logo-compact.svg; portada elbrieff-cover.png; retratos sobrios del conductor; tipografía apilada como señal de marca; evitar collages que compitan con el wordmark"
  composition: "Alto contraste tipográfico sobre fondo oscuro; logo o wordmark como ancla; retrato como presencia humana; módulos limpios debajo del hero"
  mood: "Inteligente, directo, confiable, contemporáneo"
  do:
    - "Tratar public/el-brieff-logo-compact.svg como logo canónico (header, favicon, schema logo)"
    - "Tratar elbrieff-cover.png como asset de marca canónico para plataformas, OG y share cards"
    - "En el hero web, usar arturo-cover-cut-out.png + el-brieff-logo-compact.svg (composición cover-first)"
    - "Priorizar legibilidad y contraste blanco-sobre-primary"
    - "Usar titulares cortos y contundentes; respetar el stacking EL/BRI/EFF del logo"
    - "Mantener consistencia en formatos de portada y assets sociales"
  dont:
    - "Sustituir la portada canónica en plataformas/OG por mockups genéricos o stock"
    - "Duplicar el logo (header + hero) en el mismo viewport"
    - "Reemplazar el logo SVG del hero con tipografía HTML seleccionable EL/BRI/EFF"
    - "Usar el logo SVG como og:image o portada de plataformas"
    - "Fondos claros como default de marca (solo superficies light auxiliares)"
    - "Acentos rojo/azul genéricos ajenos a la portada"
    - "Exceso de textura, grunge o paletas cálidas/nostálgicas"
    - "Recursos visuales que compitan con el mensaje o el wordmark"
