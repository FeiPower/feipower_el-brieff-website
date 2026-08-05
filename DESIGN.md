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
approved_variants:
  media_kit_cover:
    status: "approved"
    source: "src/print/media-kit.html"
    purpose: "Portada vertical A4 para el kit de prensa"
    composition: "Lockup EL / BRI / EFF a la izquierda, firma Brieffy arriba y retrato editorial de Arturo a la derecha sobre carbón verdoso"
    constraints:
      - "Mantener la paleta, el wordmark apilado y la firma de la portada canónica"
      - "Usar únicamente retratos editoriales aprobados de Arturo Salazar"
      - "No reemplaza el asset canónico en plataformas, OG ni hero web"

colors:
  # Extraídos / alineados a elbrieff-cover.png
  primary: "#121C16"      # fondo de portada (carbón verdoso)
  secondary: "#566899"    # navy del blazer (acento de vestimenta / UI secundaria)
  tertiary: "#78A08A"     # verde del pañuelo (acento de marca puntual)
  accent: "#A0BFE5"       # azul camisa (links / highlights suaves)
  ink: "#FFFFFF"          # tipografía principal sobre primary
  muted: "#9AA3A0"        # metadatos sobre dark
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
  imagery: "Portada canónica elbrieff-cover.png; retratos sobrios del conductor; tipografía apilada como señal de marca; evitar collages que compitan con el wordmark"
  composition: "Alto contraste tipográfico sobre fondo oscuro; wordmark como ancla; retrato como presencia humana; módulos limpios debajo del hero"
  mood: "Inteligente, directo, confiable, contemporáneo"
  do:
    - "Tratar elbrieff-cover.png como asset de marca canónico (plataformas, OG, hero)"
    - "Priorizar legibilidad y contraste blanco-sobre-primary"
    - "Usar titulares cortos y contundentes; respetar el stacking EL/BRI/EFF cuando se cite el wordmark"
    - "Mantener consistencia en formatos de portada y assets sociales"
  dont:
    - "Sustituir la portada por mockups genéricos o stock"
    - "Fondos claros como default de marca (solo superficies light auxiliares)"
    - "Acentos rojo/azul genéricos ajenos a la portada"
    - "Exceso de textura, grunge o paletas cálidas/nostálgicas"
    - "Recursos visuales que compitan con el mensaje o el wordmark"
