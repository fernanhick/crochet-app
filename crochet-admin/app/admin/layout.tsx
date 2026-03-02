import Link from "next/link";

const navStyle: React.CSSProperties = {
  background: "#1a1a2e",
  color: "#fff",
  padding: "12px 24px",
  display: "flex",
  alignItems: "center",
  gap: 24,
};

const linkStyle: React.CSSProperties = {
  color: "#ffd93d",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
};

const mainStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "24px 16px",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav style={navStyle}>
        <span style={{ fontWeight: 700, fontSize: 16, marginRight: 8 }}>
          🧶 Crochet Admin
        </span>
        <Link href="/admin" style={linkStyle}>
          Feed
        </Link>
        <Link href="/admin/patterns" style={linkStyle}>
          Patterns
        </Link>
        <Link href="/admin/stats" style={linkStyle}>
          Stats
        </Link>
        <Link href="/admin/users" style={linkStyle}>
          Users
        </Link>
        <Link
          href="/admin/debug"
          style={{
            ...linkStyle,
            marginLeft: "auto",
            opacity: 0.45,
            fontWeight: 400,
            fontSize: 12,
          }}
        >
          Debug
        </Link>
      </nav>
      <main style={mainStyle}>{children}</main>
    </>
  );
}
