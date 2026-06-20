import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload, Trash2, Eye, Video } from "lucide-react";

function UploadTile({ label, hint, aspect = "aspect-video" }: { label: string; hint: string; aspect?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className={`group relative ${aspect} w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 transition hover:border-primary/60 hover:bg-primary/5`}>
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{hint}</p>
          <Button size="sm" variant="outline" className="mt-1">Upload</Button>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const photos = Array.from({ length: 3 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Gallery & Media</h1>
        <p className="text-sm text-muted-foreground">High-quality visuals improve booking conversions.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <UploadTile label="Business Logo" hint="PNG / JPG, square, min 512×512" aspect="aspect-square" />
          <UploadTile label="Cover Image" hint="JPG / PNG, 1600×600 recommended" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Photo Gallery</CardTitle>
          <Button size="sm" variant="outline" className="gap-1"><Upload className="h-3.5 w-3.5" /> Add Photos</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((_, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/40">
                <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground/60" /></div>
                <div className="absolute inset-0 hidden items-center justify-center gap-1 bg-foreground/50 group-hover:flex">
                  <Button size="icon" variant="secondary" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="destructive" className="h-7 w-7"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
            <button className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary">
              <Upload className="h-5 w-5" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Video className="h-4 w-4 text-primary" /> Video Links</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="https://youtube.com/watch?v=…" />
            <Button>Add</Button>
          </div>
          <p className="text-xs text-muted-foreground">Paste YouTube or Vimeo links — they'll embed on your public profile.</p>
        </CardContent>
      </Card>
    </div>
  );
}
