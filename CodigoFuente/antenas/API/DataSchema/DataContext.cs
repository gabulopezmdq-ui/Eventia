using API.DataSchema.Configurations;
using API.DataSchema.ModelConfiguration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace API.DataSchema
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options)
        {

            //this.ChangeTracker.LazyLoadingEnabled = false;
            //this.Configuration.LazyLoadingEnabled = false;
            //ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        }

        public DbSet<ef_usuarios> ef_usuarios { get; set; }
        public DbSet<ef_roles> ef_roles { get; set; }
        public DbSet<ef_usuarios_roles> ef_usuarios_roles { get; set; }
        public DbSet<ef_tipos_evento> ef_tipos_evento { get; set; }
        public DbSet<ef_idiomas> ef_idiomas { get; set; }
        public DbSet<ef_dress_code> ef_dress_code { get; set; }
        public DbSet<ef_eventos> ef_eventos { get; set; }
        public DbSet<ef_evento_usuarios> ef_evento_usuarios { get; set; }
        public DbSet<ef_evento_estados_hist> ef_evento_estados_hist { get; set; }
        public DbSet<ef_clientes> ef_clientes{ get; set; }
        public DbSet<ef_cuentas> ef_cuentas { get; set; }
        public DbSet<ef_cuenta_usuarios> ef_cuenta_usuarios { get; set; }
        public DbSet<ef_invitados> ef_invitados { get; set; }
        public DbSet<ef_param_traducciones> ef_param_traducciones { get; set; }
        public DbSet<ef_tramo_tipos> ef_tramo_tipos { get; set; }
        public DbSet<ef_evento_tramos> ef_evento_tramos { get; set; }
        public DbSet<ef_evento_accesos> ef_evento_accesos { get; set; }
        public DbSet<ef_evento_acceso_tramos> ef_evento_acceso_tramos { get; set; }

        public DbSet<ef_plantillas_evento> ef_plantillas_evento { get; set; }
        public DbSet<ef_plantilla_tramos> ef_plantilla_tramos { get; set; }
        public DbSet<ef_plantilla_accesos> ef_plantilla_accesos { get; set; }
        public DbSet<ef_plantilla_acceso_tramos> ef_plantilla_acceso_tramos { get; set; }
        public DbSet<ef_solicitudes_plantilla> ef_solicitudes_plantilla { get; set; }

        public DbSet<ef_evento_features> ef_evento_features { get; set; }
        public DbSet<ef_evento_musica_momentos> ef_evento_musica_momentos { get; set; }
        public DbSet<ef_evento_musica_playlist> ef_evento_musica_playlist { get; set; }
        public DbSet<ef_invitado_musica_sugerencias> ef_invitado_musica_sugerencias { get; set; }
        public DbSet<ef_invitado_musica_votos> ef_invitado_musica_votos { get; set; }
        public DbSet<ef_param_features> ef_param_features { get; set; }
        public DbSet<ef_param_feature_dependencias> ef_param_feature_dependencias { get; set; }
        public DbSet<ef_evento_musica_bloqueos> ef_evento_musica_bloqueos { get; set; }
        public DbSet<ef_evento_links> ef_evento_links { get; set; }
        public DbSet<ef_param_entidades> ef_param_entidades { get; set; }

        public DbSet<ef_rsvp_grupos> ef_rsvp_grupos { get; set; }

        public DbSet<ef_rsvp_grupo_integrantes> ef_rsvp_grupo_integrantes { get; set; }

        public DbSet<ef_evento_edad_rangos> ef_evento_edad_rangos { get; set; }

        public DbSet<ef_param_edad_rangos> ef_param_edad_rangos { get; set; }

        public DbSet<ef_evento_acceso_links> ef_evento_acceso_links { get; set; }
        public DbSet<ef_qr_scans> ef_qr_scans { get; set; }

        public DbSet<ef_autorizaciones> ef_autorizaciones { get; set; }
        public DbSet<ef_retiros> ef_retiros { get; set; }
        public DbSet<ef_param_restricciones_alimentarias> ef_param_restricciones_alimentarias { get; set; }
        public DbSet<ef_rsvp_integrante_restricciones> ef_rsvp_integrante_restricciones { get; set; }
        public DbSet<ef_evento_musica_sugerencias_estado> ef_evento_musica_sugerencias_estado { get; set; }
        public DbSet<ef_planes> ef_planes { get; set; }
        public DbSet<ef_plan_features> ef_plan_features { get; set; }
        public DbSet<ef_plan_limites> ef_plan_limites { get; set; }

        public DbSet<ef_addons> ef_addons { get; set; }
        public DbSet<ef_addon_features> ef_addon_features { get; set; }
        public DbSet<ef_scope_addons> ef_scope_addons { get; set; }

        public DbSet<ef_precios> ef_precios { get; set; }
        public DbSet<ef_suscripciones> ef_suscripciones { get; set; }
        public DbSet<ef_pagos> ef_pagos { get; set; }
        public DbSet<ef_webhook_eventos> ef_webhook_eventos { get; set; }

        public DbSet<ef_b2b_prospectos> ef_b2b_prospectos { get; set; }
        public DbSet<ef_b2b_prospectos_hist> ef_b2b_prospectos_hist { get; set; }
        public DbSet<ef_paises> ef_paises { get; set; }
        public DbSet<ef_tipos_identificacion_fiscal> ef_tipos_identificacion_fiscal { get; set; }

        /*public DbSet<MEC_CarRevista> MEC_CarRevista { get; set; }
        public DbSet<MEC_Conceptos> MEC_Conceptos { get; set; }
        public DbSet<MEC_TiposEstablecimientos> MEC_TiposEstablecimientos { get; set; }
        public DbSet<MEC_Establecimientos> MEC_Establecimientos { get; set; }
        public DbSet<MEC_TiposCategorias> MEC_TiposCategorias { get; set; }
        public DbSet<MEC_Personas> MEC_Personas { get; set; }
        public DbSet<MEC_POF> MEC_POF { get; set; }
        public DbSet<MEC_TiposLiquidaciones> MEC_TiposLiquidaciones { get; set; }
        public DbSet<MEC_CabeceraLiquidacion> MEC_CabeceraLiquidacion { get; set; }
        public DbSet<MEC_TiposFunciones> MEC_TiposFunciones { get; set; }
        public DbSet<MEC_TMPMecanizadas> MEC_TMPMecanizadas { get; set; }
        public DbSet<MEC_TMPErroresEstablecimientos> MEC_TMPErroresEstablecimientos { get; set; }
        public DbSet<MEC_TMPErroresFuncion> MEC_TMPErroresFuncion { get; set; }
        public DbSet<MEC_TMPErroresConceptos> MEC_TMPErroresConceptos { get; set; }
        public DbSet<MEC_TMPErroresCarRevista> MEC_TMPErroresCarRevista { get; set; }
        public DbSet<MEC_TMPErroresTiposEstablecimientos> MEC_TMPErroresTiposEstablecimientos { get; set; }
        public DbSet<MEC_TMPErroresMecanizadas> MEC_TMPErroresMecanizadas { get; set; }
        public DbSet<MEC_POF_Antiguedades> MEC_POF_Antiguedades { get; set; }
        public DbSet<MEC_InasistenciasCabecera> MEC_InasistenciasCabecera{ get; set; }
        public DbSet<MEC_InasistenciasDetalle> MEC_InasistenciasDetalle { get; set; }
        public DbSet<MEC_Mecanizadas> MEC_Mecanizadas { get; set; }
        public DbSet<MEC_Usuarios> MEC_Usuarios { get; set; }
        public DbSet<MEC_Roles> MEC_Roles { get; set; }
        public DbSet<MEC_RolesXUsuarios> MEC_RolesXUsuarios { get; set; }
        public DbSet<MEC_UsuariosEstablecimientos> MEC_UsuariosEstablecimientos { get; set; }
        public DbSet<MEC_CabeceraLiquidacionEstados> MEC_CabeceraLiquidacionEstados { get; set; }
        public DbSet<MEC_BajasCabecera> MEC_BajasCabecera { get; set; }
        public DbSet<MEC_BajasDetalle> MEC_BajasDetalle { get; set; } 
        public DbSet<MEC_MotivosBajas> MEC_MotivosBajas { get; set; }
        public DbSet<MEC_POFDetalle> MEC_POFDetalle { get; set; }
        public DbSet<MEC_MotivosBajasDoc> MEC_MotivosBajasDoc { get; set; }
        public DbSet<MEC_MotivosBajasDoc> MEC_TiposMovimientos { get; set; }
        public DbSet<MEC_MovimientosCabecera> MEC_MovimientosCabecera { get; set; }
        public DbSet<MEC_MovimientosDetalle> MEC_MovimientosDetalle { get; set; }
        public DbSet<MEC_MovimientosBajas> MEC_MovimientosBajas { get; set; }
        public DbSet<MEC_POF_Barras> MEC_POF_Barras { get; set; }
        public DbSet<MEC_InasistenciasCodigos> MEC_InasistenciasCodigos { get; set; }
        public DbSet<MEC_TMPInasistenciasDetalle> MEC_TMPInasistenciasDetalle { get; set; }
        public DbSet<MEC_InasistenciasRechazo> MEC_InasistenciasRechazo { get; set; }
        public DbSet<MEC_TMPErroresInasistenciasDetalle> MEC_TMPErroresInasistenciasDetalle { get; set; }
        public DbSet<MEC_MovimientosSuperCabecera> MEC_MovimientosSuperCabecera { get; set; }
        public DbSet<MEC_RetencionesXMecanizadas> MEC_RetencionesXMecanizadas { get; set; }
        public DbSet<MEC_Retenciones> MEC_Retenciones { get; set; }
        public DbSet<MEC_TMPEFI> MEC_TMPEFI { get; set; }*/

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new ef_usuariosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_rolesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_usuarios_rolesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_tipos_eventoConfiguration());
            modelBuilder.ApplyConfiguration(new ef_idiomasConfiguration());
            modelBuilder.ApplyConfiguration(new ef_dress_codeConfiguration());
            modelBuilder.ApplyConfiguration(new ef_eventosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_usuariosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_estados_histConfiguration());
            modelBuilder.ApplyConfiguration(new ef_clientesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_cuentasConfiguration());
            modelBuilder.ApplyConfiguration(new ef_cuenta_usuariosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_invitadosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_param_traduccionesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_tramo_tiposConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_tramosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_accesosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_acceso_tramosConfiguration());

            modelBuilder.ApplyConfiguration(new ef_plantillas_eventoConfiguration());
            modelBuilder.ApplyConfiguration(new ef_plantilla_tramosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_plantilla_accesosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_plantilla_acceso_tramosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_solicitudes_plantillaConfiguration());

            modelBuilder.ApplyConfiguration(new ef_param_featuresConfiguration());
            modelBuilder.ApplyConfiguration(new ef_param_feature_dependenciasConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_featuresConfiguration());

            modelBuilder.ApplyConfiguration(new ef_evento_musica_momentosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_musica_playlistConfiguration());
            modelBuilder.ApplyConfiguration(new ef_invitado_musica_sugerenciasConfiguration());
            modelBuilder.ApplyConfiguration(new ef_invitado_musica_votosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_musica_bloqueosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_linksConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_musica_sugerencias_estadoConfiguration());
            modelBuilder.ApplyConfiguration(new ef_param_entidadesConfiguration());


            modelBuilder.ApplyConfiguration(new ef_autorizacionesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_rsvp_gruposConfiguration());
            modelBuilder.ApplyConfiguration(new ef_rsvp_grupo_integrantesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_edad_rangosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_param_edad_rangosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_acceso_linksConfiguration());
            modelBuilder.ApplyConfiguration(new ef_qr_scansConfiguration());
            modelBuilder.ApplyConfiguration(new ef_retirosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_param_restricciones_alimentariasConfiguration());
            modelBuilder.ApplyConfiguration(new ef_rsvp_integrante_restriccionesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_evento_acceso_linksConfiguration());
            modelBuilder.ApplyConfiguration(new ef_rsvp_gruposConfiguration());

            modelBuilder.ApplyConfiguration(new ef_planesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_plan_featuresConfiguration());
            modelBuilder.ApplyConfiguration(new ef_plan_limitesConfiguration());

            modelBuilder.ApplyConfiguration(new ef_addonsConfiguration());
            modelBuilder.ApplyConfiguration(new ef_addon_featuresConfiguration());
            modelBuilder.ApplyConfiguration(new ef_scope_addonsConfiguration());

            modelBuilder.ApplyConfiguration(new ef_preciosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_suscripcionesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_pagosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_webhook_eventosConfiguration());

            modelBuilder.ApplyConfiguration(new ef_b2b_prospectosConfiguration());
            modelBuilder.ApplyConfiguration(new ef_b2b_prospectos_histConfiguration());
            modelBuilder.ApplyConfiguration(new ef_paisesConfiguration());
            modelBuilder.ApplyConfiguration(new ef_tipos_identificacion_fiscalConfiguration());


            /*modelBuilder.ApplyConfiguration(new MEC_CarRevistaConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_ConceptosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposEstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_EstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposCategoriasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_PersonasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_POFConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposLiquidacionesConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_CabeceraLiquidacionConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposFuncionesConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPMecanizadaConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresEstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresFuncionConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresConceptosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresCarRevistaConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresTipoEstablecimientoConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresMecanizadasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_POF_AntiguedadesConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_InasistenciasCabeceraConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_InasistenciasDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MecanizadasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_UsuariosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_RolesConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_RolesXUsuariosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_UsuariosEstablecimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_CabeceraLiquidacionEstadosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_BajasCabeceraConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_BajasDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MotivosBajasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_POFDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MotivosBajasDocConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TiposMovimientosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MovimientosCabeceraConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MovimientosDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MovimientosBajasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_POF_BarrasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_InasistenciasCodigosConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPInasistenciasDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPErroresInasistenciasDetalleConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_InasistenciasRechazoConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_MovimientosSuperCabeceraConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_TMPEFIConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_RetencionesXMecanizadasConfiguration());
            modelBuilder.ApplyConfiguration(new MEC_RetencionesConfiguration());*/

            base.OnModelCreating(modelBuilder);
        }
    }
}