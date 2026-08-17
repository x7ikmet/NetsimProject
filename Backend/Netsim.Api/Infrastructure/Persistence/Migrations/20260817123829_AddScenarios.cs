using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Netsim.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddScenarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence<int>(
                name: "SENARYO_NO");

            migrationBuilder.CreateTable(
                name: "NS_SENARYO",
                columns: table => new
                {
                    SENARYO_NO = table.Column<int>(type: "INTEGER", nullable: false),
                    KULLANICI_ID = table.Column<string>(type: "VARCHAR(64)", maxLength: 64, nullable: false),
                    SENARYO_ADI = table.Column<string>(type: "VARCHAR(80)", maxLength: 80, nullable: false),
                    STOK_NO = table.Column<int>(type: "INTEGER", nullable: false),
                    STOK_KODU = table.Column<string>(type: "VARCHAR(24)", maxLength: 24, nullable: false),
                    STOK_ADI = table.Column<string>(type: "VARCHAR(140)", maxLength: 140, nullable: false),
                    STOK_VARYANT_NO = table.Column<int>(type: "INTEGER", nullable: true),
                    VARYANT_KODU = table.Column<string>(type: "VARCHAR(24)", maxLength: 24, nullable: true),
                    VARYANT_ADI = table.Column<string>(type: "VARCHAR(80)", maxLength: 80, nullable: true),
                    MIKTAR = table.Column<double>(type: "DOUBLE PRECISION", nullable: false),
                    BIRIM = table.Column<string>(type: "VARCHAR(10)", maxLength: 10, nullable: false),
                    MALIYET_YONTEMI = table.Column<string>(type: "VARCHAR(24)", maxLength: 24, nullable: false),
                    TOPLAM_MALIYET = table.Column<double>(type: "DOUBLE PRECISION", nullable: false),
                    DOVIZ_BIRIMI = table.Column<string>(type: "VARCHAR(4)", maxLength: 4, nullable: true),
                    SENARYO_VERISI = table.Column<string>(type: "BLOB SUB_TYPE TEXT CHARACTER SET UTF8", nullable: false),
                    REVIZYON = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1),
                    CTIMESTAMP = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "LOCALTIMESTAMP"),
                    RTIMESTAMP = table.Column<DateTime>(type: "TIMESTAMP", nullable: false, defaultValueSql: "LOCALTIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("SENARYO$PRI", x => x.SENARYO_NO);
                    table.ForeignKey(
                        name: "SENARYO$KULLANICI_FK",
                        column: x => x.KULLANICI_ID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "SENARYO$KULLANICI_NDX",
                table: "NS_SENARYO",
                columns: new[] { "KULLANICI_ID", "RTIMESTAMP" });

            migrationBuilder.Sql(
                """
                CREATE TRIGGER "SENARYO_BI" ACTIVE BEFORE INSERT ON "NS_SENARYO"
                AS
                BEGIN
                    IF (NEW."SENARYO_NO" IS NULL) THEN
                        NEW."SENARYO_NO" = NEXT VALUE FOR "SENARYO_NO";
                END
                """);

            migrationBuilder.Sql(
                """
                CREATE TRIGGER "SENARYO_BU" ACTIVE BEFORE UPDATE ON "NS_SENARYO"
                AS
                BEGIN
                    NEW."REVIZYON" = OLD."REVIZYON" + 1;
                    NEW."RTIMESTAMP" = LOCALTIMESTAMP;
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NS_SENARYO");

            migrationBuilder.DropSequence(
                name: "SENARYO_NO");
        }
    }
}
