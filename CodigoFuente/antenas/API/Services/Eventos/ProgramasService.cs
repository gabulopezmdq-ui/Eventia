using API.DataSchema;
using API.DataSchema.DTO.Programas;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Eventos
{
    public class ProgramasService : IProgramasService
    {
        private readonly DataContext _context;
        private readonly IEventosService _eventosService;

        public ProgramasService(DataContext context, IEventosService eventosService)
        {
            _context = context;
            _eventosService = eventosService;
        }

        public async Task<IEnumerable<object>> GetStaffAsync(long idEvento, long idUsuarioLogger)
        {
            return await _eventosService.GetStaffAsync(idEvento, idUsuarioLogger);
        }

        public async Task<object> AddStaffAsync(long idEvento, AddProgramaStaffRequest req, long idUsuarioLogger)
        {
            // Mapeo de DTO de programa a DTO genérico
            var genericReq = new AddEventoStaffRequest
            {
                Email = req.Email,
                IdRol = req.IdRol
            };
            return await _eventosService.AddStaffAsync(idEvento, genericReq, idUsuarioLogger);
        }

        public async Task<bool> UpdateStaffAsync(long idEvento, long idEventoUsuario, UpdateProgramaStaffRequest req, long idUsuarioLogger)
        {
            var genericReq = new UpdateEventoStaffRequest
            {
                IdRol = req.IdRol,
                Activo = req.Activo
            };
            return await _eventosService.UpdateStaffAsync(idEvento, idEventoUsuario, genericReq, idUsuarioLogger);
        }

        public async Task<bool> DeleteStaffAsync(long idEvento, long idEventoUsuario, long idUsuarioLogger)
        {
            return await _eventosService.DeleteStaffAsync(idEvento, idEventoUsuario, idUsuarioLogger);
        }

        public async Task<object> AceptarInvitacionStaffAsync(string token, long idUsuarioActual)
        {
            return await _eventosService.AceptarInvitacionStaffAsync(token, idUsuarioActual);
        }
    }
}
