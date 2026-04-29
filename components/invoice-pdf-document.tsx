import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register IBM Plex Sans Arabic from Google Fonts
Font.register({
  family: "IBM Plex Sans Arabic",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/ibmplexsansarabic/v15/Qw3CZRtWPQCuHme67tEYUIx3Kh0PHR9N6bs6.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/ibmplexsansarabic/v15/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPi-NCT.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/ibmplexsansarabic/v15/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOG-dCT.ttf",
      fontWeight: 700,
    },
  ],
});

interface PDFItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PDFData {
  invoiceNumber: string;
  clientName: string;
  clientVatNumber: string;
  issueDate: string;
  dueDate: string;
  currencyLabel: string;
  items: PDFItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes: string;
  sellerName: string;
  sellerBusiness: string;
  sellerVat: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  qrDataUrl?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "IBM Plex Sans Arabic",
    fontSize: 10,
    direction: "rtl",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sellerBlock: {
    textAlign: "right",
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 2,
  },
  sellerDetail: {
    fontSize: 8,
    color: "#525252",
    marginBottom: 1,
  },
  invoiceTitle: {
    textAlign: "left",
  },
  titleText: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 2,
  },
  titleSub: {
    fontSize: 7,
    color: "#525252",
    letterSpacing: 2,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 8,
    color: "#525252",
  },
  metaValue: {
    fontSize: 9,
    fontWeight: 600,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginVertical: 12,
  },
  clientSection: {
    textAlign: "right",
    marginBottom: 16,
  },
  clientLabel: {
    fontSize: 8,
    color: "#525252",
    marginBottom: 2,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 600,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#FAFAF7",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colDesc: { flex: 3, textAlign: "right" },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "center" },
  colTotal: { flex: 1.5, textAlign: "left" },
  thText: {
    fontSize: 8,
    color: "#525252",
    fontWeight: 600,
  },
  tdText: {
    fontSize: 9,
  },
  totalsBlock: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  totalsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 9,
    color: "#525252",
  },
  totalValue: {
    fontSize: 9,
  },
  grandTotalRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    width: 200,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 700,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 10,
  },
  footerRight: {
    textAlign: "right",
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: "#525252",
    marginBottom: 2,
  },
  footerText: {
    fontSize: 8,
    color: "#525252",
  },
  qrBlock: {
    alignItems: "flex-start",
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  qrLabel: {
    fontSize: 6,
    color: "#525252",
    marginTop: 2,
  },
});

function formatNum(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function InvoicePDFDocument({ data }: { data: PDFData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.sellerBlock}>
            <Text style={styles.sellerName}>
              {data.sellerName || "\u0633\u0627\u0631\u0629 \u0627\u0644\u062d\u0627\u0631\u062b\u064a"}
            </Text>
            <Text style={styles.sellerDetail}>
              {data.sellerBusiness || "\u062a\u0635\u0645\u064a\u0645 \u0648\u0647\u0648\u064a\u0629 \u0628\u0635\u0631\u064a\u0629"}
            </Text>
            {data.sellerAddress ? (
              <Text style={styles.sellerDetail}>{data.sellerAddress}</Text>
            ) : null}
            {data.sellerPhone ? (
              <Text style={styles.sellerDetail}>{data.sellerPhone}</Text>
            ) : null}
            {data.sellerEmail ? (
              <Text style={styles.sellerDetail}>{data.sellerEmail}</Text>
            ) : null}
            {data.sellerVat ? (
              <Text style={styles.sellerDetail}>
                {"\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0636\u0631\u064a\u0628\u064a: "}{data.sellerVat}
              </Text>
            ) : null}
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.titleText}>
              {"\u0641\u0627\u062a\u0648\u0631\u0629 \u0636\u0631\u064a\u0628\u064a\u0629"}
            </Text>
            <Text style={styles.titleSub}>TAX INVOICE</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>
                {"\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629"}
              </Text>
              <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>
                {"\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0625\u0635\u062f\u0627\u0631"}
              </Text>
              <Text style={styles.metaValue}>{data.issueDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>
                {"\u0627\u0644\u0627\u0633\u062a\u062d\u0642\u0627\u0642"}
              </Text>
              <Text style={styles.metaValue}>{data.dueDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Client */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLabel}>
            {"\u0641\u0627\u062a\u0648\u0631\u0629 \u0625\u0644\u0649"}
          </Text>
          <Text style={styles.clientName}>
            {data.clientName || "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064a\u0644"}
          </Text>
          {data.clientVatNumber ? (
            <Text style={styles.sellerDetail}>
              {"\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0636\u0631\u064a\u0628\u064a: "}{data.clientVatNumber}
            </Text>
          ) : null}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, styles.colDesc]}>
              {"\u0627\u0644\u0648\u0635\u0641"}
            </Text>
            <Text style={[styles.thText, styles.colQty]}>
              {"\u0627\u0644\u0643\u0645\u064a\u0629"}
            </Text>
            <Text style={[styles.thText, styles.colPrice]}>
              {"\u0627\u0644\u0633\u0639\u0631"}
            </Text>
            <Text style={[styles.thText, styles.colTotal]}>
              {"\u0627\u0644\u0645\u062c\u0645\u0648\u0639"}
            </Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tdText, styles.colDesc]}>
                {item.description || "\u2014"}
              </Text>
              <Text style={[styles.tdText, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tdText, styles.colPrice]}>
                {formatNum(item.unitPrice)}
              </Text>
              <Text style={[styles.tdText, styles.colTotal]}>
                {formatNum(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>
              {"\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064a"}
            </Text>
            <Text style={styles.totalValue}>
              {formatNum(data.subtotal)} {data.currencyLabel}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>
              {"\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 ("}{data.vatRate}{"%)"}
            </Text>
            <Text style={styles.totalValue}>
              {formatNum(data.vatAmount)} {data.currencyLabel}
            </Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>
              {"\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0633\u062a\u062d\u0642"}
            </Text>
            <Text style={styles.grandTotalValue}>
              {formatNum(data.total)} {data.currencyLabel}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRight}>
            <Text style={styles.footerLabel}>
              {"\u0634\u0631\u0648\u0637 \u0627\u0644\u062f\u0641\u0639"}
            </Text>
            <Text style={styles.footerText}>
              {"\u064a\u064f\u0631\u062c\u0649 \u0627\u0644\u0633\u062f\u0627\u062f \u062e\u0644\u0627\u0644 30 \u064a\u0648\u0645 \u0645\u0646 \u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0625\u0635\u062f\u0627\u0631"}
            </Text>
            {data.notes ? (
              <Text style={[styles.footerText, { marginTop: 4 }]}>
                {data.notes}
              </Text>
            ) : null}
          </View>
          {data.qrDataUrl ? (
            <View style={styles.qrBlock}>
              <Image style={styles.qrImage} src={data.qrDataUrl} />
              <Text style={styles.qrLabel}>
                {"\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642 - \u0632\u0627\u062a\u0643\u0627"}
              </Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
