---
name: media-kit-comercial
overview: Transformar el actual kit de prensa en un sistema modular para prensa, venta, colaboraciones, entrevistas y conferencias, usando métricas reales y un flujo de validación de Arturo Salazar en Notion.
todos:
  - id: metric-audit
    content: Validar exportaciones de Spotify y definir el diccionario de métricas históricas publicables
    status: pending
  - id: notion-validation
    content: Crear tarea de validación para Arturo y enlazar su checklist de decisiones en Notion
    status: pending
  - id: press-kit
    content: Ampliar el Press Kit público con entrevistas y conferencias
    status: pending
  - id: commercial-assets
    content: Crear Media Kit público y plantillas privadas de Dossier Comercial y Media Deck en Notion
    status: pending
  - id: editorial-guardrails
    content: Implementar rutas de contacto y políticas de transparencia comercial
    status: pending
isProject: false
---

# Evolución comercial del media kit

## Enfoque
La investigación indica que conviene mantener una fuente de datos única y publicar salidas con propósitos distintos: **Media Kit** público, **Dossier Comercial** privado, **Press Kit** público y **Media Deck** adaptable. El actual PDF es un kit de prensa de tres páginas, sin métricas de audiencia ni inventario comercial, en [src/print/media-kit.html](d:/proyectos/feipower_el-brieff-website/src/print/media-kit.html). [PRODUCT.md](d:/proyectos/feipower_el-brieff-website/PRODUCT.md) confirma que hoy no existen métricas verificadas; no se añadirán cifras hasta contar con exportaciones de Spotify for Creators validadas por Arturo.

## Alcance y ubicación de entregables
- **Press Kit público:** mantener `src/print/media-kit.html` como fuente del PDF público, ampliado con entrevistas y conferencias.
- **Media Kit público:** crear una landing HTML pública y un PDF descargable tras el formulario existente; ambos mostrarán únicamente cifras verificadas de Spotify.
- **Dossier Comercial privado:** plantilla editable en Notion, con tarifas bajo cotización, inventario, condiciones y política comercial.
- **Media Deck privado:** plantilla editable en Notion para adaptar propuestas a marcas, aliados y organizadores de eventos.
- **Captación:** conservar un formulario único, clasificado por motivo, enviado a Arturo Salazar con copia a Mar.

## Plan de ejecución
1. Recibir y auditar la exportación de Spotify for Creators. Publicar sólo los últimos 12 meses y 10–20 episodios regulares: mediana a 7 y 30 días, seguidores, consumo/retención y países agregados. Cada cifra conservará fuente, definición, periodo, muestra y fecha; no se agregarán ni extrapolarán datos de Apple, YouTube u otras plataformas.
2. Crear una tarea en el tablero de El Brieff, asignada a Arturo Salazar y enlazada a una página de checklist y decisiones en Notion. La validación cubrirá oferta, tarifas bajo cotización, categorías restringidas, límites editoriales, métricas y biografías de prensa/conferencias.
3. Extender [src/print/media-kit.html](d:/proyectos/feipower_el-brieff-website/src/print/media-kit.html) como **Press Kit público**: mantener historia, biografía, recursos visuales y contacto, y añadir una página de entrevistas y conferencias con temas, formatos, bio corta y CTA específico.
4. Crear un **Media Kit público** de 4–6 páginas y su landing HTML; el PDF se entregará tras el formulario existente. Crear en Notion el **Dossier Comercial** y el **Media Deck** privados, con inventario, entregables, casos aprobados y propuestas adaptables.
5. Establecer la política comercial-editorial para México: identificar mensajes patrocinados en audio, video, web y PDF; impedir aprobación o veto editorial de anunciantes; separar entrevista editorial de contenido patrocinado; definir categorías restringidas, derechos de uso, exclusividad, cancelación y make-goods. Exigir revisión legal antes de la primera campaña o de cualquier categoría regulada.
6. Ampliar el formulario existente con motivos para ventas/anuncios, colaboraciones, prensa/entrevistas y foros/conferencias. Conservar los campos mínimos y el envío a Arturo con copia a Mar; no enviar PII a GA4.
7. Validar el resultado: Arturo aprueba contenido y oferta en Notion; se verifica que no haya métricas sin fuente, que el PDF sea accesible e imprimible, y que las divulgaciones comerciales estén visibles en todos los formatos.

## Criterios de aceptación
- Las cinco oportunidades solicitadas se presentan claramente: menciones pagadas, anuncios, colaboraciones, entrevistas y foros/conferencias.
- Ninguna cifra de audiencia aparece sin fuente, ventana, definición y fecha; los datos publicados proceden exclusivamente de una exportación validada de Spotify for Creators.
- Arturo queda asignado a una tarea en Notion, con checklist de aprobación y registro de decisiones enlazado.
- Press Kit, Media Kit, Dossier Comercial y Media Deck tienen propósito, acceso y contenido diferenciados.
- La oferta comercial preserva la independencia editorial y divulga el patrocinio de forma explícita.
- La landing HTML del Media Kit es pública y su PDF completo requiere el formulario existente.
- Los cambios superan `npm run test`, `npm run build` y `npm run media-kit:pdf`, además de revisión visual A4, accesibilidad y enlaces.

## Dependencias y riesgos
- Se requiere una exportación histórica de Spotify for Creators. Si no se proporciona o Arturo no la valida, el material deberá omitir cifras y mostrar “métricas en actualización”, no estimaciones.
- Tarifas bajo cotización, categorías no aceptadas y condiciones legales requieren validación de Arturo antes de publicar el Dossier Comercial privado.
- IAB y FTC son referencias de operación; no sustituyen la revisión legal aplicable en México antes de la primera campaña o de categorías reguladas.
- La investigación de Perplexity respalda el uso de IAB v2.2 para métricas, formatos host-read transparentes y separación entre patrocinio y edición; sus referencias principales incluyen IAB Tech Lab, Spotify for Creators, Apple Podcasts, FTC y Online News Association.

## Decision Records (ADR)
1. **Datos de audiencia:** ante la falta de fuentes multi-plataforma verificadas, se publicarán sólo exportaciones de Spotify for Creators, con ventana, definición y fecha explícitas; no se sumarán ni inferirán totales de otras plataformas.
2. **Validación:** Arturo Salazar aprobará el contenido mediante una tarea asignada en Notion, vinculada a una checklist y un registro de decisiones, para mantener trazabilidad.
3. **Acceso a activos:** Press Kit y Media Kit serán públicos en HTML; el PDF completo del Media Kit conservará el lead gate existente. Dossier Comercial y Media Deck permanecerán como plantillas privadas de Notion.
4. **Política comercial:** las tarifas se manejarán bajo cotización. La operación se limita inicialmente a México y exige revisión legal antes de campañas o categorías reguladas.