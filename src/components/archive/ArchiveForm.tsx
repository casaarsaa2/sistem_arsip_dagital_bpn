import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JENIS_HAK, JENIS_KEGIATAN } from "@/src/constants";
import { ArchiveType, Location } from "@/src/types";
import { collection, query, where, getDocs } from "firebase/firestore";

const archiveSchema = z.object({
  type: z.enum(["BUKU_TANAH", "WARKAH", "SURAT_UKUR"]),
  namaPemegangHak: z.string().min(1, "Nama pemegang hak wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib dipilih"),
  kelurahan: z.string().min(1, "Kelurahan wajib dipilih"),
  rak: z.string().min(1, "Nomor rak wajib diisi"),
  shaft: z.string().min(1, "Nomor shaft wajib diisi"),
  boks: z.string().optional(),
  bundel: z.string().optional(),
  keterangan: z.string().optional(),
  
  // BT fields
  noHak: z.string().optional(),
  jenisHak: z.string().optional(),
  noSU: z.string().optional(),
  tahunSU: z.string().optional(),
  
  // Warkah fields
  noDI208: z.string().optional(),
  jenisWarkah: z.string().optional(),
  jenisKegiatan: z.string().optional(),
  tahun: z.string().optional(),
});

type ArchiveFormValues = z.infer<typeof archiveSchema>;

interface ArchiveFormProps {
  onSubmit: (values: ArchiveFormValues) => void;
  initialValues?: Partial<ArchiveFormValues>;
  type: ArchiveType;
}

export function ArchiveForm({ onSubmit, initialValues, type }: ArchiveFormProps) {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [loadingLocs, setLoadingLocs] = React.useState(true);

  React.useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { db } = await (await import("../../lib/firebase")).getFirebase();
        if (!db) return;
        const q = collection(db, "locations");
        const snap = await getDocs(q);
        const locs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
        setLocations(locs);

        // If editing, map names back to IDs for the dropdowns
        if (initialValues?.kecamatan || initialValues?.kelurahan) {
          const kecId = locs.find(l => l.name === initialValues.kecamatan && l.type === 'KECAMATAN')?.id;
          const kelId = locs.find(l => l.name === initialValues.kelurahan && l.type === 'KELURAHAN')?.id;
          
          if (kecId) form.setValue('kecamatan', kecId);
          if (kelId) form.setValue('kelurahan', kelId);
        }
      } catch (err) {
        console.error("Failed to fetch locations", err);
      } finally {
        setLoadingLocs(false);
      }
    };
    fetchLocations();
  }, [initialValues]);

  const form = useForm<ArchiveFormValues>({
    resolver: zodResolver(archiveSchema),
    defaultValues: {
      type,
      namaPemegangHak: "",
      kecamatan: "",
      kelurahan: "",
      rak: "",
      shaft: "",
      ...initialValues,
    },
  });

  const selectedKecId = form.watch("kecamatan");
  const filteredKelurahans = locations.filter(l => l.type === 'KELURAHAN' && l.parentId === selectedKecId);
  const kecamatans = locations.filter(l => l.type === 'KECAMATAN');

  // Handle submit to replace IDs with names if we want to store names (easier for display in tables)
  // Or just store IDs. Let's store Names for simple display in ArchiveList.
  const handleInternalSubmit = (values: ArchiveFormValues) => {
    const kecName = locations.find(l => l.id === values.kecamatan)?.name || values.kecamatan;
    const kelName = locations.find(l => l.id === values.kelurahan)?.name || values.kelurahan;
    
    onSubmit({
      ...values,
      kecamatan: kecName,
      kelurahan: kelName
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleInternalSubmit)} className="space-y-4">
        {/* ... existing fields ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSection title="Informasi Identitas">
            <FormField
              control={form.control}
              name="namaPemegangHak"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Nama Pemegang Hak</FormLabel>
                  <FormControl>
                    <Input placeholder="NAMA LENGKAP" {...field} className="h-9 rounded bg-slate-50 border-slate-200 text-xs focus:bg-white" />
                  </FormControl>
                  <FormMessage className="text-[9px]" />
                </FormItem>
              )}
            />

            {type === 'BUKU_TANAH' && (
              <>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <FormField
                    control={form.control}
                    name="noHak"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Nomor HAK</FormLabel>
                        <FormControl>
                          <Input placeholder="5004" {...field} className="h-9 rounded bg-slate-50 border-slate-200 text-xs" />
                        </FormControl>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jenisHak"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Jenis HAK</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 rounded bg-slate-50 border-slate-200 text-xs shadow-none">
                              <SelectValue placeholder="PILIH" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-slate-200">
                            {JENIS_HAK.map(h => (
                              <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {type === 'SURAT_UKUR' && (
              <>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <FormField
                    control={form.control}
                    name="noSU"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Nomor Surat Ukur (SU)</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} className="h-9 rounded bg-slate-50 border-slate-200 text-xs" />
                        </FormControl>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tahunSU"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Tahun SU</FormLabel>
                        <FormControl>
                          <Input placeholder="2024" {...field} className="h-9 rounded bg-slate-50 border-slate-200 text-xs" />
                        </FormControl>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {type === 'WARKAH' && (
              <>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <FormField
                    control={form.control}
                    name="noDI208"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Nomor DI 208</FormLabel>
                        <FormControl>
                          <Input placeholder="101" {...field} className="h-9 rounded bg-slate-50 border-slate-200 text-xs" />
                        </FormControl>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jenisKegiatan"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Jenis Kegiatan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 rounded bg-slate-50 border-slate-200 text-xs shadow-none">
                              <SelectValue placeholder="PILIH" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-slate-200">
                            {JENIS_KEGIATAN.map(k => (
                              <SelectItem key={k} value={k} className="text-xs">{k}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </CardSection>

          <CardSection title="Lokasi Penyimpanan">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="kecamatan"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Kecamatan</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("kelurahan", ""); // Reset kelurahan when kecamatan changes
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 rounded bg-slate-50 border-slate-200 text-xs shadow-none">
                          <SelectValue placeholder={loadingLocs ? "Memuat..." : "PILIH"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-slate-200">
                        {kecamatans.map(k => (
                          <SelectItem key={k.id} value={k.id} className="text-xs">{k.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kelurahan"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Kelurahan/Desa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedKecId}>
                      <FormControl>
                        <SelectTrigger className="h-9 rounded bg-slate-50 border-slate-200 text-xs shadow-none">
                          <SelectValue placeholder={!selectedKecId ? "PILIH KEC. DULU" : "PILIH"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-slate-200">
                        {filteredKelurahans.map(k => (
                          <SelectItem key={k.id} value={k.id} className="text-xs">{k.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <FormField
                control={form.control}
                name="rak"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Rak</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-9 rounded bg-slate-50 border-slate-200 text-xs uppercase" />
                    </FormControl>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shaft"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500">Shaft</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-9 rounded bg-slate-50 border-slate-200 text-xs uppercase" />
                    </FormControl>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="boks"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] font-bold uppercase text-slate-500">
                      {type === 'BUKU_TANAH' ? 'Bundel' : type === 'SURAT_UKUR' ? 'Bundel' : 'Boks'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-9 rounded bg-slate-50 border-slate-200 text-xs uppercase" />
                    </FormControl>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />
            </div>
          </CardSection>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
           <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af] px-8 rounded text-[10px] font-bold uppercase tracking-widest text-white transition-colors h-10 shadow-lg shadow-blue-900/20">
              Simpan Data Berkas
           </Button>
        </div>
      </form>
    </Form>
  );
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
      <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
