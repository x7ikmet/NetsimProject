using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Netsim.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCostActivityLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence<int>(
                name: "MALIYET_LOG_NO");

            migrationBuilder.CreateTable(
                name: "NS_MLYTLOGS",
                columns: table => new
                {
                    MALIYET_LOG_NO = table.Column<int>(type: "INTEGER", nullable: false),
                    KULLANICI_ID = table.Column<string>(type: "VARCHAR(64)", maxLength: 64, nullable: true),
                    KULLANICI_ADI = table.Column<string>(type: "VARCHAR(256)", maxLength: 256, nullable: false),
                    OTURUM_KODU = table.Column<string>(type: "VARCHAR(48)", maxLength: 48, nullable: true),
                    LOG_KODU = table.Column<string>(type: "VARCHAR(24)", maxLength: 24, nullable: false),
                    LOG_SINIFI = table.Column<string>(type: "CHAR(1)", nullable: false),
                    TARIH = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "LOCALTIMESTAMP"),
                    ISLEM = table.Column<string>(type: "VARCHAR(80)", maxLength: 80, nullable: false),
                    ACIKLAMA = table.Column<string>(type: "VARCHAR(1024)", maxLength: 1024, nullable: true),
                    KAYNAK_MODUL = table.Column<string>(type: "VARCHAR(24)", maxLength: 24, nullable: false),
                    KAYNAK_TABLO = table.Column<string>(type: "VARCHAR(80)", maxLength: 80, nullable: true),
                    KAYNAK_ISLEM_NO = table.Column<int>(type: "INTEGER", nullable: true),
                    KAYNAK_ISLEM_DETAY_NO = table.Column<int>(type: "INTEGER", nullable: true),
                    VERI = table.Column<string>(type: "BLOB SUB_TYPE TEXT CHARACTER SET UTF8", nullable: true),
                    IP = table.Column<string>(type: "VARCHAR(80)", maxLength: 80, nullable: true),
                    CTIMESTAMP = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "LOCALTIMESTAMP"),
                    RGUID = table.Column<string>(type: "VARCHAR(48)", maxLength: 48, nullable: false),
                    SYSTEM = table.Column<string>(type: "CHAR(1)", nullable: false, defaultValue: "H")
                },
                constraints: table =>
                {
                    table.PrimaryKey("MLYTLOGS$PRI", x => x.MALIYET_LOG_NO);
                });

            migrationBuilder.CreateIndex(
                name: "MLYTLOGS$KAYNAK_NDX",
                table: "NS_MLYTLOGS",
                columns: new[] { "KAYNAK_ISLEM_NO", "KAYNAK_ISLEM_DETAY_NO" });

            migrationBuilder.CreateIndex(
                name: "MLYTLOGS$KULLANICI_NDX",
                table: "NS_MLYTLOGS",
                column: "KULLANICI_ADI");

            migrationBuilder.CreateIndex(
                name: "MLYTLOGS$TARIH_NDX",
                table: "NS_MLYTLOGS",
                column: "TARIH");

            migrationBuilder.Sql(
                """
                CREATE TRIGGER "MLYTLOGS_BI" ACTIVE BEFORE INSERT ON "NS_MLYTLOGS"
                AS
                BEGIN
                    IF (NEW."MALIYET_LOG_NO" IS NULL) THEN
                        NEW."MALIYET_LOG_NO" = NEXT VALUE FOR "MALIYET_LOG_NO";
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NS_MLYTLOGS");

            migrationBuilder.DropSequence(
                name: "MALIYET_LOG_NO");
        }
    }
}
