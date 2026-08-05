# Ciclo de vida de datos personales — El Brieff editorial

Marco: LFPDPPP (mínimos). Valores de retención finales requieren aprobación del owner antes de lanzamiento productivo.

## Datos tratados

| Dato | Finalidad | Base | Tabla |
|------|-----------|------|-------|
| Email Access allowlist | Autenticación admin | Interés legítimo / relación laboral | Worker var `ACCESS_ALLOWED_EMAILS` |
| Email newsletter | Envío de broadcasts | Consentimiento | `contacts_consent` |
| Email media kit | Lead prensa | Interés legítimo | flujo existente `EMAIL` (no mezclar con marketing) |
| Contenido editorial | Publicación | Relación autor | `content_items`, `citations` |
| Documentos de investigación | Asistente | Autorización interna | `knowledge_documents` + R2 |

## Consentimiento

- Alta newsletter: doble opt-in (`consent_at`, `double_opt_in_at`, `consent_source`, UTM).
- Evidencia de consentimiento en `contacts_consent`; no usar métricas individuales de apertura como criterio editorial.

## Retención (propuesta pendiente de aprobación)

| Recurso | Retención propuesta |
|---------|---------------------|
| Contactos activos | Mientras exista consentimiento |
| Contactos dados de baja | 24 meses tras `unsubscribe_at` |
| `audit_events` | 36 meses (o obligación legal mayor) |
| Assets R2 | Mientras el content item exista + 90 días |
| Knowledge confidential | Según clasificación; revisión trimestral |

## Derechos ARCO / exportación / borrado

1. Solicitud a `prensa@strtgy.ai` o canal owner.
2. Exportar filas de `contacts_consent` + deliveries asociadas (sin secretos).
3. Borrado: marcar `unsubscribe_at` y programar purge tras retención; no borrar `audit_events` de cumplimiento.
4. Registrar la acción en `audit_events` con `actor_id`.

## Controles por defecto

- Admin solo vía Cloudflare Access + allowlist.
- Sin secretos de proveedor en cliente ni D1.
- Knowledge `confidential` excluido de modelos externos.
- Syndication partner: `noindex` en copias completas; canónica en El Brieff.

## Bloqueos actuales

- Política Access remota, dominio/sender Resend verificado, organización LinkedIn y textos legales finales: **Approval Gates**.
