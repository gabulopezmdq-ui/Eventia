using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;

namespace API.Services.Musica

{
    public class PdfMusicaRankingRow
    {
        public string? titulo { get; set; }
        public string? artista { get; set; }
        public int cantidad_sugerencias { get; set; }
        public int cantidad_votos { get; set; }
    }

    public class PdfMusicaRankingDocument : IDocument
    {
        private readonly long _idEvento;
        private readonly List<PdfMusicaRankingRow> _rows;

        public PdfMusicaRankingDocument(long idEvento, List<PdfMusicaRankingRow> rows)
        {
            _idEvento = idEvento;
            _rows = rows ?? new List<PdfMusicaRankingRow>();
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Margin(25);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text($"Eventia - Ranking de sugerencias - Evento {_idEvento}").SemiBold().FontSize(16);
                    col.Item().Text($"Generado: {DateTimeOffset.Now:dd/MM/yyyy HH:mm}");
                    col.Item().LineHorizontal(1);
                });

                page.Content().PaddingTop(10).Column(col =>
                {
                    col.Item().Text("Ordenado por votos y sugerencias").SemiBold().FontSize(12);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(5); // tema
                            columns.RelativeColumn(4); // artista
                            columns.RelativeColumn(2); // sugerencias
                            columns.RelativeColumn(2); // votos
                        });

                        table.Header(h =>
                        {
                            h.Cell().Text("Tema").SemiBold();
                            h.Cell().Text("Artista").SemiBold();
                            h.Cell().Text("Sug.").SemiBold();
                            h.Cell().Text("Votos").SemiBold();
                        });

                        foreach (var r in _rows)
                        {
                            table.Cell().Text(r.titulo ?? "");
                            table.Cell().Text(r.artista ?? "");
                            table.Cell().Text(r.cantidad_sugerencias.ToString());
                            table.Cell().Text(r.cantidad_votos.ToString());
                        }
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Eventia · Página ");
                    x.CurrentPageNumber();
                    x.Span(" de ");
                    x.TotalPages();
                });
            });
        }
    }
}