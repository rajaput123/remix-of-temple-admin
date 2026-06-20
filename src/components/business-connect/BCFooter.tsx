export function BCFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row">
        <div>© {new Date().getFullYear()} Digidevalaya Business Connect</div>
        <div>Built for the temple economy.</div>
      </div>
    </footer>
  );
}
