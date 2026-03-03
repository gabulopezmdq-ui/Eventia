using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;

namespace API.Services.Musica
{
    public class PdfMusicaSiDocument : IDocument
    {
        private readonly long _idEvento;
        private readonly List<PdfMusicaSiRow> _rows;

        public PdfMusicaSiDocument(long idEvento, List<PdfMusicaSiRow> rows)
        {
            _idEvento = idEvento;
            _rows = rows ?? new List<PdfMusicaSiRow>();
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
                    col.Item().Text($"Eventia - Música (SI) - Evento {_idEvento}").SemiBold().FontSize(16);
                    col.Item().Text($"Generado: {DateTimeOffset.Now:dd/MM/yyyy HH:mm}");
                    col.Item().LineHorizontal(1);
                });

                page.Content().PaddingTop(10).Column(col =>
                {
                    col.Item().Text("Playlist del organizador").SemiBold().FontSize(12);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2); // momento
                            columns.RelativeColumn(1); // orden
                            columns.RelativeColumn(4); // tema
                            columns.RelativeColumn(3); // artista
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Momento").SemiBold();
                            header.Cell().Text("Orden").SemiBold();
                            header.Cell().Text("Tema").SemiBold();
                            header.Cell().Text("Artista").SemiBold();
                        });

                        foreach (var r in _rows)
                        {
                            table.Cell().Text(r.momento ?? "");
                            table.Cell().Text(r.orden_tema.ToString());
                            table.Cell().Text(r.titulo ?? "");
                            table.Cell().Text(r.artista ?? "");
                        }
                    });

                    col.Item().PaddingTop(10).Text("Nota: La columna Link se exporta mejor en CSV/XLSX.").Italic().FontSize(9);
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Eventia · ");
                    x.Span("Página ");
                    x.CurrentPageNumber();
                    x.Span(" de ");
                    x.TotalPages();
                });
            });
        }
    }

    public class PdfMusicaSiRow
    {
        public string? momento { get; set; }
        public int orden_tema { get; set; }
        public string? titulo { get; set; }
        public string? artista { get; set; }
        public string? link { get; set; }
    }

    public class PdfMusicaNoDocument : IDocument
    {
        private readonly long _idEvento;
        private readonly List<PdfMusicaNoRow> _rows;

        public PdfMusicaNoDocument(long idEvento, List<PdfMusicaNoRow> rows)
        {
            _idEvento = idEvento;
            _rows = rows ?? new List<PdfMusicaNoRow>();
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
                    col.Item().Text($"Eventia - Música (NO) - Evento {_idEvento}").SemiBold().FontSize(16);
                    col.Item().Text($"Generado: {DateTimeOffset.Now:dd/MM/yyyy HH:mm}");
                    col.Item().LineHorizontal(1);
                });

                page.Content().PaddingTop(10).Column(col =>
                {
                    col.Item().Text("Bloqueos del organizador (NO sonar)").SemiBold().FontSize(12);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(4); // tema
                            columns.RelativeColumn(3); // artista
                            columns.RelativeColumn(5); // nota
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Tema").SemiBold();
                            header.Cell().Text("Artista").SemiBold();
                            header.Cell().Text("Nota").SemiBold();
                        });

                        foreach (var r in _rows)
                        {
                            table.Cell().Text(r.titulo ?? "");
                            table.Cell().Text(r.artista ?? "");
                            table.Cell().Text(r.nota ?? "");
                        }
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Eventia · ");
                    x.Span("Página ");
                    x.CurrentPageNumber();
                    x.Span(" de ");
                    x.TotalPages();
                });
            });
        }
    }

    public class PdfMusicaNoRow
    {
        public string? titulo { get; set; }
        public string? artista { get; set; }
        public string? link { get; set; }
        public string? nota { get; set; }
    }
}
